import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { TrendingUp, FileDown, Gauge } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Analytics() {
  const [files, setFiles] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const authConfig = useMemo(() => {
    const token = sessionStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [filesRes, monthlyRes, categoryRes] = await Promise.all([
          axios.get("/faculty/my-files", authConfig),
          axios.get("/faculty/monthly-uploads", authConfig),
          axios.get("/faculty/category-distribution", authConfig)
        ]);
        setFiles(filesRes.data || []);
        setMonthlyData(monthlyRes.data || []);
        setCategoryData(categoryRes.data || []);
      } catch (error) {
        console.error("Failed to load analytics", error);
      }
    };

    fetchAnalytics();
  }, [authConfig]);

  const mostDownloadedFile = files.reduce(
    (top, file) => ((file.downloadCount || 0) > (top.downloadCount || 0) ? file : top),
    {}
  );

  const totalDownloads = files.reduce((sum, file) => sum + (file.downloadCount || 0), 0);
  const averageDownloadsPerFile = files.length ? (totalDownloads / files.length).toFixed(2) : "0.00";

  const monthlyChart = {
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

  const categoryChart = {
    labels: categoryData.map((c) => c._id),
    datasets: [
      {
        data: categoryData.map((c) => c.count),
        backgroundColor: ["#B8E3E9", "#93B1B5", "#4F7C82", "#0B2E33", "#6D9297", "#2E4F55"]
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0B2E33] text-[#B8E3E9] shadow-md p-6">
        <h2 className="text-2xl font-bold">Faculty Analytics</h2>
        <p className="text-[#93B1B5] mt-1">Performance insights from your uploaded files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <FileDown size={18} />
            Most Downloaded File
          </div>
          <p className="text-lg font-bold mt-3">{mostDownloadedFile.fileName || "N/A"}</p>
          <p className="text-sm text-slate-500 mt-1">
            Downloads: {mostDownloadedFile.downloadCount || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Gauge size={18} />
            Average Downloads / File
          </div>
          <p className="text-2xl font-bold mt-3">{averageDownloadsPerFile}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <TrendingUp size={18} />
            Total Downloads
          </div>
          <p className="text-2xl font-bold mt-3">{totalDownloads}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Download Growth Graph</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[520px] h-72">
              <Bar
                data={monthlyChart}
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

        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[420px] h-72">
              <Doughnut
                data={categoryChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
