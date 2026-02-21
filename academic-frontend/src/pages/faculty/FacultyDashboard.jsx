import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import {
  Upload,
  Download,
  Globe,
  Shield,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState("Faculty");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalDownloads: 0,
    publicFiles: 0,
    internalFiles: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [meRes, statsRes, categoryRes, monthlyRes, recentRes] = await Promise.all([
          axios.get("/auth/me", authConfig),
          axios.get("/faculty/my-stats", authConfig),
          axios.get("/faculty/category-distribution", authConfig),
          axios.get("/faculty/monthly-uploads", authConfig),
          axios.get("/faculty/recent-uploads", authConfig)
        ]);

        setFacultyName(meRes.data?.name || "Faculty");
        setStats({
          totalFiles: statsRes.data?.totalFiles || 0,
          totalDownloads: statsRes.data?.totalDownloads || 0,
          publicFiles: statsRes.data?.publicFiles || 0,
          internalFiles: statsRes.data?.internalFiles || 0
        });
        setCategoryData(categoryRes.data || []);
        setMonthlyData(monthlyRes.data || []);
        setRecentUploads(recentRes.data || []);
      } catch (error) {
        console.error("Faculty dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authConfig]);

  const statCards = [
    { label: "My Uploaded Files", value: stats.totalFiles, icon: <Upload size={20} /> },
    { label: "Total Downloads", value: stats.totalDownloads, icon: <Download size={20} /> },
    { label: "Public Files", value: stats.publicFiles, icon: <Globe size={20} /> },
    { label: "Internal Files", value: stats.internalFiles, icon: <Shield size={20} /> }
  ];

  const pieData = {
    labels: categoryData.map((c) => c._id),
    datasets: [
      {
        data: categoryData.map((c) => c.count),
        backgroundColor: ["#B8E3E9", "#93B1B5", "#4F7C82", "#0B2E33", "#6D9297", "#2E4F55"],
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };

  const barData = {
    labels: monthlyData.map((m) => `Month ${m._id}`),
    datasets: [
      {
        label: "Uploads",
        data: monthlyData.map((m) => m.count),
        backgroundColor: "#4F7C82",
        borderRadius: 8
      }
    ]
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-96 rounded-xl bg-slate-200" />
          <div className="h-96 rounded-xl bg-slate-200" />
        </div>
        <div className="h-80 rounded-xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#0B2E33] text-[#B8E3E9] shadow-md p-6">
        <h2 className="text-2xl font-bold">Welcome back, {facultyName} 👋</h2>
        <p className="mt-1 text-[#93B1B5]">Here is your teaching content overview.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-[#4F7C82] text-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#0B2E33] hover:shadow-xl"
          >
            <div>{card.icon}</div>
            <p className="text-sm mt-3 text-[#B8E3E9]">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <PieChartIcon size={18} /> Uploads by Category
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[420px] h-72">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } }
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <BarChart3 size={18} /> Monthly Upload Trend
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[520px] h-72">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-slate-800">Recent Uploads</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="p-3 text-left">File Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Visibility</th>
                <th className="p-3 text-left">Downloads</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.length > 0 ? (
                recentUploads.map((file) => (
                  <tr key={file._id} className="border-t border-slate-100">
                    <td className="p-3">{file.fileName}</td>
                    <td className="p-3">{file.category}</td>
                    <td className="p-3">{file.sensitivity}</td>
                    <td className="p-3">{file.downloadCount || 0}</td>
                    <td className="p-3">{new Date(file.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={5}>
                    No uploads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FacultyDashboard;
