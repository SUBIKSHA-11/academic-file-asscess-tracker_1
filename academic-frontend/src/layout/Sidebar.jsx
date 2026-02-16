import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "230px",
      background: "#0f172a",
      color: "white",
      height: "100vh",
      padding: "20px"
    }}>
      <h2>Secure Academic</h2>

      <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
        <Link to="/files" style={{ color: "white" }}>Academic Files</Link>
        <Link to="/logs" style={{ color: "white" }}>Access Logs</Link>
        <Link to="/suspicious" style={{ color: "white" }}>Suspicious</Link>
      </div>
    </div>
  );
}

export default Sidebar;
