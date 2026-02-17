import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", background: "#f8fafc" }}>
      <Sidebar />
      <div style={{
        flex: 1,
        padding: "30px",
        minHeight: "100vh"
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
