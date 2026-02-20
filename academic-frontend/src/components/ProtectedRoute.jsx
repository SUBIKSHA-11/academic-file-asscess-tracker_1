import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const token = sessionStorage.getItem("token");
  const storedUser = sessionStorage.getItem("user");
  let parsedStoredUser = null;

  if (storedUser) {
    try {
      parsedStoredUser = JSON.parse(storedUser);
    } catch (error) {
      parsedStoredUser = null;
    }
  }

  const effectiveUser = user || parsedStoredUser;

  if (loading) {
    return null;
  }

  if (!token || !effectiveUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
