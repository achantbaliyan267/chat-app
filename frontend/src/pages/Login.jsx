import { useState } from "react";
import API from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/login", form);

      dispatch(
        setUser({
          user: data.user,
          token: data.token,
        }),
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setGuestLoading(true);
    try {
      const { data } = await API.post("/auth/guest-login");
      dispatch(setUser({ user: data.user, token: data.token }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join as guest");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-slate-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-xs font-semibold">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Guest Login */}
        <button
          onClick={handleGuestLogin}
          disabled={guestLoading}
          className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {guestLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-300 rounded-full animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <span className="text-lg">👤</span>
              Continue as Guest
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-600">
          Guest accounts are temporary (24h) · No signup needed
        </p>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
