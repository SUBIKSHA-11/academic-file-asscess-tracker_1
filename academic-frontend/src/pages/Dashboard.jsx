import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { PieChart, Users, FileText, Download, Building } from "lucide-react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import Pagination from "../components/Pagination";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topFiles, setTopFiles] = useState([]);
  const [mostActiveDept, setMostActiveDept] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [fileAnalytics, setFileAnalytics] = useState({
    mostRatedFiles: [],
    bestRatedFaculty: []
  });
  const [activityPage, setActivityPage] = useState(1);
  const [mostRatedPage, setMostRatedPage] = useState(1);
  const [facultyRatedPage, setFacultyRatedPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          meRes,
          statsRes,
          downloadsRes,
          catRes,
          deptRes,
          monthlyRes,
          activityRes,
          topFilesRes,
          activeDeptRes,
          fileAnalyticsRes
        ] = await Promise.all([
          axios.get("/auth/me"),
          axios.get("/admin/stats"),
          axios.get("/admin/downloads-today"),
          axios.get("/admin/category-distribution"),
          axios.get("/admin/department-distribution"),
          axios.get("/admin/monthly-uploads"),
          axios.get("/admin/recent-activity"),
          axios.get("/admin/top-files"),
          axios.get("/admin/most-active-department"),
          axios.get("/admin/file-analytics")
        ]);

        setAdminName(meRes.data?.name || "Admin");
        setStats({
          ...statsRes.data,
          downloadsToday: downloadsRes.data?.downloadsToday || 0
        });
        setCategoryData(catRes.data || []);
        setDepartmentData(deptRes.data || []);
        setMonthlyData(monthlyRes.data || []);
        setRecentActivity(activityRes.data || []);
        setTopFiles(topFilesRes.data || []);
        setMostActiveDept(activeDeptRes.data || null);
        setFileAnalytics({
          mostRatedFiles: fileAnalyticsRes.data?.mostRatedFiles || [],
          bestRatedFaculty: fileAnalyticsRes.data?.bestRatedFaculty || []
        });
      } catch (err) {
        console.error("Dashboard Error:", err);
      }
    };

    loadDashboard();
  }, []);

  const categoryChart = {
    labels: categoryData.map((c) => c._id),
    datasets: [
      {
        data: categoryData.map((c) => c.count),
        backgroundColor: ["#0C3C01", "#5B6D49", "#A2AC82", "#2E2D1D", "#7D8765"]
      }
    ]
  };

  const topFilesChart = {
    labels: topFiles.map((f) => (f.fileName?.length > 10 ? `${f.fileName.substring(0, 5)}...` : f.fileName)),
    datasets: [
      {
        label: "Downloads",
        data: topFiles.map((f) => f.downloadCount || 0),
        backgroundColor: "#5B6D49"
      }
    ]
  };

  const monthlyChart = {
    labels: monthlyData.map((m) => `Month ${m._id}`),
    datasets: [
      {
        label: "Uploads",
        data: monthlyData.map((m) => m.count),
        backgroundColor: "#5B6D49"
      }
    ]
  };

  const activityTotalPages = Math.max(1, Math.ceil(recentActivity.length / rowsPerPage));
  const mostRatedTotalPages = Math.max(1, Math.ceil(fileAnalytics.mostRatedFiles.length / rowsPerPage));
  const facultyRatedTotalPages = Math.max(1, Math.ceil(fileAnalytics.bestRatedFaculty.length / rowsPerPage));
  const safeActivityPage = Math.min(activityPage, activityTotalPages);
  const safeMostRatedPage = Math.min(mostRatedPage, mostRatedTotalPages);
  const safeFacultyRatedPage = Math.min(facultyRatedPage, facultyRatedTotalPages);

  const paginatedActivity = useMemo(() => {
    const start = (safeActivityPage - 1) * rowsPerPage;
    return recentActivity.slice(start, start + rowsPerPage);
  }, [recentActivity, safeActivityPage]);

  const paginatedMostRated = useMemo(() => {
    const start = (safeMostRatedPage - 1) * rowsPerPage;
    return fileAnalytics.mostRatedFiles.slice(start, start + rowsPerPage);
  }, [fileAnalytics.mostRatedFiles, safeMostRatedPage]);

  const paginatedFacultyRated = useMemo(() => {
    const start = (safeFacultyRatedPage - 1) * rowsPerPage;
    return fileAnalytics.bestRatedFaculty.slice(start, start + rowsPerPage);
  }, [fileAnalytics.bestRatedFaculty, safeFacultyRatedPage]);

  return (
    <div>
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeTab === "overview"
              ? "bg-[#2E2D1D] text-[#F1F2ED]"
              : "bg-white border border-[#DFD9D8] text-[#2E2D1D]"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeTab === "analytics"
              ? "bg-[#2E2D1D] text-[#F1F2ED]"
              : "bg-white border border-[#DFD9D8] text-[#2E2D1D]"
          }`}
        >
          File Rating Analytics
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Welcome back, {adminName || "Admin"}</h2>
            <p className="text-[#5B6D49] mt-1">Here&apos;s what&apos;s happening in your system today.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
            <StatCard icon={<Users size={22} />} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={<Users size={22} />} label="Faculty" value={stats.totalFaculty} />
            <StatCard icon={<Users size={22} />} label="Students" value={stats.totalStudents} />
            <StatCard icon={<FileText size={22} />} label="Total Files" value={stats.totalFiles} />
            <StatCard icon={<Download size={22} />} label="Downloads Today" value={stats.downloadsToday} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <PieChart size={18} />
                Category Distribution
              </h3>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut data={categoryChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
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
                          backgroundColor: ["#0C3C01", "#5B6D49", "#A2AC82", "#2E2D1D", "#7D8765"]
                        }
                      ]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
              <h3 className="mb-4 font-semibold">Most Downloaded Files</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[700px] h-72">
                  <Bar data={topFilesChart} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
              <h3 className="mb-4 font-semibold">Monthly Upload Trend</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[700px] h-72">
                  <Bar data={monthlyChart} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8] lg:col-span-2">
              <h3 className="mb-4 font-semibold">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#2E2D1D] text-[#F1F2ED] sticky top-0">
                    <tr>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Action</th>
                      <th className="p-2 text-left">File</th>
                      <th className="p-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivity.map((log) => (
                      <tr key={log._id} className="border-b">
                        <td className="p-2">{log.user?.name}</td>
                        <td className="p-2">{log.action}</td>
                        <td className="p-2">{log.file?.fileName}</td>
                        <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentActivity.length === 0 && (
                      <tr>
                        <td className="p-3 text-slate-500" colSpan={4}>
                          No recent activity found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={safeActivityPage} totalPages={activityTotalPages} onPageChange={setActivityPage} />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
            <h3 className="mb-4 font-semibold">Most Rated Files (Top 10)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#2E2D1D] text-[#F1F2ED] sticky top-0">
                  <tr>
                    <th className="p-3 text-left">File</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Avg Rating</th>
                    <th className="p-3 text-left">Feedback Count</th>
                    <th className="p-3 text-left">Helpful %</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMostRated.length > 0 ? (
                    paginatedMostRated.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-3">{item.fileName}</td>
                        <td className="p-3">{item.department || "-"}</td>
                        <td className="p-3">{Number(item.avgRating || 0).toFixed(1)}</td>
                        <td className="p-3">{item.totalFeedbackCount || 0}</td>
                        <td className="p-3">{Number(item.helpfulPercentage || 0).toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-slate-500">No feedback data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={safeMostRatedPage}
              totalPages={mostRatedTotalPages}
              onPageChange={setMostRatedPage}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
            <h3 className="mb-4 font-semibold">Best Rated Faculty</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#2E2D1D] text-[#F1F2ED] sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Faculty</th>
                    <th className="p-3 text-left">Files Uploaded</th>
                    <th className="p-3 text-left">Avg Rating</th>
                    <th className="p-3 text-left">Total Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFacultyRated.length > 0 ? (
                    paginatedFacultyRated.map((item) => (
                      <tr key={item.facultyId} className="border-b">
                        <td className="p-3">{item.facultyName}</td>
                        <td className="p-3">{item.filesUploaded || 0}</td>
                        <td className="p-3">{Number(item.avgRating || 0).toFixed(1)}</td>
                        <td className="p-3">{item.totalFeedbackReceived || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-slate-500">No faculty rating data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={safeFacultyRatedPage}
              totalPages={facultyRatedTotalPages}
              onPageChange={setFacultyRatedPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#5B6D49] text-[#F1F2ED] p-6 rounded-xl shadow-md border border-[#A2AC82]">
      <div className="flex justify-between items-center mb-3">{icon}</div>
      <h4 className="text-sm opacity-90">{label}</h4>
      <p className="text-2xl font-bold mt-2">{value || 0}</p>
    </div>
  );
}

export default Dashboard;
