import { useEffect, useState } from "react";
import axios from "../api/axios";

function Suspicious() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get("/admin/alerts")
      .then(res => setAlerts(res.data));
  }, []);

  return (
    <div>
      <h2>Suspicious Activity</h2>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Reason</th>
            <th>Severity</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert._id}>
              <td>{alert.user?.name}</td>
              <td>{alert.reason}</td>
              <td>{alert.severity}</td>
              <td>{new Date(alert.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Suspicious;
