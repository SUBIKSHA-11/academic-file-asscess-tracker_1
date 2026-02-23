import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Download,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Folder,
  FlaskConical,
  Star
} from "lucide-react";
import axios from "../../api/axios";

const CATEGORY_ORDER = ["NOTES", "ASSIGNMENT", "LAB", "OTHER"];
const CATEGORY_LABELS = {
  NOTES: "Notes",
  ASSIGNMENT: "Assignments",
  LAB: "Lab",
  OTHER: "Other"
};

const CATEGORY_STYLES = {
  NOTES: {
    chip: "bg-blue-100 text-blue-700",
    icon: BookOpen
  },
  ASSIGNMENT: {
    chip: "bg-green-100 text-green-700",
    icon: ClipboardCheck
  },
  LAB: {
    chip: "bg-cyan-100 text-cyan-700",
    icon: FlaskConical
  },
  OTHER: {
    chip: "bg-gray-100 text-gray-700",
    icon: Folder
  }
};

const normalizeCategory = (rawCategory) => {
  if (!rawCategory) return "OTHER";
  const normalized = String(rawCategory).toUpperCase();
  if (normalized === "NOTES") return "NOTES";
  if (normalized === "ASSIGNMENT") return "ASSIGNMENT";
  if (normalized === "LAB" || normalized.includes("LAB")) return "LAB";
  return "OTHER";
};
const formatDateTime = (raw) => {
  if (!raw) return "Unknown time";
  return new Date(raw).toLocaleString();
};

