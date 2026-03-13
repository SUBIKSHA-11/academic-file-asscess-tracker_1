import { useCallback, useEffect, useState } from "react";
import axios from "../../api/axios";
import Pagination from "../../components/Pagination";

function FacultyAccessLogs() {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get("/faculty/logs", {
        params: {
          action,
          from: fromDate,
          to: toDate,
          page: currentPage,
          limit
        }
      });

      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch faculty logs", error);
    }
  }, [action, fromDate, toDate, currentPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Access Logs (My Uploaded Files)</h2>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <select
          value={action}
          onChange={(event) => {
            setCurrentPage(1);
            setAction(event.target.value);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="ALL">All Actions</option>
          <option value="UPLOAD">UPLOAD</option>
          <option value="DOWNLOAD">DOWNLOAD</option>
          <option value="VIEW">VIEW</option>
          <option value="DELETE">DELETE</option>
        </select>

        <div className="flex min-w-[170px] flex-col">
          <label className="mb-1 text-sm">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setCurrentPage(1);
              setFromDate(event.target.value);
            }}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          />
        </div>

        <div className="flex min-w-[170px] flex-col">
          <label className="mb-1 text-sm">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setCurrentPage(1);
              setToDate(event.target.value);
            }}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[760px] text-sm">
          <thead className="sticky top-0 bg-[#0B2E33] text-white">
            <tr>
              <th className="whitespace-nowrap p-3 text-left">User</th>
              <th className="whitespace-nowrap p-3 text-left">Role</th>
              <th className="whitespace-nowrap p-3 text-left">Action</th>
              <th className="p-3 text-left">File</th>
              <th className="whitespace-nowrap p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr
                  key={log._id}
                  className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-slate-50`}
                >
                  <td className="whitespace-nowrap p-3">{log.user?.name || "-"}</td>
                  <td className="whitespace-nowrap p-3">{log.user?.role || "-"}</td>
                  <td className="whitespace-nowrap p-3 font-semibold">{log.action}</td>
                  <td className="min-w-[220px] p-3">{log.file?.fileName || "-"}</td>
                  <td className="whitespace-nowrap p-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No logs found for your uploaded files.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

export default FacultyAccessLogs;
