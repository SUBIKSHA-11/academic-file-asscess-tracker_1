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

import { useContext } from "react";            // ✅ MUST IMPORT
import { AuthContext } from "../context/AuthContext"; // ✅ MUST IMPORT

function Sidebar() {

  const { logout } = useContext(AuthContext);  // ✅ MUST BE INSIDE FUNCTION

  return (
    <div className="w-64 bg-gradient-to-b from-orange-500 to-red-600 text-white p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>

      <nav className="flex flex-col gap-6 text-sm font-medium">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80">
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        <Link to="/files" className="flex items-center gap-3 hover:opacity-80">
          <Folder size={18} /> Academic Files
        </Link>

        <Link to="/logs" className="flex items-center gap-3 hover:opacity-80">
          <ClipboardList size={18} /> Access Logs
        </Link>

        <Link to="/suspicious" className="flex items-center gap-3 hover:opacity-80">
          <AlertTriangle size={18} /> Suspicious
        </Link>

        <Link to="/users" className="flex items-center gap-3 hover:opacity-80">
          <Users size={18} /> Users
        </Link>
<Link to="/departments" className="flex items-center gap-3 hover:opacity-80">
  <Building size={18} />
  Departments
</Link>

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
