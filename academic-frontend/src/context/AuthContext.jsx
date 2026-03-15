import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import { AuthContext } from "./auth-context";

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) {
      return;
    }
    hasBootstrapped.current = true;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    const bootstrapAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || token === "undefined" || token === "null") {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/auth/me");
        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        // A 401 here just means the persisted session is no longer valid.
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("role", data.user.role);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
