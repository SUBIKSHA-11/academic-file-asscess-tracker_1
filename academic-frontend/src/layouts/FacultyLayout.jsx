import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  FolderGit2,
  Upload,
  BarChart3,
  LogOut
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200";

function FacultyLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = [
    { to: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/faculty/files", label: "My Files", icon: FolderOpen },
    { to: "/faculty/department-files", label: "Department Files", icon: FolderGit2 },
    { to: "/faculty/upload", label: "Upload File", icon: Upload },
    { to: "/faculty/analytics", label: "Analytics", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="md:w-64 w-full bg-[#0B2E33] text-white p-5 md:p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Faculty Panel</h1>
          <p className="text-white/80 text-sm mt-1">Academic Workspace</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive
                      ? "bg-[#B8E3E9] text-[#0B2E33] font-semibold shadow-sm"
                      : "text-white/95 hover:bg-white/20"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
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

export default FacultyLayout;
