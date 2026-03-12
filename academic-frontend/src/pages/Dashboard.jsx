import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { PieChart, Users, FileText, Download, Building, Inbox } from "lucide-react";
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
  const graphPalette = ["#0C3C01", "#8B6B4A", "#A2835E", "#5B6D49", "#7A8A5A", "#C2A27A", "#D7C2A3"];

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
        backgroundColor: graphPalette,
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };

  const topFilesChart = {
    labels: topFiles.map((f) => (f.fileName?.length > 10 ? `${f.fileName.substring(0, 5)}...` : f.fileName)),
    datasets: [
      {
        label: "Downloads",
        data: topFiles.map((f) => f.downloadCount || 0),
        backgroundColor: topFiles.map((_, i) => graphPalette[i % graphPalette.length]),
        borderRadius: 10
      }
    ]
  };

  const monthlyChart = {
    labels: monthlyData.map((m) => `Month ${m._id}`),
    datasets: [
      {
        label: "Uploads",
        data: monthlyData.map((m) => m.count),
        backgroundColor: monthlyData.map((_, i) => graphPalette[(i + 2) % graphPalette.length]),
        borderRadius: 10
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
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeTab === "overview"
              ? "bg-[#0C3C01] text-[#F1F2ED]"
              : "bg-white border border-[#DFD9D8] text-[#0C3C01]"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`rounded-lg px-4 py-2 text-sm ${
            activeTab === "analytics"
              ? "bg-[#0C3C01] text-[#F1F2ED]"
              : "bg-white border border-[#DFD9D8] text-[#0C3C01]"
          }`}
        >
          File Rating Analytics
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Welcome back, {adminName || "Admin"}</h2>
            <p className="text-[#0C3C01] mt-1">Here&apos;s what&apos;s happening in your system today.</p>
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
                <div className="h-64 w-full max-w-[16rem]">
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
                <div className="h-64 w-full max-w-[16rem]">
                  <Pie
                    data={{
                      labels: departmentData.map((d) => d._id?.name || d._id),
                      datasets: [
                        {
                          data: departmentData.map((d) => d.count),
                          backgroundColor: graphPalette,
                          borderColor: "#ffffff",
                          borderWidth: 2
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
                <div className="h-72 min-w-[560px] sm:min-w-[700px]">
                  <Bar data={topFilesChart} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8]">
              <h3 className="mb-4 font-semibold">Monthly Upload Trend</h3>
              <div className="overflow-x-auto">
                <div className="h-72 min-w-[560px] sm:min-w-[700px]">
                  <Bar data={monthlyChart} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-[#DFD9D8] lg:col-span-2">
              <h3 className="mb-4 font-semibold">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead className="bg-[#0C3C01] text-[#F1F2ED] sticky top-0">
                    <tr>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Action</th>
                      <th className="p-2 text-left">File</th>
                      <th className="p-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivity.map((log, index) => (
                      <tr key={log._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                        <td className="p-2">{log.user?.name}</td>
                        <td className="p-2">{log.action}</td>
                        <td className="p-2">{log.file?.fileName}</td>
                        <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentActivity.length === 0 && (
                      <tr>
                        <td className="p-6 text-center text-slate-500" colSpan={4}>
                          <div className="flex flex-col items-center gap-2">
                            <Inbox size={18} />
                            <p>No recent activity found.</p>
                          </div>
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
              <table className="min-w-[760px] w-full text-sm">
                <thead className="bg-[#0C3C01] text-[#F1F2ED] sticky top-0">
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
                    paginatedMostRated.map((item, index) => (
                      <tr key={item._id} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                        <td className="p-3">{item.fileName}</td>
                        <td className="p-3">{item.department || "-"}</td>
                        <td className="p-3">{Number(item.avgRating || 0).toFixed(1)}</td>
                        <td className="p-3">{item.totalFeedbackCount || 0}</td>
                        <td className="p-3">{Number(item.helpfulPercentage || 0).toFixed(1)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox size={18} />
                          <p>No feedback data available.</p>
                        </div>
                      </td>
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
              <table className="min-w-[680px] w-full text-sm">
                <thead className="bg-[#0C3C01] text-[#F1F2ED] sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Faculty</th>
                    <th className="p-3 text-left">Files Uploaded</th>
                    <th className="p-3 text-left">Avg Rating</th>
                    <th className="p-3 text-left">Total Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFacultyRated.length > 0 ? (
                    paginatedFacultyRated.map((item, index) => (
                      <tr key={item.facultyId} className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                        <td className="p-3">{item.facultyName}</td>
                        <td className="p-3">{item.filesUploaded || 0}</td>
                        <td className="p-3">{Number(item.avgRating || 0).toFixed(1)}</td>
                        <td className="p-3">{item.totalFeedbackReceived || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox size={18} />
                          <p>No faculty rating data available.</p>
                        </div>
                      </td>
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
    <div className="theme-card theme-card--admin min-h-[170px]">
      <div className="mb-4 flex items-center justify-between text-[#0C3C01]">{icon}</div>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-[#1d4f12]/80">{label}</h4>
      <p className="mt-2 text-4xl font-black leading-none text-[#0C3C01]">{value || 0}</p>
    </div>
  );
}

export default Dashboard;
