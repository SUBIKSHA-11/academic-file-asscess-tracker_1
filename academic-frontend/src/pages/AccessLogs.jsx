import { useCallback, useEffect, useState } from "react";
import axios from "../api/axios";
import Pagination from "../components/Pagination";

function AccessLogs() {

  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get("/admin/logs", {
        params: {
          action,
          from: fromDate,
          to: toDate,
          page: currentPage,
          limit
        }
      });

      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);

    } catch (err) {
      console.error(err);
    }
  }, [action, fromDate, toDate, currentPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div>

      <h2 className="mb-6 text-2xl font-semibold">
        Access Logs
      </h2>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">

        <div className="w-full sm:w-auto">
          <select
            value={action}
            onChange={(e) => {
              setCurrentPage(1);
              setAction(e.target.value);
            }}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:min-w-[170px]"
          >
            <option value="ALL">All Actions</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="DOWNLOAD">DOWNLOAD</option>
            <option value="VIEW">VIEW</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="flex w-full flex-col sm:min-w-[170px] sm:flex-1 md:flex-none">
  <label className="text-sm mb-1">From Date</label>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => {
      setCurrentPage(1);
      setFromDate(e.target.value);
    }}
    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
  />
</div>

        <div className="flex w-full flex-col sm:min-w-[170px] sm:flex-1 md:flex-none">
  <label className="text-sm mb-1">To Date</label>
  <input
    type="date"
    value={toDate}
    onChange={(e) => {
      setCurrentPage(1);
      setToDate(e.target.value);
    }}
    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
  />
</div>


      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#DFD9D8] bg-white shadow-md">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="sticky top-0 bg-[#0C3C01] text-[#F1F2ED]">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? logs.map((log, index) => (
              <tr key={log._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-slate-50`}>
                <td className="p-3">{log.user?.name}</td>
                <td className="p-3">{log.user?.role}</td>
                <td className="p-3 font-semibold">
                  {log.action}
                </td>
                <td className="p-3">{log.file?.fileName}</td>
                <td className="p-3">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={5}>
                  No logs found. Adjust filters or check back later.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      

    </div>
  );
}

export default AccessLogs;
