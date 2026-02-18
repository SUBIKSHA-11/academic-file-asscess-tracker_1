import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  BarChart,
  PieChart,
  Users,
  FileText,
  Download
} from "lucide-react";
import {
  Bar,
  Pie,
  Doughnut
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
const [topFiles, setTopFiles] = useState([]);
const [recentActivity, setRecentActivity] = useState([]);
const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
  try {
    const statsRes = await axios.get("/admin/stats");
    const catRes = await axios.get("/admin/category-distribution");
    const deptRes = await axios.get("/admin/department-distribution");
    const topFilesRes = await axios.get("/admin/top-files");
    const recentRes = await axios.get("/admin/recent-activity");
    const monthlyRes = await axios.get("/admin/monthly-uploads");

    setStats(statsRes.data);
    setCategoryData(catRes.data);
    setDepartmentData(deptRes.data);
    setTopFiles(topFilesRes.data);
    setRecentActivity(recentRes.data);
    setMonthlyData(monthlyRes.data);

  } catch (err) {
    console.error(err);
  }
};


  const categoryChart = {
    labels: categoryData.map((c) => c._id),
    datasets: [
      {
        data: categoryData.map((c) => c.count),
        backgroundColor: [
          "#f97316",
          "#ef4444",
          "#fb923c",
          "#dc2626",
          "#facc15"
        ]
      }
    ]
  };

  const departmentChart = {
    labels: departmentData.map((d) => d._id),
    datasets: [
      {
        label: "Files",
        data: departmentData.map((d) => d.count),
        backgroundColor: "#f97316"
      }
    ]
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">
        Admin Dashboard
      </h2>

      {/* Top Stats Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Faculty"
          value={stats.totalFaculty}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Students"
          value={stats.totalStudents}
        />
        <StatCard
          icon={<FileText size={22} />}
          label="Total Files"
          value={stats.totalFiles}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <PieChart size={18} />
            Category Distribution
          </h3>
          <Doughnut data={categoryChart} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <BarChart size={18} />
            Department Distribution
          </h3>
          <Bar data={departmentChart} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
  <h3 className="mb-4 font-semibold">Top Downloaded Files</h3>
  <Bar
    data={{
      labels: topFiles.map(f => f.fileName),
      datasets: [{
        label: "Downloads",
        data: topFiles.map(f => f.downloadCount),
        backgroundColor: "#ef4444"
      }]
    }}
  />
</div>
<div className="bg-white p-6 rounded-xl shadow-md mt-8">
  <h3 className="mb-4 font-semibold">Monthly Upload Trend</h3>
  <Bar
    data={{
      labels: monthlyData.map(m => `Month ${m._id}`),
      datasets: [{
        label: "Uploads",
        data: monthlyData.map(m => m.count),
        backgroundColor: "#3b82f6"
      }]
    }}
  />
</div>
<div className="bg-white p-6 rounded-xl shadow-md mt-8">
  <h3 className="mb-4 font-semibold">Recent Activity</h3>

  <table className="w-full text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-2 text-left">User</th>
        <th className="p-2 text-left">Action</th>
        <th className="p-2 text-left">File</th>
        <th className="p-2 text-left">Time</th>
      </tr>
    </thead>

    <tbody>
      {recentActivity.map(log => (
        <tr key={log._id} className="border-b">
          <td className="p-2">{log.user?.name}</td>
          <td className="p-2">{log.action}</td>
          <td className="p-2">{log.file?.fileName}</td>
          <td className="p-2">
            {new Date(log.createdAt).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-3">
        {icon}
      </div>
      <h4 className="text-sm opacity-90">{label}</h4>
      <p className="text-2xl font-bold mt-2">
        {value || 0}
      </p>
    </div>
  );
}

export default Dashboard;
