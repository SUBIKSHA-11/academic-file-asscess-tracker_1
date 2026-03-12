import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  FolderGit2,
  Upload,
  BarChart3,
  ClipboardList,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200";

function FacultyLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { to: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/faculty/files", label: "My Files", icon: FolderOpen },
    { to: "/faculty/department-files", label: "Department Files", icon: FolderGit2 },
    { to: "/faculty/logs", label: "Access Logs", icon: ClipboardList },
    { to: "/faculty/upload", label: "Upload File", icon: Upload },
    { to: "/faculty/analytics", label: "Analytics", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0B2E33] px-4 py-3 text-white shadow-md md:hidden">
        <div>
          <h1 className="text-lg font-bold">Faculty Panel</h1>
          <p className="text-xs text-white/80">Academic Workspace</p>
        </div>
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
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto bg-[#0B2E33] p-5 text-white shadow-lg transition-transform duration-200 md:w-64 md:translate-x-0 md:p-6 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Faculty Panel</h1>
          <p className="text-white/80 text-sm mt-1">Academic Workspace</p>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
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
            setMobileOpen(false);
            logout();
            navigate("/");
          }}
          className="mt-auto w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/95 hover:bg-white/20 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default FacultyLayout;
