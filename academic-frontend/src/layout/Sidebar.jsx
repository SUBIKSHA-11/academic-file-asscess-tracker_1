import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  ClipboardList,
  AlertTriangle,
  Users,
  LogOut,
  Building,
  CheckSquare
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  const isAdmin = user?.role === "ADMIN";
  const isFaculty = user?.role === "FACULTY";
  const dashboardPath = isAdmin ? "/dashboard" : isFaculty ? "/faculty/dashboard" : "/files";
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
      isActive ? "bg-white/20 text-white" : "text-[#F1F2ED] hover:bg-white/10 hover:text-[#A2AC82]"
    }`;

  return (
    <div className="w-64 md:fixed md:inset-y-0 md:left-0 md:h-screen bg-[#0C3C01] text-[#F1F2ED] p-6 shadow-lg flex flex-col overflow-hidden">
      <h1 className="text-2xl font-bold mb-10">
        {isAdmin ? "Admin Panel" : isFaculty ? "Faculty Panel" : "Student Panel"}
      </h1>

      <nav className="flex flex-col gap-3 text-sm font-medium flex-1">
        <NavLink to={dashboardPath} className={navClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/files" className={navClass}>
          <Folder size={18} /> Academic Files
        </NavLink>

        {isAdmin && (
          <NavLink to="/logs" className={navClass}>
            <ClipboardList size={18} /> Access Logs
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/suspicious" className={navClass}>
            <AlertTriangle size={18} /> Suspicious
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/approvals" className={navClass}>
            <CheckSquare size={18} /> Approvals
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/users" className={navClass}>
            <Users size={18} /> Users
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/departments" className={navClass}>
            <Building size={18} /> Departments
          </NavLink>
        )}

        <div
          onClick={logout}
          className="flex items-center gap-3 mt-auto cursor-pointer hover:text-[#A2AC82] transition-colors"
        >
          <LogOut size={18} /> Logout
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
