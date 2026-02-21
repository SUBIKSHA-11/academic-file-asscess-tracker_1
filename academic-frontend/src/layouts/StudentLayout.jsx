import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderSearch, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200";

function StudentLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="md:w-64 w-full bg-[#64242F] text-white p-5 md:p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Student Panel</h1>
          <p className="text-white/80 text-sm mt-1">Browse Academic Resources</p>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-[#DFD9D8] text-[#64242F] font-semibold shadow-sm"
                  : "text-white/95 hover:bg-white/20"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/student/files"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-[#DFD9D8] text-[#64242F] font-semibold shadow-sm"
                  : "text-white/95 hover:bg-white/20"
              }`
            }
          >
            <FolderSearch size={18} />
            Browse Files
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="mt-8 w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/95 hover:bg-white/20 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
