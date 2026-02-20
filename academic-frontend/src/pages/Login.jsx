import { useContext, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginRes = await axios.post("/auth/login", form);
      sessionStorage.setItem("token", loginRes.data.token);
      const meRes = await axios.get("/auth/me");

      login({
        token: loginRes.data.token,
        user: meRes.data
      });

      if (loginRes.data.role === "ADMIN") {
        navigate("/dashboard");
      } else if (loginRes.data.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (error) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("user");
      alert(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Academic File System
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;
