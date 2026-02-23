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
    <div className="min-h-screen bg-gradient-to-br from-[#DDF3F2] via-[#EAF8F6] to-[#DCEBFF] px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-[#C6E0DD] bg-white/95 shadow-2xl lg:grid-cols-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E33] via-[#1E5A63] to-[#4F7C82] p-10 text-[#E8FAFA]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#7CC0BC]/30" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#B8E3E9]/25" />
          <p className="mb-3 inline-block rounded-full border border-[#9DD1CC] bg-[#0B2E33]/30 px-3 py-1 text-xs">
            College Academic Portal
          </p>
          <h1 className="text-3xl font-bold leading-tight">Your College Name - Academic File Access Portal</h1>
          <p className="mt-4 text-sm text-[#CBE8E5]">
            A common platform for students, faculty, and administrators to securely
            access, manage, and monitor academic files.
          </p>
          <div className="mt-8 space-y-2 text-sm text-[#DDF3F2]">
            <p>- Common sign-in and role-based dashboards</p>
            <p>- Secure view/download with audit history</p>
            <p>- Centralized departmental file repository</p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#F6FCFC] to-white p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#113A41]">Welcome Back</h2>
          <p className="mt-1 text-sm text-[#4E6F73]">
            Sign in using your registered college mail ID to continue.
          </p>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          {!showForgot ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="Registered college mail ID"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-[#BFDCD9] px-3 py-2 outline-none focus:border-[#1E5A63]"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full rounded-lg border border-[#BFDCD9] px-3 py-2 outline-none focus:border-[#1E5A63]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-[#0B2E33] to-[#2A7A7F] py-2 text-white transition hover:from-[#082126] hover:to-[#1E5A63] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="w-full text-sm text-[#1E5A63] underline underline-offset-2"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <p className="rounded-lg bg-[#EAF8F6] p-3 text-xs text-[#1E5A63]">
                Reset password using your registered college mail ID.
              </p>
              <input
                type="email"
                name="email"
                value={forgotForm.email}
                placeholder="Registered college mail ID"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-[#BFDCD9] px-3 py-2 outline-none focus:border-[#1E5A63]"
              />
              <input
                type="password"
                name="newPassword"
                value={forgotForm.newPassword}
                placeholder="New password"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-[#BFDCD9] px-3 py-2 outline-none focus:border-[#1E5A63]"
              />
              <input
                type="password"
                name="confirmPassword"
                value={forgotForm.confirmPassword}
                placeholder="Confirm new password"
                required
                onChange={handleForgotChange}
                className="w-full rounded-lg border border-[#BFDCD9] px-3 py-2 outline-none focus:border-[#1E5A63]"
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-lg bg-gradient-to-r from-[#0B2E33] to-[#2A7A7F] py-2 text-white transition hover:from-[#082126] hover:to-[#1E5A63] disabled:opacity-60"
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
