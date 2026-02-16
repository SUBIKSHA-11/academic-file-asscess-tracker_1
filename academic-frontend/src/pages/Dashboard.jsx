import { useEffect, useState } from "react";
import axios from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("/admin/stats")
      .then(res => setStats(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Users: {stats.totalUsers}</p>
    </div>
  );
}

export default Dashboard;