function StudentBrowseFiles() {
  const [files, setFiles] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeFeedbackFileId, setActiveFeedbackFileId] = useState("");
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    isHelpful: true,
    comment: ""
  });

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [openCategory, setOpenCategory] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("token");
        const [filesRes, recentRes, bookmarkRes] = await Promise.all([
          axios.get("/student/files", {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
          }),
          axios.get("/student/recent-files", {
            headers: {
              Authorization: token ? `Bearer ${token}` : ""
            }
          }),
          axios.get("/student/bookmarks", {
            headers: {
              Authorization: token ? `Bearer ${token}` : ""
            }
          })
        ]);
        setFiles(filesRes.data || []);
        setRecentFiles(recentRes.data || []);
        setBookmarks(bookmarkRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) => {
      const fileName = file.fileName?.toLowerCase() || "";
      const subject = file.subject?.toLowerCase() || "";
      return fileName.includes(query) || subject.includes(query);
    });
  }, [files, search]);

  const grouped = useMemo(() => {
    return filteredFiles.reduce((acc, file) => {
      const department = file.department?.name || "Unknown Department";
      const semester = `Semester ${file.semester}`;
      const category = normalizeCategory(file.category);

      if (!acc[department]) acc[department] = {};
      if (!acc[department][semester]) acc[department][semester] = {};
      if (!acc[department][semester][category]) acc[department][semester][category] = [];

      acc[department][semester][category].push(file);
      return acc;
    }, {});
  }, [filteredFiles]);

  const departments = useMemo(() => {
    return Object.entries(grouped)
      .map(([name, semesters]) => ({
        name,
        count: Object.values(semesters).reduce(
          (sum, categoryMap) =>
            sum + Object.values(categoryMap).reduce((s, list) => s + list.length, 0),
          0
        )
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [grouped]);

  const semesters = useMemo(() => {
    if (!selectedDepartment || !grouped[selectedDepartment]) return [];
    return Object.entries(grouped[selectedDepartment])
      .map(([name, categories]) => ({
        name,
        count: Object.values(categories).reduce((sum, list) => sum + list.length, 0)
      }))
      .sort((a, b) => Number(a.name.replace("Semester ", "")) - Number(b.name.replace("Semester ", "")));
  }, [grouped, selectedDepartment]);

  const categories = useMemo(() => {
    if (!selectedDepartment || !selectedSemester) return [];
    const categoryMap = grouped[selectedDepartment]?.[selectedSemester] || {};
    return CATEGORY_ORDER.map((cat) => ({
      key: cat,
      label: CATEGORY_LABELS[cat] || cat,
      count: categoryMap[cat]?.length || 0
    }));
  }, [grouped, selectedDepartment, selectedSemester]);

  const handleView = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setActionMessage("Session expired. Please login again.");
        return;
      }
      const viewUrl = `${axios.defaults.baseURL}/files/view/${fileId}?token=${encodeURIComponent(token)}`;
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Unable to open this file");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`/files/download/${fileId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        responseType: "blob"
      });
      const blobUrl = URL.createObjectURL(res.data);
      const disposition = res.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const resolvedName = match?.[1] || fileName;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", resolvedName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Unable to download this file");
    }
  };

  const handleBookmark = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        `/student/bookmarks/${fileId}`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );
      setFiles((prev) =>
        prev.map((file) =>
          file._id === fileId ? { ...file, isBookmarked: Boolean(res.data.bookmarked) } : file
        )
      );

      const bookmarksRes = await axios.get("/student/bookmarks", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setBookmarks(bookmarksRes.data || []);
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Bookmark update failed");
    }
  };

  const handleRequestAccess = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `/student/access-requests/${fileId}`,
        { reason: "Need this file for academic reference", durationMinutes: 120 },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );
      setActionMessage("Access request submitted");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to submit access request");
    }
  };

  const handleOpenFeedback = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`/file/${fileId}/ratings`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setActiveFeedbackFileId(fileId);
      if (res.data?.myFeedback) {
        setFeedbackForm({
          rating: res.data.myFeedback.rating || 5,
          isHelpful: Boolean(res.data.myFeedback.isHelpful),
          comment: res.data.myFeedback.comment || ""
        });
      } else {
        setFeedbackForm({
          rating: 5,
          isHelpful: true,
          comment: ""
        });
      }
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Unable to load feedback form");
    }
  };

  const handleSubmitFeedback = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        "/feedback",
        {
          fileId,
          rating: Number(feedbackForm.rating),
          isHelpful: Boolean(feedbackForm.isHelpful),
          comment: feedbackForm.comment
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );

      setFiles((prev) =>
        prev.map((file) =>
          file._id === fileId
            ? {
              ...file,
              avgRating: res.data.avgRating,
              totalRatings: res.data.totalRatings,
              helpfulPercentage: res.data.helpfulPercentage
            }
            : file
        )
      );
      setActionMessage("Feedback saved.");
      setActiveFeedbackFileId("");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to save feedback");
    }
  };

  const goBack = () => {
    if (selectedSemester) {
      setSelectedSemester("");
      setOpenCategory("");
      return;
    }
    if (selectedDepartment) {
      setSelectedDepartment("");
      setOpenCategory("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#64242F] text-[#DFD9D8] p-6 shadow-md">
        <h1 className="text-2xl font-bold">Browse Files</h1>
        <p className="text-[#FC8F8F] mt-1">
          Discover academic resources faster: pick department, semester, and category.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by file name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span className="font-medium">Path:</span>
          <span>{selectedDepartment || "Department"}</span>
          <ChevronRight size={12} />
          <span>{selectedSemester || "Semester"}</span>
          <ChevronRight size={12} />
          <span>{openCategory ? CATEGORY_LABELS[openCategory] : "Category"}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-[#E6C7CC] bg-[#FFF6F7] px-4 py-3 text-sm text-[#64242F]">
          {actionMessage}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">Recent Files</p>
            {recentFiles.length === 0 ? (
              <p className="text-xs text-slate-500">No recent activity yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentFiles.map((file) => (
                  <div key={file._id} className="border rounded-lg p-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {file.subject || "No subject"} • {file.lastAction} • {formatDateTime(file.lastAccessedAt)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(file._id)}
                        disabled={!file.canAccess}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(file._id, file.fileName)}
                        disabled={!file.canAccess}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentFiles.length > 3 && (
              <p className="mt-2 text-[11px] text-slate-500">Showing 3 at a time. Scroll for more.</p>
            )}
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">Bookmarked Files</p>
            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-500">No bookmarks yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bookmarks.map((file) => (
                  <div key={file._id} className="border rounded-lg p-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {file.subject || "No subject"} • Bookmarked on {formatDateTime(file.bookmarkedAt)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(file._id)}
                        disabled={!file.canAccess}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(file._id, file.fileName)}
                        disabled={!file.canAccess}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookmark(file._id)}
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
                      >
                        Remove Star
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {bookmarks.length > 3 && (
              <p className="mt-2 text-[11px] text-slate-500">Showing 3 at a time. Scroll for more.</p>
            )}
          </div>
        </div>
      )}

      {loading && <div className="bg-white rounded-xl border p-6 text-gray-500">Loading files...</div>}
      {!loading && error && <div className="bg-white rounded-xl border p-6 text-red-600">{error}</div>}
      {!loading && !error && departments.length === 0 && (
        <div className="bg-white rounded-xl border p-6 text-gray-600">No files available</div>
      )}

      {!loading && !error && departments.length > 0 && (
        <div className="space-y-4">
          {(selectedDepartment || selectedSemester || openCategory) && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {!selectedDepartment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => {
                    setSelectedDepartment(dept.name);
                    setSelectedSemester("");
                    setOpenCategory("");
                  }}
                  className="text-left bg-white rounded-xl border shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-lg font-semibold text-slate-800">{dept.name}</p>
                  <p className="text-xs mt-2 inline-block bg-[#DFD9D8] text-[#64242F] px-2 py-1 rounded-full">
                    {dept.count} files
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedDepartment && !selectedSemester && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {semesters.map((sem) => (
                <button
                  key={sem.name}
                  type="button"
                  onClick={() => {
                    setSelectedSemester(sem.name);
                    setOpenCategory("");
                  }}
                  className="text-left bg-white rounded-xl border shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-lg font-semibold text-slate-800">{sem.name}</p>
                  <p className="text-xs mt-2 inline-block bg-[#DFD9D8] text-[#64242F] px-2 py-1 rounded-full">
                    {sem.count} files
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedDepartment && selectedSemester && (
            <div className="space-y-3">
              {categories.map((cat) => {
                const filesInCategory =
                  grouped[selectedDepartment]?.[selectedSemester]?.[cat.key] || [];
                const isOpen = openCategory === cat.key;
                const Icon = CATEGORY_STYLES[cat.key]?.icon || Folder;
                const chipClass = CATEGORY_STYLES[cat.key]?.chip || "bg-gray-100 text-gray-700";

                return (
                  <div
                    key={cat.key}
                    className="bg-white rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenCategory((prev) => (prev === cat.key ? "" : cat.key))}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} className="text-slate-700" />
                        <p className="text-base font-semibold text-slate-800">{cat.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${chipClass}`}>
                          {cat.count} files
                        </span>
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100 px-4 pb-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {filesInCategory.length > 0 ? (
                          filesInCategory.map((file) => (
                            <div
                              key={file._id}
                              className="border rounded-lg p-3 hover:bg-gray-50 transition"
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                  <p className="font-medium text-gray-800 break-words">{file.fileName}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.subject} • {new Date(file.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    Rating: {Number(file.avgRating || 0).toFixed(1)} / 5 ({file.totalRatings || 0} votes)
                                    {" "}• Helpful: {Number(file.helpfulPercentage || 0).toFixed(0)}%
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${chipClass}`}>
                                    {cat.label}
                                  </span>
                                  <span className="text-xs bg-[#DFD9D8] text-[#64242F] px-2 py-1 rounded-full">
                                    {file.downloadCount || 0} downloads
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleBookmark(file._id)}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                                      file.isBookmarked ? "bg-yellow-100 border-yellow-300" : "hover:bg-gray-100"
                                    }`}
                                  >
                                    <Star size={14} /> {file.isBookmarked ? "Starred" : "Star"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFeedback(file._id)}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-100"
                                  >
                                    Rate
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleView(file._id)}
                                    disabled={!file.canAccess}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-100"
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(file._id, file.fileName)}
                                    disabled={!file.canAccess}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-100"
                                  >
                                    <Download size={14} /> Download
                                  </button>
                                  {!file.canAccess && (
                                    <button
                                      type="button"
                                      onClick={() => handleRequestAccess(file._id)}
                                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-[#64242F] text-[#64242F] hover:bg-[#DFD9D8]"
                                    >
                                      Request Access
                                    </button>
                                  )}
                                </div>
                              </div>

                              {activeFeedbackFileId === file._id && (
                                <div className="mt-3 rounded-lg border bg-white p-3">
                                  <p className="text-xs font-semibold text-slate-700 mb-2">Your Feedback</p>
                                  <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: value }))}
                                        className={`text-sm rounded px-2 py-1 border ${
                                          Number(feedbackForm.rating) >= value
                                            ? "bg-amber-100 border-amber-300 text-amber-800"
                                            : "bg-white text-slate-600"
                                        }`}
                                      >
                                        {value}★
                                      </button>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <button
                                      type="button"
                                      onClick={() => setFeedbackForm((prev) => ({ ...prev, isHelpful: true }))}
                                      className={`text-xs rounded border px-2 py-1 ${
                                        feedbackForm.isHelpful
                                          ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                          : "bg-white text-slate-600"
                                      }`}
                                    >
                                      Helpful
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFeedbackForm((prev) => ({ ...prev, isHelpful: false }))}
                                      className={`text-xs rounded border px-2 py-1 ${
                                        !feedbackForm.isHelpful
                                          ? "bg-rose-100 border-rose-300 text-rose-700"
                                          : "bg-white text-slate-600"
                                      }`}
                                    >
                                      Not Helpful
                                    </button>
                                  </div>
                                  <textarea
                                    value={feedbackForm.comment}
                                    onChange={(e) =>
                                      setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))
                                    }
                                    rows={2}
                                    placeholder="Optional comment"
                                    className="w-full rounded border px-2 py-1 text-xs"
                                  />
                                  <div className="mt-2 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSubmitFeedback(file._id)}
                                      className="rounded bg-[#64242F] px-3 py-1 text-xs text-white"
                                    >
                                      Save Feedback
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveFeedbackFileId("")}
                                      className="rounded border px-3 py-1 text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">No files added yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentBrowseFiles;
