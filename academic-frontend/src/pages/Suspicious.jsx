import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { AlertTriangle, Search, CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import Pagination from "../components/Pagination";

function Suspicious() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get("/admin/alerts", {
        params: {
          severity,
          from: fromDate,
          to: toDate
        }
      });

      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [severity, fromDate, toDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAlerts();
  }, [fetchAlerts]);

  const markReviewed = async (id) => {
    await axios.patch(`/admin/alerts/${id}/review`);
    fetchAlerts();
  };

  const markPending = async (id) => {
    await axios.patch(`/admin/alerts/${id}/reopen`);
    fetchAlerts();
  };

  const deleteAlert = async (id) => {
    await axios.delete(`/admin/alerts/${id}`);
    fetchAlerts();
  };

  const filteredAlerts = alerts.filter((alert) =>
    alert.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    alert.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAlerts = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredAlerts.slice(start, start + rowsPerPage);
  }, [filteredAlerts, safeCurrentPage]);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "HIGH":
        return "bg-[#FC8F8F] text-[#64242F]";
      case "MEDIUM":
        return "bg-[#DFD9D8] text-[#0C3C01]";
      case "LOW":
        return "bg-[#B8E3E9] text-[#0B2E33]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Suspicious Activity
      </h2>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">

        {/* Search */}
        <div className="flex h-10 min-w-[260px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search user or reason..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">All Severity</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {/* Date Filters */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
        />

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-[#DFD9D8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#0C3C01] text-[#F1F2ED]">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedAlerts.map((alert, index) => (
              <tr
                key={alert._id}
                className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-slate-50`}
              >
                <td className="p-3 font-medium">
                  {alert.user?.name}
                </td>

                <td className="p-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  {alert.reason}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityStyle(alert.severity)}`}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">
                  {alert.reviewed ? (
                    <span className="text-green-600 font-semibold">
                      Reviewed
                    </span>
                  ) : (
                    <span className="text-[#B44446] font-semibold">
                      Pending
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>

                <td className="p-3 flex justify-center gap-4">

                  {!alert.reviewed ? (
                    <button
                      onClick={() => markReviewed(alert._id)}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as Reviewed"
                    >
                      <CheckCircle size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => markPending(alert._id)}
                      className="text-amber-600 hover:text-amber-800"
                      title="Mark as Pending"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Alert"
                  >
                    <Trash2 size={18} />
                  </button>

                </td>

              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td className="p-4 text-center text-slate-500" colSpan={6}>
                  No suspicious activity found.
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

export default Suspicious;
