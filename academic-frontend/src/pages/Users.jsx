import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Users, UserCheck, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UsersPage() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("/admin/stats");
    setStats(res.data);
  };

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
      className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-600 text-white p-10 rounded-2xl shadow-lg hover:scale-105 transition duration-300"
    >
      <div className="flex justify-between items-center">
        {icon}
        <span className="text-4xl font-bold">{count}</span>
      </div>

      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
    </div>
  );
}

export default UsersPage;
