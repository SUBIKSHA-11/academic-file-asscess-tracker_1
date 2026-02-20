import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  ClipboardList,
  AlertTriangle,
  Users,
  LogOut,
  Building
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  const isAdmin = user?.role === "ADMIN";
  const isFaculty = user?.role === "FACULTY";
  const dashboardPath = isAdmin ? "/dashboard" : isFaculty ? "/faculty/dashboard" : "/files";

  return (
    <div className="w-64 bg-gradient-to-b from-orange-500 to-red-600 text-white p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-10">
        {isAdmin ? "Admin Panel" : isFaculty ? "Faculty Panel" : "Student Panel"}
      </h1>

      <nav className="flex flex-col gap-6 text-sm font-medium">
        <Link to={dashboardPath} className="flex items-center gap-3 hover:opacity-80">
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        <Link to="/files" className="flex items-center gap-3 hover:opacity-80">
          <Folder size={18} /> Academic Files
        </Link>

        {isAdmin && (
          <Link to="/logs" className="flex items-center gap-3 hover:opacity-80">
            <ClipboardList size={18} /> Access Logs
          </Link>
        )}

        {isAdmin && (
          <Link to="/suspicious" className="flex items-center gap-3 hover:opacity-80">
            <AlertTriangle size={18} /> Suspicious
          </Link>
        )}

        {isAdmin && (
          <Link to="/users" className="flex items-center gap-3 hover:opacity-80">
            <Users size={18} /> Users
          </Link>
        )}

        {isAdmin && (
          <Link to="/departments" className="flex items-center gap-3 hover:opacity-80">
            <Building size={18} /> Departments
          </Link>
        )}

        <div
          onClick={logout}
          className="flex items-center gap-3 mt-10 cursor-pointer hover:opacity-80"
        >
          <LogOut size={18} /> Logout
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
