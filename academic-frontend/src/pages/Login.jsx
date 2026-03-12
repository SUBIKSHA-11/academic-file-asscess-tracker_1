import { useContext, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BookOpen, FileText, GraduationCap, KeyRound, Mail, NotebookPen } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#d9e0e2] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_40%)]" />
        <div className="absolute -top-20 left-1/2 h-[260px] w-[1000px] -translate-x-1/2 rounded-[50%] bg-white/30 blur-2xl" />
        <div className="absolute top-[20%] left-[12%] hidden h-36 w-36 rotate-[-8deg] rounded-[2rem] border border-white/30 bg-white/18 backdrop-blur-[2px] md:block">
          <div className="flex h-full items-center justify-center text-white/65">
            <BookOpen size={34} />
          </div>
        </div>
        <div className="absolute bottom-[14%] left-[14%] hidden h-28 w-28 rotate-[10deg] rounded-[2rem] border border-white/30 bg-white/18 backdrop-blur-[2px] lg:block">
          <div className="flex h-full items-center justify-center text-white/65">
            <NotebookPen size={28} />
          </div>
        </div>
        <div className="absolute right-[12%] top-[18%] hidden h-36 w-36 rotate-[10deg] rounded-[2rem] border border-white/30 bg-white/18 backdrop-blur-[2px] md:block">
          <div className="flex h-full items-center justify-center text-white/65">
            <GraduationCap size={34} />
          </div>
        </div>
        <div className="absolute bottom-[12%] right-[10%] hidden h-28 w-28 rotate-[-8deg] rounded-[2rem] border border-white/30 bg-white/18 backdrop-blur-[2px] lg:block">
          <div className="flex h-full items-center justify-center text-white/65">
            <FileText size={28} />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/16 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-sm rounded-[32px] border border-white/75 bg-white/88 p-6 shadow-[0_18px_45px_rgba(56,72,82,0.12)] backdrop-blur-md sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1f2937]">Sign in</h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            Enter your credentials to access the portal.
          </p>

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

          {!showForgot ? (
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div className="flex h-14 items-center gap-3 rounded-full border border-[#e2e8ee] bg-white px-4 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
                <Mail size={18} className="text-[#9aa7b2]" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Email"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#b0bcc7]"
                />
              </div>

              <div className="flex h-14 items-center gap-3 rounded-full border border-[#e2e8ee] bg-white px-4 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
                <KeyRound size={18} className="text-[#9aa7b2]" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#b0bcc7]"
                />
              </div>

              <div className="flex justify-end text-xs text-[#8c9aa5]">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="font-medium text-[#2563eb]"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#111827] py-3.5 text-base font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-7 space-y-4">
              <div className="rounded-2xl bg-[#f3f4f6] p-3 text-xs text-[#6b7280]">
                Reset password using your registered college mail ID.
              </div>

              <div className="flex h-14 items-center gap-3 rounded-full border border-[#e2e8ee] bg-white px-4 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
                <Mail size={18} className="text-[#9aa7b2]" />
                <input
                  type="email"
                  name="email"
                  value={forgotForm.email}
                  placeholder="Registered mail ID"
                  required
                  onChange={handleForgotChange}
                  className="w-full bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#b0bcc7]"
                />
              </div>

              <div className="flex h-14 items-center gap-3 rounded-full border border-[#e2e8ee] bg-white px-4 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
                <KeyRound size={18} className="text-[#9aa7b2]" />
                <input
                  type="password"
                  name="newPassword"
                  value={forgotForm.newPassword}
                  placeholder="New password"
                  required
                  onChange={handleForgotChange}
                  className="w-full bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#b0bcc7]"
                />
              </div>

              <div className="flex h-14 items-center gap-3 rounded-full border border-[#e2e8ee] bg-white px-4 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
                <KeyRound size={18} className="text-[#9aa7b2]" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={forgotForm.confirmPassword}
                  placeholder="Confirm password"
                  required
                  onChange={handleForgotChange}
                  className="w-full bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#b0bcc7]"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-full bg-[#111827] py-3.5 text-base font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-60"
              >
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full rounded-full border border-[#d8e1ea] bg-white py-3 text-sm font-medium text-[#556472]"
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
