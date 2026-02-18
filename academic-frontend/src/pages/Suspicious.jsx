import { useEffect, useState } from "react";
import axios from "../api/axios";
import { AlertTriangle } from "lucide-react";

function Suspicious() {

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    high: 0,
    medium: 0,
    low: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("/admin/alerts");
      setAlerts(res.data.alerts);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>

      <h2 className="text-2xl font-semibold mb-6">
        Security Alerts
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <Card label="High Alerts" value={summary.high} color="bg-red-500" />
        <Card label="Medium Alerts" value={summary.medium} color="bg-orange-500" />
        <Card label="Low Alerts" value={summary.low} color="bg-yellow-500" />
        <Card label="Users Flagged" value={summary.uniqueUsers} color="bg-blue-500" />

      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert._id}
                className={`border-b hover:bg-gray-50 ${
                  alert.severity === "HIGH" ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3 font-medium">
                  {alert.user?.name}
                </td>

                <td className="p-3">
                  {alert.user?.role}
                </td>

                <td className="p-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  {alert.reason}
                </td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.severity === "HIGH"
                      ? "bg-red-100 text-red-700"
                      : alert.severity === "MEDIUM"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {alert.severity}
                  </span>
                </td>

                <td className="p-3">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-xl shadow-md`}>
      <h4 className="text-sm opacity-90">{label}</h4>
      <p className="text-2xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

export default Suspicious;
