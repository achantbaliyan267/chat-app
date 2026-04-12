import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { setUser } from "../redux/authSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser =
    useSelector((s) => s.auth?.user) ||
    JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    phone: currentUser?.phone || "",
    bio: currentUser?.bio || "",
  });

  // Sync form if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        username: currentUser.username || "",
        phone: currentUser.phone || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser?._id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const { data } = await API.put("/users/profile", form);
      dispatch(setUser({ user: data, token }));
      setSuccess("Profile updated successfully! ✅");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: currentUser?.name || "",
      username: currentUser?.username || "",
      phone: currentUser?.phone || "",
      bio: currentUser?.bio || "",
    });
    setIsEditing(false);
    setError("");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("❌ Photo size must be under 2MB");
      return;
    }

    setUploading(true);
    setError("");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await API.put("/users/profile-pic", {
          profilePic: reader.result,
        });
        dispatch(setUser({ user: data, token }));
        setSuccess("Profile photo updated! 📸");
        setTimeout(() => setSuccess(""), 3000);
      } catch {
        setError("Failed to upload photo");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const isGuest = currentUser.isGuest;
  const avatarLetter = currentUser.name?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center overflow-y-auto relative">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-blue-600" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-15 bg-violet-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-10 bg-indigo-500" />
      </div>

      {/* Header */}
      <div className="w-full max-w-lg px-4 pt-safe">
        <div className="flex items-center gap-3 py-5">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/8 hover:bg-white/14 transition-all active:scale-95 text-slate-300 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">
            My Profile
          </h1>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg px-4 pb-10 z-10 relative">
        <div className="bg-[#161b27]/90 backdrop-blur-xl rounded-3xl border border-white/8 shadow-2xl overflow-hidden">

          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-blue-600/60 via-indigo-600/50 to-violet-700/60 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=.03%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
            {isGuest && (
              <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                👤 Guest
              </div>
            )}
          </div>

          {/* Avatar section */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-14 mb-5">
              {/* Avatar */}
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <div
                  className="relative cursor-pointer"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  title="Click to change photo (max 2MB)"
                >
                  {currentUser.profilePic ? (
                    <img
                      src={currentUser.profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#161b27] shadow-2xl group-hover:ring-blue-500/50 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-[#161b27] shadow-2xl group-hover:ring-blue-500/50 transition-all duration-300">
                      <span className="text-4xl font-black text-white">
                        {avatarLetter}
                      </span>
                    </div>
                  )}

                  {/* Camera overlay */}
                  <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                          />
                        </svg>
                        <span className="text-[10px] text-white font-bold">
                          Change
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Small camera badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#161b27]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                  </svg>
                </div>
              </div>

              {/* Edit/Save button */}
              {!isGuest && (
                <div className="flex gap-2 mt-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-white/8 text-slate-300 hover:bg-white/14 transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 shadow-lg shadow-blue-900/40 disabled:opacity-70 flex items-center gap-2"
                      >
                        {saving && (
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        )}
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-white/8 hover:bg-white/14 text-slate-200 transition-all active:scale-95 border border-white/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Photo size hint */}
            <p className="text-[11px] text-slate-600 mb-5">
              📷 Tap photo to change · Max 2MB
            </p>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
                {success}
              </div>
            )}

            {/* Guest info banner */}
            {isGuest && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20">
                <p className="text-amber-400/90 text-sm font-semibold mb-1">
                  👤 You're using a Guest Account
                </p>
                <p className="text-slate-500 text-xs">
                  Your data is temporary (24h). Sign up to keep your chats and
                  customize your profile fully.
                </p>
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-2xl text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/4 rounded-2xl border border-white/6">
                    <span className="text-white font-semibold text-sm">
                      {currentUser.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Username
                </label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">
                      @
                    </span>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-8 pr-4 py-3 bg-white/6 border border-white/10 rounded-2xl text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/4 rounded-2xl border border-white/6">
                    <span className="text-slate-500 text-sm">@</span>
                    <span className="text-white font-semibold text-sm">
                      {currentUser.username}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-2xl text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/4 rounded-2xl border border-white/6">
                    <span className="text-white font-semibold text-sm">
                      {currentUser.phone || "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell something about yourself..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-2xl text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all resize-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-white/4 rounded-2xl border border-white/6 min-h-[60px]">
                    <span className="text-sm text-slate-400 font-medium">
                      {currentUser.bio || (
                        <span className="text-slate-600 italic">
                          No bio yet {isGuest ? "" : "· tap Edit to add one"}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <p className="text-right text-[11px] text-slate-600 mt-1">
                    {form.bio.length}/200
                  </p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Email
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/4 rounded-2xl border border-white/6">
                  <span className="text-slate-500 font-semibold text-sm">
                    {isGuest ? "Guest account (no email)" : currentUser.email}
                  </span>
                  <span className="ml-auto text-[10px] bg-white/8 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    read-only
                  </span>
                </div>
              </div>

              {/* Unique User ID */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                  User ID
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-white/4 rounded-2xl border border-white/6">
                  <span className="text-slate-500 font-mono text-xs flex-1 truncate">
                    {currentUser._id}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser._id);
                      setSuccess("ID copied! ✅");
                      setTimeout(() => setSuccess(""), 2000);
                    }}
                    className="shrink-0 text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold"
                    title="Copy ID"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Member since */}
            <div className="mt-6 pt-5 border-t border-white/6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Member since
                </p>
                <p className="text-sm text-slate-400 font-semibold">
                  {currentUser.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "long", year: "numeric" }
                      )
                    : "—"}
                </p>
              </div>
              {isGuest && (
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all active:scale-95 shadow-lg shadow-blue-900/30"
                >
                  Create Account →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
