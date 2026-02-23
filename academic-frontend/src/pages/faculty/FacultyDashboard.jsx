import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import {
  Upload,
  Download,
  Globe,
  Shield,
  PieChart as PieChartIcon,
  BarChart3,
  Inbox
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
import Pagination from "../../components/Pagination";

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
  const [topRatedFiles, setTopRatedFiles] = useState([]);
  const [recentPage, setRecentPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const rowsPerPage = 6;
  const graphPalette = ["#02052F", "#147A7E", "#AAB391", "#E8AB1F", "#D23800"];

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
        const [meRes, statsRes, categoryRes, monthlyRes, recentRes, topRatedRes] = await Promise.all([
          axios.get("/auth/me", authConfig),
          axios.get("/faculty/my-stats", authConfig),
          axios.get("/faculty/category-distribution", authConfig),
          axios.get("/faculty/monthly-uploads", authConfig),
          axios.get("/faculty/recent-uploads", authConfig),
          axios.get("/faculty/top-rated", authConfig)
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
        setTopRatedFiles(topRatedRes.data || []);
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
        backgroundColor: graphPalette,
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
        backgroundColor: monthlyData.map((_, i) => graphPalette[i % graphPalette.length]),
        borderRadius: 8
      }
    ]
  };

  const recentTotalPages = Math.max(1, Math.ceil(recentUploads.length / rowsPerPage));
  const topRatedTotalPages = Math.max(1, Math.ceil(topRatedFiles.length / rowsPerPage));
  const safeRecentPage = Math.min(recentPage, recentTotalPages);
  const safeTopRatedPage = Math.min(topRatedPage, topRatedTotalPages);

  const paginatedRecentUploads = useMemo(() => {
    const start = (safeRecentPage - 1) * rowsPerPage;
    return recentUploads.slice(start, start + rowsPerPage);
  }, [recentUploads, safeRecentPage]);

  const paginatedTopRatedFiles = useMemo(() => {
    const start = (safeTopRatedPage - 1) * rowsPerPage;
    return topRatedFiles.slice(start, start + rowsPerPage);
  }, [safeTopRatedPage, topRatedFiles]);

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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Welcome back, {facultyName} 👋</h2>
        <p className="mt-1 text-slate-600">Here is your teaching content overview.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="theme-card theme-card--faculty min-h-[170px]"
          >
            <div className="text-[#0B2E33]">{card.icon}</div>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-[#0B2E33]/80">{card.label}</p>
            <p className="mt-2 text-4xl font-black leading-none text-[#0B2E33]">{card.value}</p>
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
        <div className="overflow-x-auto">
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
              {paginatedRecentUploads.length > 0 ? (
                paginatedRecentUploads.map((file, index) => (
                  <tr key={file._id} className={`border-t border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                    <td className="p-3">{file.fileName}</td>
                    <td className="p-3">{file.category}</td>
                    <td className="p-3">{file.sensitivity}</td>
                    <td className="p-3">{file.downloadCount || 0}</td>
                    <td className="p-3">{new Date(file.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={18} />
                      <p>No uploads found. Upload your first file to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 pt-0">
          <Pagination currentPage={safeRecentPage} totalPages={recentTotalPages} onPageChange={setRecentPage} />
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-slate-800">My Top Rated Files</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="p-3 text-left">File</th>
                <th className="p-3 text-left">Avg Rating</th>
                <th className="p-3 text-left">Feedback Count</th>
                <th className="p-3 text-left">Helpful %</th>
                <th className="p-3 text-left">Recent Comments</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTopRatedFiles.length > 0 ? (
                paginatedTopRatedFiles.map((item, index) => (
                  <tr key={item._id} className={`border-t border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                    <td className="p-3">{item.fileName}</td>
                    <td className="p-3">{Number(item.avgRating || 0).toFixed(1)}</td>
                    <td className="p-3">{item.totalFeedbackCount || 0}</td>
                    <td className="p-3">{Number(item.helpfulPercentage || 0).toFixed(1)}%</td>
                    <td className="p-3">
                      {item.recentComments?.length ? (
                        <div className="space-y-1">
                          {item.recentComments.map((comment, idx) => (
                            <p key={`${item._id}_c_${idx}`} className="text-xs text-slate-600">
                              • {comment}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No comments</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={5}>
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={18} />
                      <p>No rating data available yet. Share files to collect feedback.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 pt-0">
          <Pagination
            currentPage={safeTopRatedPage}
            totalPages={topRatedTotalPages}
            onPageChange={setTopRatedPage}
          />
        </div>
      </section>
    </div>
  );
}

export default FacultyDashboard;
