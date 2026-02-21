import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", background: "#F1F2ED" }}>
      <Sidebar />
      <div style={{
        flex: 1,
        padding: "30px",
        minHeight: "100vh",
        background: "#F1F2ED"
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
