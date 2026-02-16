import { useEffect, useState } from "react";
import axios from "../api/axios";

function AccessLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get("/admin/logs")
      .then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <h2>Access Logs</h2>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>File</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.user?.name}</td>
              <td>{log.action}</td>
              <td>{log.file?.fileName}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccessLogs;
