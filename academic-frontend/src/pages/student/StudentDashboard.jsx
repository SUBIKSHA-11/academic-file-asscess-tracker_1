import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Download, Eye, Fingerprint, Activity } from "lucide-react";

const getIntensityClass = (count) => {
  if (count === 0) return "bg-slate-200";
  if (count <= 2) return "bg-indigo-200";
  if (count <= 5) return "bg-indigo-400";
  if (count <= 9) return "bg-indigo-600";
  return "bg-indigo-800";
};

function StudentDashboard() {
  const [name, setName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalViews: 0,
    totalAccessActions: 0,
    uniqueFilesAccessed: 0,
    downloadsThisWeek: 0,
    mostDownloadedCategory: "N/A"
  });
  const [gridData, setGridData] = useState([]);
  const [recentAccess, setRecentAccess] = useState([]);

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    };
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [meRes, statsRes, gridRes, accessRes] = await Promise.all([
          axios.get("/auth/me", authConfig),
          axios.get("/student/my-stats", authConfig),
          axios.get("/student/access-grid", authConfig),
          axios.get("/student/recent-access", authConfig)
        ]);

        setName(meRes.data?.name || "Student");
        setStats({
          totalDownloads: statsRes.data?.totalDownloads || 0,
          totalViews: statsRes.data?.totalViews || 0,
          totalAccessActions: statsRes.data?.totalAccessActions || 0,
          uniqueFilesAccessed: statsRes.data?.uniqueFilesAccessed || 0,
          downloadsThisWeek: statsRes.data?.downloadsThisWeek || 0,
          mostDownloadedCategory: statsRes.data?.mostDownloadedCategory || "N/A"
        });
        setGridData(gridRes.data || []);
        setRecentAccess(accessRes.data || []);
      } catch (error) {
        console.error("Failed to load student dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authConfig]);

  const cards = [
    { label: "My Downloads", value: stats.totalDownloads, icon: <Download size={18} /> },
    { label: "My Views", value: stats.totalViews, icon: <Eye size={18} /> },
    { label: "Files Accessed", value: stats.uniqueFilesAccessed, icon: <Fingerprint size={18} /> },
    { label: "Downloads This Week", value: stats.downloadsThisWeek, icon: <Activity size={18} /> }
  ];

  const contributionWeeks = useMemo(() => {
    if (!gridData.length) return [];

    const sorted = [...gridData].sort((a, b) => a.date.localeCompare(b.date));
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    let prevDay = null;

    sorted.forEach((cell) => {
      const jsDay = new Date(cell.date).getDay();
      const dayIndex = (jsDay + 6) % 7;

      if (prevDay !== null && dayIndex <= prevDay) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }

      currentWeek[dayIndex] = cell;
      prevDay = dayIndex;
    });

    weeks.push(currentWeek);
    return weeks;
  }, [gridData]);

  const activeDays = useMemo(() => gridData.filter((d) => d.count > 0).length, [gridData]);
  const hasRecentActivity = useMemo(() => gridData.some((d) => d.count > 0), [gridData]);
  const bestDay = useMemo(
    () => gridData.reduce((max, day) => (day.count > max ? day.count : max), 0),
    [gridData]
  );
  const prettyCategory = useMemo(() => {
    if (!stats.mostDownloadedCategory || stats.mostDownloadedCategory === "N/A") return "N/A";
    if (["QP", "QUESTION_PAPER"].includes(stats.mostDownloadedCategory)) return "Other";
    return stats.mostDownloadedCategory
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [stats.mostDownloadedCategory]);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-24 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
        </div>
        <div className="h-56 rounded-xl bg-slate-200" />
        <div className="h-80 rounded-xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-md">
        <h2 className="text-2xl font-bold">Welcome back, {name}</h2>
        <p className="text-indigo-100 mt-1">Your personal usage stats and access records.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {card.icon}
            <p className="text-sm mt-3 text-indigo-100">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Access Activity Grid</h3>
          <p className="text-xs text-slate-500">Last 120 days</p>
        </div>

        <div className="space-y-4">
          {hasRecentActivity ? (
            <div className="overflow-x-auto">
              <div
                className="grid gap-1 w-full min-w-[720px]"
                style={{
                  gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                  gridTemplateColumns: `repeat(${Math.max(contributionWeeks.length, 1)}, minmax(0, 1fr))`
                }}
              >
                {contributionWeeks.map((week, weekIndex) =>
                  week.map((cell, dayIndex) => (
                    <div
                      key={cell ? cell.date : `empty_${weekIndex}_${dayIndex}`}
                      title={cell ? `${cell.date}: ${cell.count} activities` : ""}
                      style={{ gridColumn: weekIndex + 1, gridRow: dayIndex + 1 }}
                      className={`h-4 rounded ${getIntensityClass(cell?.count || 0)}`}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">No recent activity in the last 120 days</p>
              <p className="text-xs text-slate-500 mt-1">
                Your view/download actions will appear here automatically.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-slate-500">Most Downloaded Category</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{prettyCategory}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-slate-500">Total Activity</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalAccessActions}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-slate-500">Active Days</p>
              <p className="text-xl font-bold text-slate-800 mt-1">
                {activeDays} <span className="text-sm font-medium text-slate-500">/ 120</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Best day: {bestDay} actions</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-200" />
          <span className="w-3 h-3 rounded-sm bg-indigo-200" />
          <span className="w-3 h-3 rounded-sm bg-indigo-400" />
          <span className="w-3 h-3 rounded-sm bg-indigo-600" />
          <span className="w-3 h-3 rounded-sm bg-indigo-800" />
          <span>More</span>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800">My Recent Access Records</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-3 text-left">File</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentAccess.length > 0 ? (
                recentAccess.map((log) => (
                  <tr key={log._id} className="border-t">
                    <td className="p-3">{log.file?.fileName || "-"}</td>
                    <td className="p-3">{log.action}</td>
                    <td className="p-3">{log.file?.subject || "-"}</td>
                    <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={4}>
                    No access records yet
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

export default StudentDashboard;
