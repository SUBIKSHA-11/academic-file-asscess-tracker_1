import { useCallback, useEffect, useState } from "react";
import axios from "../api/axios";
import { Users, UserCheck, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UsersPage() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    const res = await axios.get("/admin/stats");
    setStats(res.data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">
        Users Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <RoleCard
          icon={<Users size={30} />}
          title="Admins"
          count={
            (stats.totalUsers || 0) -
            (stats.totalFaculty || 0) -
            (stats.totalStudents || 0)
          }
          onClick={() => navigate("/users/admins")}
        />

        <RoleCard
          icon={<UserCheck size={30} />}
          title="Faculty"
          count={stats.totalFaculty || 0}
          onClick={() => navigate("/users/faculty")}
        />

        <RoleCard
          icon={<GraduationCap size={30} />}
          title="Students"
          count={stats.totalStudents || 0}
          onClick={() => navigate("/users/students")}
        />

      </div>
    </div>
  );
}


function RoleCard({ icon, title, count, onClick }) {

  return (
    <div
      onClick={onClick}
      className="theme-card theme-card--admin min-h-[220px] cursor-pointer p-10 transition duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between text-[#0C3C01]">
        {icon}
        <span className="text-4xl font-black text-[#0C3C01]">{count}</span>
      </div>

      <h3 className="mt-6 text-xl font-semibold text-[#0C3C01]">{title}</h3>
    </div>
  );
}

export default UsersPage;
