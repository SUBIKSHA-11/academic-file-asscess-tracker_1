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
  Star,
  FolderPlus,
  CalendarPlus,
  CheckCircle2,
  Trash2,
  MessageSquare
} from "lucide-react";
import axios from "../../api/axios";
import { getApiErrorMessage } from "../../utils/apiError";
import { openFilePreview } from "../../utils/filePreview";

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
  const [studyFolders, setStudyFolders] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [folderForm, setFolderForm] = useState({ name: "", subject: "" });
  const [planDraftByFile, setPlanDraftByFile] = useState({});
  const [discussionByFile, setDiscussionByFile] = useState({});
  const [discussionInputByFile, setDiscussionInputByFile] = useState({});
  const [openDiscussionFileId, setOpenDiscussionFileId] = useState("");
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
  const [browseToolsTab, setBrowseToolsTab] = useState("files");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("token");
        const [filesRes, recentRes, bookmarkRes, foldersRes, planRes] = await Promise.all([
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
          }),
          axios.get("/student/study-folders", {
            headers: {
              Authorization: token ? `Bearer ${token}` : ""
            }
          }),
          axios.get("/student/study-plan", {
            headers: {
              Authorization: token ? `Bearer ${token}` : ""
            }
          })
        ]);
        setFiles(filesRes.data || []);
        setRecentFiles(recentRes.data || []);
        setBookmarks(bookmarkRes.data || []);
        setStudyFolders(foldersRes.data || []);
        setStudyPlan(planRes.data || []);
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

  const handleView = async (fileId, fileName) => {
    const previewWindow = window.open("about:blank", "_blank");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        if (previewWindow) {
          previewWindow.close();
        }
        setActionMessage("Session expired. Please login again.");
        return;
      }
      const res = await axios.get(`/files/view/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const result = openFilePreview({
        blob: res.data,
        fileName,
        previewWindow
      });
      setActionMessage(result.message);
    } catch (err) {
      if (previewWindow) {
        previewWindow.close();
      }
      setActionMessage(await getApiErrorMessage(err, "Unable to open this file"));
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
      setActionMessage(await getApiErrorMessage(err, "Unable to download this file"));
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

  const handleCreateStudyFolder = async (event) => {
    event.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        "/student/study-folders",
        {
          name: folderForm.name,
          subject: folderForm.subject
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );

      const foldersRes = await axios.get("/student/study-folders", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyFolders(foldersRes.data || []);
      setFolderForm({ name: "", subject: "" });
      setActionMessage("Study folder created.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to create study folder");
    }
  };

  const handleSaveToFolder = async (fileId) => {
    try {
      if (!selectedFolderId) {
        setActionMessage("Select a study folder first.");
        return;
      }
      const token = sessionStorage.getItem("token");
      await axios.post(`/student/study-folders/${selectedFolderId}/files/${fileId}`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });

      const foldersRes = await axios.get("/student/study-folders", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyFolders(foldersRes.data || []);
      setActionMessage("File saved to study folder.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to save file to folder");
    }
  };

  const handleRemoveFromFolder = async (folderId, fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`/student/study-folders/${folderId}/files/${fileId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });

      const foldersRes = await axios.get("/student/study-folders", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyFolders(foldersRes.data || []);
      setActionMessage("File removed from study folder.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to remove file from folder");
    }
  };

  const handleAddToStudyPlan = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const draft = planDraftByFile[fileId] || {};
      await axios.post(
        `/student/study-plan/${fileId}`,
        {
          reminderAt: draft.reminderAt || undefined,
          note: draft.note || ""
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        }
      );

      const planRes = await axios.get("/student/study-plan", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyPlan(planRes.data || []);
      setPlanDraftByFile((prev) => ({ ...prev, [fileId]: { reminderAt: "", note: "" } }));
      setActionMessage("Added to study plan.");
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to add to study plan");
    }
  };

  const handleToggleStudyPlanComplete = async (item) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.patch(
        `/student/study-plan/${item._id}`,
        { isCompleted: !item.isCompleted },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      const planRes = await axios.get("/student/study-plan", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyPlan(planRes.data || []);
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to update study plan");
    }
  };

  const handleDeleteStudyPlanItem = async (itemId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`/student/study-plan/${itemId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });

      const planRes = await axios.get("/student/study-plan", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setStudyPlan(planRes.data || []);
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to delete study plan item");
    }
  };

  const loadDiscussion = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`/discussions/${fileId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setDiscussionByFile((prev) => ({ ...prev, [fileId]: res.data || [] }));
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to load discussion");
    }
  };

  const handleToggleDiscussion = async (fileId) => {
    const isOpen = openDiscussionFileId === fileId;
    if (isOpen) {
      setOpenDiscussionFileId("");
      return;
    }
    setOpenDiscussionFileId(fileId);
    if (!discussionByFile[fileId]) {
      await loadDiscussion(fileId);
    }
  };

  const handleAddDiscussionComment = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      const message = discussionInputByFile[fileId] || "";
      if (!message.trim()) {
        setActionMessage("Enter a message before posting.");
        return;
      }
      await axios.post(
        `/discussions/${fileId}`,
        { message },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      setDiscussionInputByFile((prev) => ({ ...prev, [fileId]: "" }));
      await loadDiscussion(fileId);
    } catch (err) {
      setActionMessage(err?.response?.data?.message || "Failed to post comment");
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

      <section className="rounded-xl border bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBrowseToolsTab("files")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              browseToolsTab === "files" ? "bg-[#64242F] text-white" : "border bg-white text-slate-700"
            }`}
          >
            Files
          </button>
          <button
            type="button"
            onClick={() => setBrowseToolsTab("folders")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              browseToolsTab === "folders" ? "bg-[#64242F] text-white" : "border bg-white text-slate-700"
            }`}
          >
            Personal Study Folder
          </button>
          <button
            type="button"
            onClick={() => setBrowseToolsTab("planner")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              browseToolsTab === "planner" ? "bg-[#64242F] text-white" : "border bg-white text-slate-700"
            }`}
          >
            Study Planner
          </button>
          <button
            type="button"
            onClick={() => setBrowseToolsTab("recent")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              browseToolsTab === "recent" ? "bg-[#64242F] text-white" : "border bg-white text-slate-700"
            }`}
          >
            Recent Files
          </button>
          <button
            type="button"
            onClick={() => setBrowseToolsTab("bookmarks")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              browseToolsTab === "bookmarks" ? "bg-[#64242F] text-white" : "border bg-white text-slate-700"
            }`}
          >
            Bookmarked Files
          </button>
        </div>

        {loading ? (
          <div className="rounded-lg border p-6 text-sm text-gray-500">Loading browse tools...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto pr-1">
            {browseToolsTab === "folders" && (
              <div className="space-y-3">
                <form onSubmit={handleCreateStudyFolder} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    value={folderForm.name}
                    onChange={(event) => setFolderForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Folder name"
                    required
                    className="h-9 rounded border px-2 text-sm"
                  />
                  <input
                    value={folderForm.subject}
                    onChange={(event) => setFolderForm((prev) => ({ ...prev, subject: event.target.value }))}
                    placeholder="Subject (optional)"
                    className="h-9 rounded border px-2 text-sm"
                  />
                  <button type="submit" className="h-9 rounded bg-[#64242F] text-white text-sm">
                    Create
                  </button>
                </form>

                <select
                  value={selectedFolderId}
                  onChange={(event) => setSelectedFolderId(event.target.value)}
                  className="h-9 rounded border px-2 text-sm w-full"
                >
                  <option value="">Select folder to save files</option>
                  {studyFolders.map((folder) => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name} {folder.subject ? `(${folder.subject})` : ""} - {folder.files?.length || 0} files
                    </option>
                  ))}
                </select>

                {selectedFolderId ? (
                  <div className="space-y-2">
                    {(studyFolders.find((folder) => folder._id === selectedFolderId)?.files || []).map((file) => (
                      <div key={file._id} className="flex items-center justify-between rounded border px-2 py-2">
                        <div>
                          <p className="text-xs font-medium text-slate-700">{file.fileName}</p>
                          <p className="text-[11px] text-slate-500">{file.subject || "No subject"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromFolder(selectedFolderId, file._id)}
                          className="text-xs text-rose-700 hover:text-rose-900"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Choose a folder to view/manage saved files.</p>
                )}
              </div>
            )}

            {browseToolsTab === "planner" && (
              <div className="space-y-2">
                {studyPlan.length === 0 ? (
                  <p className="text-xs text-slate-500">No study plan items yet.</p>
                ) : (
                  studyPlan.map((item) => (
                    <div key={item._id} className="rounded border px-2 py-2">
                      <p className="text-xs font-semibold text-slate-800">{item.file?.fileName || "File removed"}</p>
                      <p className="text-[11px] text-slate-500">
                        Reminder: {item.reminderAt ? formatDateTime(item.reminderAt) : "Not set"}
                      </p>
                      {item.note ? <p className="text-[11px] text-slate-600 mt-1">{item.note}</p> : null}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStudyPlanComplete(item)}
                          className={`text-xs px-2 py-1 rounded border ${
                            item.isCompleted
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <CheckCircle2 size={12} className="inline mr-1" />
                          {item.isCompleted ? "Completed" : "Mark Complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudyPlanItem(item._id)}
                          className="text-xs px-2 py-1 rounded border text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 size={12} className="inline mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {browseToolsTab === "recent" && (
              <div className="space-y-2">
                {recentFiles.length === 0 ? (
                  <p className="text-xs text-slate-500">No recent activity yet</p>
                ) : (
                  recentFiles.map((file) => (
                    <div key={file._id} className="border rounded-lg p-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {file.subject || "No subject"} • {file.lastAction} • {formatDateTime(file.lastAccessedAt)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(file._id, file.fileName)}
                          disabled={!file.canAccess || file.isAvailable === false}
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(file._id, file.fileName)}
                          disabled={!file.canAccess || file.isAvailable === false}
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {browseToolsTab === "bookmarks" && (
              <div className="space-y-2">
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-slate-500">No bookmarks yet</p>
                ) : (
                  bookmarks.map((file) => (
                    <div key={file._id} className="border rounded-lg p-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {file.subject || "No subject"} • Bookmarked on {formatDateTime(file.bookmarkedAt)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(file._id, file.fileName)}
                          disabled={!file.canAccess || file.isAvailable === false}
                          className="text-xs px-2 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(file._id, file.fileName)}
                          disabled={!file.canAccess || file.isAvailable === false}
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
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {browseToolsTab === "files" && (
        <>
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
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-800 break-words">{file.fileName}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {file.subject} • {new Date(file.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    Rating: {Number(file.avgRating || 0).toFixed(1)} / 5 ({file.totalRatings || 0} votes)
                                    {" "}• Helpful: {Number(file.helpfulPercentage || 0).toFixed(0)}%
                                  </p>
                                </div>

                                <div className="flex flex-col gap-3 md:max-w-[48%] md:items-end">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${chipClass}`}>
                                      {cat.label}
                                    </span>
                                    <span className="text-xs bg-[#DFD9D8] text-[#64242F] px-2 py-1 rounded-full">
                                      {file.downloadCount || 0} downloads
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleBookmark(file._id)}
                                      className={`inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border ${
                                        file.isBookmarked ? "bg-yellow-100 border-yellow-300" : "hover:bg-gray-100"
                                      }`}
                                    >
                                      <Star size={14} /> {file.isBookmarked ? "Starred" : "Star"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveToFolder(file._id)}
                                      className="inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border hover:bg-gray-100"
                                    >
                                      <FolderPlus size={14} /> Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenFeedback(file._id)}
                                      className="inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border hover:bg-gray-100"
                                    >
                                      Rate
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleDiscussion(file._id)}
                                      className="inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border hover:bg-gray-100"
                                    >
                                      <MessageSquare size={14} />
                                      Chat
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleView(file._id, file.fileName)}
                                      disabled={!file.canAccess || file.isAvailable === false}
                                      className="inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                                    >
                                      <Eye size={14} /> View
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownload(file._id, file.fileName)}
                                      disabled={!file.canAccess || file.isAvailable === false}
                                      className="inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                                    >
                                      <Download size={14} /> Download
                                    </button>
                                    {!file.canAccess && (
                                      <button
                                        type="button"
                                        onClick={() => handleRequestAccess(file._id)}
                                        className="col-span-2 inline-flex min-h-9 items-center justify-center gap-1 text-xs px-2 py-2 rounded border border-[#64242F] text-[#64242F] hover:bg-[#DFD9D8] sm:col-span-3 md:col-auto"
                                      >
                                        Request Access
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 grid gap-2 rounded border bg-slate-50 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                                <input
                                  type="datetime-local"
                                  value={planDraftByFile[file._id]?.reminderAt || ""}
                                  onChange={(event) =>
                                    setPlanDraftByFile((prev) => ({
                                      ...prev,
                                      [file._id]: {
                                        ...prev[file._id],
                                        reminderAt: event.target.value
                                      }
                                    }))
                                  }
                                  className="h-9 w-full rounded border px-2 text-xs"
                                />
                                <input
                                  type="text"
                                  value={planDraftByFile[file._id]?.note || ""}
                                  onChange={(event) =>
                                    setPlanDraftByFile((prev) => ({
                                      ...prev,
                                      [file._id]: {
                                        ...prev[file._id],
                                        note: event.target.value
                                      }
                                    }))
                                  }
                                  placeholder="Study note"
                                  className="h-9 w-full rounded border px-2 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddToStudyPlan(file._id)}
                                  className="inline-flex h-9 items-center justify-center gap-1 rounded border px-3 text-xs hover:bg-white"
                                >
                                  <CalendarPlus size={12} />
                                  Add Plan
                                </button>
                              </div>

                              {openDiscussionFileId === file._id && (
                                <div className="mt-3 rounded-lg border bg-white p-3">
                                  <p className="mb-2 text-xs font-semibold text-slate-700">Discussion</p>
                                  <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                                    {(discussionByFile[file._id] || []).length > 0 ? (
                                      (discussionByFile[file._id] || []).map((comment) => (
                                        <div key={comment._id} className="rounded border px-2 py-2">
                                          <p className="text-xs font-semibold text-slate-800">
                                            {comment.user?.name || "User"} ({comment.user?.role || comment.role})
                                          </p>
                                          <p className="mt-1 text-xs text-slate-700">{comment.message}</p>
                                          <p className="mt-1 text-[11px] text-slate-500">
                                            {formatDateTime(comment.createdAt)}
                                          </p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-slate-500">No comments yet. Ask your doubt here.</p>
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <input
                                      type="text"
                                      value={discussionInputByFile[file._id] || ""}
                                      onChange={(event) =>
                                        setDiscussionInputByFile((prev) => ({
                                          ...prev,
                                          [file._id]: event.target.value
                                        }))
                                      }
                                      placeholder="Ask doubt / reply..."
                                      className="h-9 w-full rounded border px-2 text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddDiscussionComment(file._id)}
                                      className="h-9 rounded bg-[#64242F] px-3 text-xs text-white"
                                    >
                                      Post
                                    </button>
                                  </div>
                                </div>
                              )}

                              {activeFeedbackFileId === file._id && (
                                <div className="mt-3 rounded-lg border bg-white p-3">
                                  <p className="text-xs font-semibold text-slate-700 mb-2">Your Feedback</p>
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
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
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
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
                                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
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
        </>
      )}
    </div>
  );
}

export default StudentBrowseFiles;
