import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="bg-[#F1F2ED]">
      <Sidebar />
      <div className="min-h-screen bg-[#F1F2ED] md:ml-64">
        <div className="mx-auto max-w-[1400px] p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
