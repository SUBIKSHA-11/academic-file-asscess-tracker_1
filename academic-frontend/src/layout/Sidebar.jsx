import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  ClipboardList,
  AlertTriangle,
  Users,
  LogOut,
  Building,
  CheckSquare,
  Menu,
  X
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isFaculty = user?.role === "FACULTY";
  const dashboardPath = isAdmin ? "/dashboard" : isFaculty ? "/faculty/dashboard" : "/files";
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
      isActive ? "bg-white/20 text-white" : "text-[#F1F2ED] hover:bg-white/10 hover:text-[#A2AC82]"
    }`;

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#A2AC82]/20 bg-[#0C3C01] px-4 py-3 text-[#F1F2ED] shadow-md md:hidden">
        <h1 className="text-lg font-bold">
          {isAdmin ? "Admin Panel" : isFaculty ? "Faculty Panel" : "Student Panel"}
        </h1>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg border border-white/20 p-2"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto bg-[#0C3C01] p-6 text-[#F1F2ED] shadow-lg transition-transform duration-200 md:w-64 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:fixed md:inset-y-0 md:left-0`}
      >
        <h1 className="mb-8 text-2xl font-bold">
          {isAdmin ? "Admin Panel" : isFaculty ? "Faculty Panel" : "Student Panel"}
        </h1>

        <nav className="flex flex-1 flex-col gap-3 text-sm font-medium">
          <NavLink to={dashboardPath} className={navClass} onClick={closeMobileMenu}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to="/files" className={navClass} onClick={closeMobileMenu}>
            <Folder size={18} /> Academic Files
          </NavLink>

          {isAdmin && (
            <NavLink to="/logs" className={navClass} onClick={closeMobileMenu}>
              <ClipboardList size={18} /> Access Logs
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/suspicious" className={navClass} onClick={closeMobileMenu}>
              <AlertTriangle size={18} /> Suspicious
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/approvals" className={navClass} onClick={closeMobileMenu}>
              <CheckSquare size={18} /> Approvals
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/users" className={navClass} onClick={closeMobileMenu}>
              <Users size={18} /> Users
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/departments" className={navClass} onClick={closeMobileMenu}>
              <Building size={18} /> Departments
            </NavLink>
          )}

          <button
            type="button"
            onClick={logout}
            className="mt-auto flex items-center gap-3 text-left transition-colors hover:text-[#A2AC82]"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;
