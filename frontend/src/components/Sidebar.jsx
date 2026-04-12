import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { setFriends, setActiveChat } from "../redux/chatSlice";
import { logout } from "../redux/authSlice";

const Avatar = ({ user, size = "md", isDark, showOnline = false, isOnline = false }) => {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-13 h-13 text-lg" };
  return (
    <div className="relative shrink-0">
      {user?.profilePic
        ? <img src={user.profilePic} className={`${sizes[size]} rounded-full object-cover`} alt="" />
        : <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 to-indigo-600`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
      }
      {showOnline && isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
      )}
    </div>
  );
};

const Sidebar = ({ theme, setTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friends, activeChat, onlineUsers, unreadCounts } = useSelector((s) => s.chat);
  const currentUser = useSelector((s) => s.auth?.user) || JSON.parse(localStorage.getItem("user"));
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("friends");
  const [allUsers, setAllUsers]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const fetchContactData = async () => {
    try {
      const [{ data: fr }, { data: au }, { data: rq }] = await Promise.all([
        API.get("/users/friends"),
        API.get("/users/search"),
        API.get("/users/friend-requests"),
      ]);
      dispatch(setFriends(fr));
      setAllUsers(au);
      setRequests(rq);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchContactData(); }, []);

  const handleAddFriend = async (userId, e) => {
    e.stopPropagation(); setLoadingAction(`add_${userId}`);
    try { await API.post(`/users/send-request/${userId}`); alert("Request sent!"); fetchContactData(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setLoadingAction(null); }
  };

  const handleAcceptRequest = async (userId, e) => {
    e.stopPropagation(); setLoadingAction(`accept_${userId}`);
    try { await API.post(`/users/accept-request/${userId}`); alert("Request accepted!"); fetchContactData(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setLoadingAction(null); }
  };

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  const getDisplayData = () => {
    const friendIds = friends.map(f => f._id);
    if (activeTab === "friends") return friends;
    if (activeTab === "all") return allUsers.filter(u => !friendIds.includes(u._id));
    if (activeTab === "requests") return requests;
    return [];
  };

  const displayUsers = getDisplayData().filter(u =>
    !searchQuery || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = friends.filter(f => onlineUsers?.includes(f._id));

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`px-4 pt-5 pb-3 shrink-0 border-b ${isDark ? "border-white/6" : "border-black/6"}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Messages</h1>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 text-base ${isDark ? "bg-white/8 text-yellow-300" : "bg-black/6 text-indigo-500"}`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className={`relative flex items-center rounded-2xl px-3.5 py-2.5 transition-all ${isDark ? "bg-white/7 ring-1 ring-white/8" : "bg-black/5 ring-1 ring-black/6"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 shrink-0 mr-2.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent text-sm font-medium outline-none ${isDark ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className={`text-xs ml-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>✕</button>
          )}
        </div>
      </div>

      {/* ── Online stories row ────────────────────────────── */}
      {onlineFriends.length > 0 && activeTab === "friends" && !searchQuery && (
        <div className={`px-4 pt-3 pb-2 shrink-0 border-b ${isDark ? "border-white/5" : "border-black/4"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Active now</p>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {onlineFriends.slice(0, 8).map(f => (
              <button
                key={f._id}
                onClick={() => dispatch(setActiveChat(f))}
                className="flex flex-col items-center gap-1 shrink-0 group"
              >
                <div className="relative">
                  <Avatar user={f} size="sm" isDark={isDark} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
                </div>
                <span className={`text-[10px] font-medium truncate max-w-[44px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{f.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className={`flex px-4 pt-3 pb-2 gap-1 shrink-0`}>
        {[["friends", "Chats"], ["all", "Explore"], ["requests", "Requests"]].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 relative
              ${activeTab === tab
                ? isDark ? "bg-blue-600 text-white shadow-md shadow-blue-900/40" : "bg-blue-500 text-white shadow-md shadow-blue-200"
                : isDark ? "text-slate-400 hover:bg-white/6 hover:text-white" : "text-slate-500 hover:bg-black/5 hover:text-slate-800"
              }`}
          >
            {label}
            {tab === "requests" && requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contact List ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-24 no-scrollbar">
        {displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-14 gap-2">
            <span className="text-3xl">
              {activeTab === "friends" ? "👥" : activeTab === "all" ? "🌐" : "📬"}
            </span>
            <p className={`text-xs font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {activeTab === "friends" ? "No friends yet" : activeTab === "all" ? "No users found" : "No pending requests"}
            </p>
          </div>
        ) : (
          displayUsers.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);
            const unreadCount = unreadCounts?.[user._id] || 0;
            const isSelected = activeChat?._id === user._id && activeTab === "friends";

            return (
              <div
                key={user._id}
                onClick={() => activeTab === "friends" && dispatch(setActiveChat(user))}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 mb-0.5
                  ${activeTab === "friends" ? "cursor-pointer" : ""}
                  ${isSelected
                    ? isDark ? "bg-blue-600/20 ring-1 ring-blue-500/30" : "bg-blue-50 ring-1 ring-blue-200"
                    : isDark ? "hover:bg-white/5" : "hover:bg-black/4"
                  }`}
              >
                {/* Avatar */}
                <Avatar user={user} size="md" isDark={isDark} showOnline isOnline={isOnline} />

                {/* Name + last msg / username */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className={`font-semibold text-[14px] truncate ${isDark ? (isSelected ? "text-blue-300" : "text-slate-100") : (isSelected ? "text-blue-700" : "text-slate-800")}`}>
                      {user.name}
                    </p>
                    {activeTab === "friends" && (
                      <span className={`text-[10.5px] font-medium shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {isOnline ? <span className="text-emerald-400 font-bold">●</span> : <span className="opacity-50">●</span>}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>@{user.username}</p>
                </div>

                {/* Unread badge or action button */}
                <div className="shrink-0">
                  {unreadCount > 0 && activeTab === "friends" && (
                    <span className="min-w-[20px] h-5 px-1 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                      {unreadCount}
                    </span>
                  )}
                  {activeTab === "all" && (
                    <button
                      onClick={(e) => handleAddFriend(user._id, e)}
                      disabled={loadingAction === `add_${user._id}`}
                      className="px-3 py-1 text-xs font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                      {loadingAction === `add_${user._id}` ? "…" : "+ Add"}
                    </button>
                  )}
                  {activeTab === "requests" && (
                    <button
                      onClick={(e) => handleAcceptRequest(user._id, e)}
                      disabled={loadingAction === `accept_${user._id}`}
                      className="px-3 py-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                      {loadingAction === `accept_${user._id}` ? "…" : "Accept"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer / Profile ─────────────────────────────── */}
      {currentUser && (
        <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t z-20 backdrop-blur-xl
          ${isDark ? "bg-slate-900/95 border-white/8" : "bg-white/95 border-black/6"}`}>
          
          {/* Avatar + name → navigates to profile */}
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer group/profile"
            onClick={() => navigate("/profile")}
            title="View Profile"
          >
            <div
              className="relative shrink-0"
            >
              {currentUser.profilePic
                ? <img src={currentUser.profilePic} className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover/profile:ring-blue-500 transition-all" alt="" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover/profile:ring-blue-500 transition-all">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/profile:opacity-100 transition-opacity flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            <div className="min-w-0">
              <p className={`font-bold text-sm truncate group-hover/profile:text-blue-400 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>{currentUser.name}</p>
              <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" /> Active now
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border
              ${isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/25" : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Sidebar;
