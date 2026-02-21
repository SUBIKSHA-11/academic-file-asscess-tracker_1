import { useContext, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgotChange = (e) => {
    setForgotForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setMessage("");
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
    } catch (apiError) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("user");
      setError(apiError?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setForgotLoading(true);
      setError("");
      setMessage("");
      const res = await axios.post("/auth/forgot-password", forgotForm);
      setMessage(res.data?.message || "Password reset successful");
      setShowForgot(false);
      setForgotForm({ email: "", newPassword: "", confirmPassword: "" });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-[#D7D7D7] bg-white shadow-xl lg:grid-cols-2">
        <div className="bg-[#64242F] p-10 text-[#F7EDEE]">
          <p className="mb-3 inline-block rounded-full border border-[#A86571] px-3 py-1 text-xs">
            Unified Academic Portal
          </p>
          <h1 className="text-3xl font-bold leading-tight">Academic File Access Tracker</h1>
          <p className="mt-4 text-sm text-[#F0C8CE]">
            A common platform for students, faculty, and administrators to securely
            access, manage, and monitor academic files.
          </p>
          <div className="mt-8 space-y-2 text-sm text-[#F4D9DE]">
            <p>- Common sign-in and role-based dashboards</p>
            <p>- Secure view/download with audit history</p>
            <p>- Centralized departmental file repository</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#1E1E1E]">Welcome Back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to continue to your common academic workspace.
          </p>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          {!showForgot ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="Email address"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#64242F]"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#64242F]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#64242F] py-2 text-white transition hover:bg-[#4F1D25] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="w-full text-sm text-[#64242F] underline underline-offset-2"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <p className="rounded-lg bg-[#F8F1F2] p-3 text-xs text-[#64242F]">
                Reset password directly using your registered email.
              </p>
              <input
                type="email"
                name="email"
                value={forgotForm.email}
                placeholder="Registered email"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#64242F]"
              />
              <input
                type="password"
                name="newPassword"
                value={forgotForm.newPassword}
                placeholder="New password"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#64242F]"
              />
              <input
                type="password"
                name="confirmPassword"
                value={forgotForm.confirmPassword}
                placeholder="Confirm new password"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#64242F]"
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-lg bg-[#64242F] py-2 text-white transition hover:bg-[#4F1D25] disabled:opacity-60"
              >
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-700"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
