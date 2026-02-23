import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import Pagination from "../components/Pagination";

function Approvals() {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fetchPendingFiles = useCallback(async () => {
    try {
      const res = await axios.get("/files/pending");
      setPendingFiles(res.data || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load approvals");
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(pendingFiles.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPendingFiles = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return pendingFiles.slice(start, start + rowsPerPage);
  }, [pendingFiles, safeCurrentPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPendingFiles();
  }, [fetchPendingFiles]);

  const handleApprove = async (id) => {
    try {
      setMessage("");
      await axios.patch(`/files/${id}/approve`);
      setMessage("File approved successfully.");
      setPendingFiles((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (id) => {
    try {
      setMessage("");
      await axios.patch(`/files/${id}/reject`, { reason: "Rejected by admin" });
      setMessage("File rejected.");
      setPendingFiles((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Reject failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Approval Queue</h2>
        <p className="mt-1 text-slate-600">Review and publish faculty uploads for students.</p>
      </div>

      {message && (
        <div className="rounded-lg border border-[#DFD9D8] bg-[#F8F4F4] px-4 py-3 text-sm text-[#64242F]">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-[#DFD9D8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0C3C01] text-[#F1F2ED]">
            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Semester</th>
              <th className="p-3 text-left">Sensitivity</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPendingFiles.length > 0 ? (
              paginatedPendingFiles.map((file, index) => (
                <tr key={file._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-slate-50`}>
                  <td className="p-3">{file.fileName}</td>
                  <td className="p-3">{file.category}</td>
                  <td className="p-3">{file.department}</td>
                  <td className="p-3">{file.semester}</td>
                  <td className="p-3">{file.sensitivity}</td>
                  <td className="p-3">{file.uploadedBy?.name || "-"}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(file._id)}
                        className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(file._id)}
                        className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={7}>
                  No pending approvals. New uploads will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

export default Approvals;
