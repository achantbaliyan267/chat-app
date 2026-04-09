import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { setMessages, setActiveChat, setOnlineUsers, addTypingUser, removeTypingUser, incrementUnread, addMessage } from "../redux/chatSlice";
import { socket } from "../socket/socket";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const dispatch = useDispatch();
  const { activeChat, typingUsers, onlineUsers } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("join", user._id);
      socket.on("activeUsers", (users) => dispatch(setOnlineUsers(users)));

      const handleReceiveMessage = (msg) => {
        if (activeChat && (msg.sender === activeChat._id || msg.reciver === activeChat._id)) {
          dispatch(addMessage(msg));
        } else {
          dispatch(incrementUnread(msg.sender));
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("typing", (senderId) => dispatch(addTypingUser(senderId)));
      socket.on("stopTyping", (senderId) => dispatch(removeTypingUser(senderId)));

      return () => {
        socket.off("activeUsers");
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [user, activeChat, dispatch]);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${activeChat._id}`);
        dispatch(setMessages(data));
      } catch (e) { console.error(e); }
    };
    fetchMessages();
  }, [activeChat, dispatch]);

  const handleBackToContacts = () => dispatch(setActiveChat(null));

  const isOnline = activeChat && onlineUsers.includes(activeChat._id);
  const isTyping = activeChat && typingUsers.includes(activeChat._id);
  const isDark = theme === "dark";

  return (
    <div className={`flex w-full h-screen overflow-hidden relative transition-colors duration-500 ${isDark ? 'bg-[#0a0f1e]' : 'bg-slate-100'}`}>
      
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-700 ${isDark ? 'bg-blue-600' : 'bg-blue-300'}`} />
        <div className={`absolute top-1/2 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isDark ? 'bg-violet-600' : 'bg-violet-300'}`} />
        <div className={`absolute -bottom-24 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-15 transition-all duration-700 ${isDark ? 'bg-cyan-500' : 'bg-sky-300'}`} />
      </div>

      {/* Sidebar */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col shrink-0 w-full md:w-[300px] lg:w-[340px] h-full z-20 relative 
        border-r ${isDark ? 'border-white/6 bg-slate-900/80 backdrop-blur-xl' : 'border-black/5 bg-white/80 backdrop-blur-xl'}`}>
        <Sidebar theme={theme} setTheme={setTheme} />
      </div>

      {/* Chat panel */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full min-w-0 relative z-10 md:p-3`}>
        {activeChat ? (
          <div className={`flex-1 flex flex-col h-full overflow-hidden md:rounded-2xl border transition-all duration-300
            ${isDark
              ? 'bg-slate-900/70 backdrop-blur-2xl border-white/8 shadow-2xl shadow-black/40'
              : 'bg-white/75 backdrop-blur-2xl border-black/6 shadow-2xl shadow-black/10'
            }`}
          >
            {/* Chat Header — glassmorphism */}
            <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 shrink-0 border-b z-30
              ${isDark
                ? 'bg-slate-900/90 backdrop-blur-xl border-white/8'
                : 'bg-white/90 backdrop-blur-xl border-black/6'
              }`}
            >
              {/* Back button (mobile) */}
              <button
                onClick={handleBackToContacts}
                className={`md:hidden p-2 rounded-xl transition-all hover:scale-105 active:scale-95 mr-1
                  ${isDark ? 'bg-white/8 hover:bg-white/14 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="relative shrink-0">
                {activeChat.profilePic
                  ? <img src={activeChat.profilePic} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-md ring-2 ring-blue-500/30" alt="" />
                  : <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-500/30">
                      {activeChat.name.charAt(0).toUpperCase()}
                    </div>
                }
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-slate-900 animate-pulse shadow-sm" />
                )}
              </div>

              {/* Name + status */}
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className={`font-bold text-[16px] sm:text-[17px] truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeChat.name}
                </h3>
                <p className={`text-xs font-medium truncate transition-all duration-300 ${
                  isTyping ? 'text-blue-400 animate-pulse' : isOnline ? 'text-green-400' : (isDark ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {isTyping ? '● typing...' : isOnline ? '● Online' : '○ Offline'}
                </p>
              </div>
            </div>

            <ChatBox theme={theme} isOnline={isOnline} />
          </div>
        ) : (
          /* Empty state */
          <div className={`flex-1 flex flex-col items-center justify-center h-full md:rounded-2xl border text-center p-8
            ${isDark
              ? 'bg-slate-900/60 backdrop-blur-2xl border-white/8'
              : 'bg-white/70 backdrop-blur-2xl border-black/6'
            }`}
          >
            <div className="relative w-24 h-24 mb-6">
              <div className={`w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 ${isDark ? 'shadow-blue-900/50' : 'shadow-blue-200'}`}>
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-white/10 to-transparent" />
                <span className="text-5xl relative z-10">💬</span>
              </div>
              <div className={`absolute -inset-2 rounded-[36px] -z-10 blur-xl opacity-40 bg-gradient-to-tr from-blue-600 to-indigo-500`} />
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white to-slate-400' : 'from-slate-800 to-slate-500'}`}>
              Chat App
            </h2>
            <p className={`text-sm sm:text-base max-w-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Select a friend and start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
