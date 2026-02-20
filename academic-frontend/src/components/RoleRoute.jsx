import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const getHomeByRole = (role) => {
  if (role === "ADMIN") return "/dashboard";
  if (role === "FACULTY") return "/faculty/dashboard";
  return "/files";
};

function RoleRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);
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

  if (!effectiveUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(effectiveUser.role)) {
    return <Navigate to={getHomeByRole(effectiveUser.role)} replace />;
  }

  return children;
}

export default RoleRoute;
