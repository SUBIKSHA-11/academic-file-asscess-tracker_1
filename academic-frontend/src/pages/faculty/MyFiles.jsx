import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Search, Eye, Download, MessageSquare, X } from "lucide-react";
import Pagination from "../../components/Pagination";

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [discussionFile, setDiscussionFile] = useState(null);
  const [discussionComments, setDiscussionComments] = useState([]);
  const [discussionInput, setDiscussionInput] = useState("");
  const rowsPerPage = 8;

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  const fetchMyFiles = useCallback(async () => {
    try {
      const res = await axios.get("/faculty/my-files", authConfig);
      setFiles(res.data || []);
    } catch (error) {
      console.error("Failed to fetch faculty files", error);
    }
  }, [authConfig]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMyFiles();
  }, [fetchMyFiles]);

  const handleView = async (id) => {
    try {
      const res = await axios.get(`/files/view/${id}`, {
        ...authConfig,
        responseType: "blob"
      });
      const fileURL = window.URL.createObjectURL(res.data);
      window.open(fileURL, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("View failed", error);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const res = await axios.get(`/files/download/${id}`, {
        ...authConfig,
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(res.data);
      const disposition = res.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const resolvedName = match?.[1] || fileName;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", resolvedName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const openDiscussion = async (file) => {
    try {
      const res = await axios.get(`/discussions/${file._id}`, authConfig);
      setDiscussionComments(res.data || []);
      setDiscussionFile(file);
      setDiscussionInput("");
      setDiscussionOpen(true);
    } catch (error) {
      console.error("Failed to load discussion", error);
    }
  };

  const postDiscussionComment = async () => {
    try {
      if (!discussionFile || !discussionInput.trim()) return;
      await axios.post(
        `/discussions/${discussionFile._id}`,
        { message: discussionInput },
        authConfig
      );
      const res = await axios.get(`/discussions/${discussionFile._id}`, authConfig);
      setDiscussionComments(res.data || []);
      setDiscussionInput("");
    } catch (error) {
      console.error("Failed to post discussion comment", error);
    }
  };

  const filteredFiles = files.filter((file) => {
    const bySearch = file.fileName.toLowerCase().includes(search.toLowerCase());
    const byCategory = category ? file.category === category : true;
    return bySearch && byCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedFiles = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredFiles.slice(start, start + rowsPerPage);
  }, [filteredFiles, safeCurrentPage]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">My Files</h2>
        <p className="mt-1 text-slate-600">
          Uploaded files stay pending until admin approves and publishes them for students.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 md:max-w-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search file name..."
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm md:w-auto"
          >
            <option value="">All Categories</option>
            <option value="NOTES">NOTES</option>
            <option value="LAB">LAB</option>
            <option value="QUESTION_PAPER">QUESTION_PAPER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="MARKSHEET">MARKSHEET</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm min-w-[980px]">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              <th className="p-3 text-left">File Name</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Semester</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-left">Access</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">View Count</th>
              <th className="p-3 text-left">Download Count</th>
              <th className="p-3 text-center">View</th>
              <th className="p-3 text-center">Download</th>
              <th className="p-3 text-center">Discussion</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFiles.length > 0 ? (
                paginatedFiles.map((file, index) => (
                <tr key={file._id} className={`border-t border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                  <td className="p-3">{file.fileName}</td>
                  <td className="p-3">{file.subject}</td>
                  <td className="p-3">{file.semester}</td>
                  <td className="p-3">{file.department}</td>
                  <td className="p-3">{file.uploadedBy?.name || "-"}</td>
                  <td className="p-3">{file.sensitivity}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        file.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : file.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {file.status || "APPROVED"}
                    </span>
                  </td>
                  <td className="p-3">{file.viewCount || 0}</td>
                  <td className="p-3">{file.downloadCount || 0}</td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleView(file._id)}
                      className="text-[#4F7C82] hover:text-[#0B2E33]"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDownload(file._id, file.fileName)}
                      className="text-[#4F7C82] hover:text-[#0B2E33]"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDiscussion(file)}
                      className="text-[#4F7C82] hover:text-[#0B2E33]"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="p-6 text-center text-slate-500">
                  No files found. Try a different filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {discussionOpen && discussionFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Discussion</h3>
                <p className="text-xs text-slate-500">{discussionFile.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setDiscussionOpen(false)}
                className="rounded border p-1 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto p-4">
              {discussionComments.length > 0 ? (
                discussionComments.map((comment) => (
                  <div key={comment._id} className="rounded border px-3 py-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {comment.user?.name || "User"} ({comment.user?.role || comment.role})
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{comment.message}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No comments yet.</p>
              )}
            </div>
            <div className="border-t p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={discussionInput}
                  onChange={(event) => setDiscussionInput(event.target.value)}
                  placeholder="Reply to student doubts..."
                  className="h-10 w-full rounded border px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={postDiscussionComment}
                  className="h-10 rounded bg-[#0B2E33] px-4 text-sm text-white"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyFiles;
