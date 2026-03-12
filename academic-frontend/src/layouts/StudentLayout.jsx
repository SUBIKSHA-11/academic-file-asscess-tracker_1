import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderSearch, LogOut, Menu, X } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200";

function StudentLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#64242F] px-4 py-3 text-white shadow-md md:hidden">
        <div>
          <h1 className="text-lg font-bold">Student Panel</h1>
          <p className="text-xs text-white/80">Browse Academic Resources</p>
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto bg-[#64242F] p-5 text-white shadow-lg transition-transform duration-200 md:w-64 md:translate-x-0 md:p-6 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Student Panel</h1>
          <p className="text-white/80 text-sm mt-1">Browse Academic Resources</p>
        </div>

        <nav className="space-y-2 flex-1">
          <NavLink
            to="/student/dashboard"
            onClick={() => setMobileOpen(false)}
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
            onClick={() => setMobileOpen(false)}
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

export default StudentLayout;
