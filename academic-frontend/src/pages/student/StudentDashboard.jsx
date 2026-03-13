import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Download, Eye, Fingerprint, Activity, Inbox } from "lucide-react";
import Pagination from "../../components/Pagination";

const getIntensityClass = (count) => {
  if (count === 0) return "bg-[#F3E6E9]";
  if (count <= 2) return "bg-[#E3B5BE]";
  if (count <= 5) return "bg-[#C98390]";
  if (count <= 9) return "bg-[#9C4556]";
  return "bg-[#64242F]";
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
    mostDownloadedCategory: "N/A",
    currentStreak: 0,
    longestStreak: 0,
    badges: []
  });
  const [gridData, setGridData] = useState([]);
  const [recentAccess, setRecentAccess] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const rowsPerPage = 8;

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
          mostDownloadedCategory: statsRes.data?.mostDownloadedCategory || "N/A",
          currentStreak: statsRes.data?.currentStreak || 0,
          longestStreak: statsRes.data?.longestStreak || 0,
          badges: statsRes.data?.badges || []
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

  useEffect(() => {
    if (!stats.badges?.length) return;
    const seenBadges = JSON.parse(sessionStorage.getItem("seenBadges") || "[]");
    const latest = [...stats.badges].sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))[0];
    if (!latest?.name) return;
    if (!seenBadges.includes(latest.name)) {
      setNewBadge(latest);
      sessionStorage.setItem("seenBadges", JSON.stringify([...seenBadges, latest.name]));
      const timer = setTimeout(() => setNewBadge(null), 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stats.badges]);

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

  const paginatedRecentAccess = useMemo(() => {
    const recentTotalPages = Math.max(1, Math.ceil(recentAccess.length / rowsPerPage));
    const safeRecentPage = Math.min(recentPage, recentTotalPages);
    const start = (safeRecentPage - 1) * rowsPerPage;
    return recentAccess.slice(start, start + rowsPerPage);
  }, [recentAccess, recentPage]);

  const recentTotalPages = Math.max(1, Math.ceil(recentAccess.length / rowsPerPage));
  const safeRecentPage = Math.min(recentPage, recentTotalPages);

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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Welcome back, {name}</h2>
        <p className="mt-1 text-slate-600">Your personal usage stats and access records.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="theme-card theme-card--student min-h-[136px]"
          >
            <div className="text-[#64242F]">{card.icon}</div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#64242F]/80">{card.label}</p>
            <p className="mt-1 text-3xl font-black leading-none text-[#64242F]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="theme-card theme-card--student min-h-[130px]">
          <p className="text-xs text-slate-500">Current Streak</p>
          <p className="mt-1 text-2xl font-bold text-[#64242F]">🔥 {stats.currentStreak} days</p>
          <p className="text-xs text-slate-500 mt-1">Keep logging in daily to build consistency.</p>
        </div>
        <div className="theme-card theme-card--student min-h-[130px]">
          <p className="text-xs text-slate-500">Longest Streak</p>
          <p className="mt-1 text-2xl font-bold text-[#64242F]">🏆 {stats.longestStreak} days</p>
          <p className="text-xs text-slate-500 mt-1">Your best continuous login record.</p>
        </div>
      </section>

      <section className="rounded-xl bg-white border p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3">My Badges</h3>
        {stats.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <span
                key={`${badge.name}_${badge.earnedAt}`}
                className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs"
                title={`Earned on ${new Date(badge.earnedAt).toLocaleDateString()}`}
              >
                {badge.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No badges yet. Keep your streak alive.</p>
        )}
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
            <div className="theme-card theme-card--student min-h-[116px]">
              <p className="text-xs text-slate-500">Most Downloaded Category</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{prettyCategory}</p>
            </div>
            <div className="theme-card theme-card--student min-h-[116px]">
              <p className="text-xs text-slate-500">Total Activity</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalAccessActions}</p>
            </div>
            <div className="theme-card theme-card--student min-h-[116px]">
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
          <span className="w-3 h-3 rounded-sm bg-[#F3E6E9]" />
          <span className="w-3 h-3 rounded-sm bg-[#E3B5BE]" />
          <span className="w-3 h-3 rounded-sm bg-[#C98390]" />
          <span className="w-3 h-3 rounded-sm bg-[#9C4556]" />
          <span className="w-3 h-3 rounded-sm bg-[#64242F]" />
          <span>More</span>
        </div>
      </section>

      <section className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800">My Recent Access Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-3 text-left">File</th>
                <th className="whitespace-nowrap p-3 text-left">Action</th>
                <th className="p-3 text-left">Subject</th>
                <th className="whitespace-nowrap p-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecentAccess.length > 0 ? (
                paginatedRecentAccess.map((log, index) => (
                  <tr key={log._id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                    <td className="min-w-[260px] p-3">{log.file?.fileName || "-"}</td>
                    <td className="whitespace-nowrap p-3">{log.action}</td>
                    <td className="min-w-[180px] p-3">{log.file?.subject || "-"}</td>
                    <td className="whitespace-nowrap p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={4}>
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={18} />
                      <p>No access records yet. Start browsing files to populate this table.</p>
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

      {newBadge && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-[#64242F] px-5 py-4 text-[#F7EDEE] shadow-xl animate-bounce">
          <p className="text-xs uppercase tracking-wide text-[#FC8F8F]">Badge Unlocked</p>
          <p className="text-sm font-semibold mt-1">🏅 {newBadge.name}</p>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
