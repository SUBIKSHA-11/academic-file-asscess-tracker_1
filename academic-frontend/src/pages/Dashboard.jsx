import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  PieChart,
  Users,
  FileText,
  Download,
  Building
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
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
const [topFiles, setTopFiles] = useState([]);
  const [mostActiveDept, setMostActiveDept] = useState(null);
const [adminName, setAdminName] = useState("");
 const fetchAdminDetails = async () => {
    try {
      const res = await axios.get("/auth/me");
      setAdminName(res.data.name);
    } catch (error) {
      console.error("Failed to fetch admin details");
    }
  };
  useEffect(() => {
    fetchDashboard();
    
  fetchAdminDetails();
  }, []);

  const fetchDashboard = async () => {
    try {
      const statsRes = await axios.get("/admin/stats");
      const downloadsRes = await axios.get("/admin/downloads-today");
      const catRes = await axios.get("/admin/category-distribution");
      const deptRes = await axios.get("/admin/department-distribution");
      const monthlyRes = await axios.get("/admin/monthly-uploads");
      const activityRes = await axios.get("/admin/recent-activity");
 const topFilesRes = await axios.get("/admin/top-files");
      const activeDeptRes = await axios.get("/admin/most-active-department");

      setStats({
        ...statsRes.data,
        downloadsToday: downloadsRes.data.downloadsToday
      });

      setCategoryData(catRes.data);
      setDepartmentData(deptRes.data);
      setMonthlyData(monthlyRes.data);
      setRecentActivity(activityRes.data);
      setTopFiles(topFilesRes.data);
      setMostActiveDept(activeDeptRes.data);


    } catch (err) {
      console.error("Dashboard Error:", err);
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
 const topFilesChart = {
  labels: topFiles.map(f =>
    f.fileName.length > 20
      ? f.fileName.substring(0, 20) + "..."
      : f.fileName
  ),
  datasets: [
    {
      label: "Downloads",
      data: topFiles.map(f => f.downloadCount),
      backgroundColor: "#ef4444"
    }
  ]
};
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: function (context) {
          const index = context[0].dataIndex;
          return topFiles[index].fileName; // show full name on hover
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false
      }
    }
  }
};

  return (
    <div>
      <div className="mb-8">
  <h2 className="text-2xl font-semibold">
    Welcome back, {adminName || "Admin"} 👋
  </h2>
  <p className="text-gray-500 mt-1">
    Here's what's happening in your system today.
  </p>
</div>


      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">

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

        <StatCard
          icon={<Download size={22} />}
          label="Downloads Today"
          value={stats.downloadsToday}
        />
        <StatCard
          icon={<Building size={22} />}
          label="Most Active Department"
          value={
            mostActiveDept
              ? `${mostActiveDept.departmentName || "Unknown"} (${mostActiveDept.count})`
              : "N/A"
          }
        />


      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

       <div className="bg-white p-6 rounded-xl shadow-md">
  <h3 className="mb-4 flex items-center gap-2 font-semibold">
    <PieChart size={18} />
    Category Distribution
  </h3>

  <div className="flex justify-center">
    <div className="w-64 h-64">
      <Doughnut
        data={categoryChart}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }}
      />
    </div>
  </div>
</div>


     <div className="bg-white p-6 rounded-xl shadow-md">
  <h3 className="mb-4 flex items-center gap-2 font-semibold">
    <PieChart size={18} />
    Department Distribution
  </h3>

  <div className="flex justify-center">
    <div className="w-64 h-64">
      <Pie
        data={{
          labels: departmentData.map((d) => d._id?.name || d._id),
          datasets: [
            {
              data: departmentData.map((d) => d.count),
              backgroundColor: [
                "#f97316",
                "#ef4444",
                "#fb923c",
                "#dc2626",
                "#facc15"
              ]
            }
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }}
      />
    </div>
  </div>
</div>

        
        {/* Most Downloaded Files Graph */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="mb-4 font-semibold">
            Most Downloaded Files
          </h3>
        <div className="overflow-x-auto">
    <div className="min-w-[700px] h-72">
  <Bar data={topFilesChart} options={chartOptions} />
</div>
</div>

        </div>

        {/* Monthly Upload Trend */}
       <div className="bg-white p-6 rounded-xl shadow-md">
  <h3 className="mb-4 font-semibold">
    Monthly Upload Trend
  </h3>
<div className="overflow-x-auto">
    <div className="min-w-[700px] h-72">
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
</div>
</div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
  <h3 className="mb-4 font-semibold">Recent Activity</h3>

  <div className="max-h-80 overflow-y-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-100 sticky top-0">
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
