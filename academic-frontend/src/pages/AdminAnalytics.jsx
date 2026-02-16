import { useEffect, useState } from "react";
import axios from "../api/axios";

function AdminAnalytics() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("/admin/stats")
      .then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Total Users: {stats.totalUsers}</p>
      <p>Total Files: {stats.totalFiles}</p>
    </div>
  );
}

export default AdminAnalytics;
