import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchLogs();
  }, [action, fromDate, toDate, currentPage]);

  const fetchLogs = async () => {
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
  };

  return (
    <div>

      <h2 className="text-2xl font-semibold mb-6">
        Access Logs
      </h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">

        <select
          value={action}
          onChange={(e) => {
            setCurrentPage(1);
            setAction(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="ALL">All Actions</option>
          <option value="UPLOAD">UPLOAD</option>
          <option value="DOWNLOAD">DOWNLOAD</option>
          <option value="VIEW">VIEW</option>
          <option value="DELETE">DELETE</option>
        </select>

        <div className="flex flex-col">
  <label className="text-sm mb-1">From Date</label>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => {
      setCurrentPage(1);
      setFromDate(e.target.value);
    }}
    className="border p-2 rounded"
  />
</div>

<div className="flex flex-col">
  <label className="text-sm mb-1">To Date</label>
  <input
    type="date"
    value={toDate}
    onChange={(e) => {
      setCurrentPage(1);
      setToDate(e.target.value);
    }}
    className="border p-2 rounded"
  />
</div>


      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b hover:bg-gray-50">
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
            ))}
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
