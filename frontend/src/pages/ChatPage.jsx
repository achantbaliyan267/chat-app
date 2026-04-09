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
    <div className={`flex w-full h-screen overflow-hidden relative transition-colors duration-500 ${isDark ? 'bg-[#0d1117]' : 'bg-[#f0f2f5]'}`}>
      
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -left-20 w-96 h-96 rounded-full blur-[100px] opacity-20 ${isDark ? 'bg-blue-600' : 'bg-blue-300'}`} />
        <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-15 ${isDark ? 'bg-violet-600' : 'bg-violet-300'}`} />
      </div>

      {/* Sidebar */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col shrink-0 w-full md:w-[300px] lg:w-[340px] h-full z-20 relative
        border-r ${isDark ? 'border-white/6 bg-[#161b27]/95 backdrop-blur-xl' : 'border-black/6 bg-white/95 backdrop-blur-xl'}`}>
        <Sidebar theme={theme} setTheme={setTheme} />
      </div>

      {/* Chat panel */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full min-w-0 relative z-10 md:p-3`}>
        {activeChat ? (
          <div className={`flex-1 flex flex-col h-full overflow-hidden md:rounded-2xl border shadow-2xl
            ${isDark ? 'bg-[#161b27]/90 border-white/6 backdrop-blur-xl' : 'bg-white/90 border-black/6 backdrop-blur-xl'}`}>

            {/* Chat Header */}
            <div className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 shrink-0 border-b z-30
              ${isDark ? 'bg-[#161b27]/95 border-white/6 backdrop-blur-xl' : 'bg-white/95 border-black/5 backdrop-blur-xl'}`}>

              {/* Back (mobile) */}
              <button
                onClick={handleBackToContacts}
                className={`md:hidden p-2 rounded-xl mr-1 transition-all hover:scale-105 active:scale-95
                  ${isDark ? 'bg-white/6 hover:bg-white/10 text-slate-300' : 'bg-black/5 hover:bg-black/8 text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Avatar */}
              <div className="relative shrink-0">
                {activeChat.profilePic
                  ? <img src={activeChat.profilePic} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-blue-500/20 shadow" alt="" />
                  : <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-blue-500/20 shadow">
                      {activeChat.name.charAt(0).toUpperCase()}
                    </div>
                }
                {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#161b27] animate-pulse" />}
              </div>

              {/* Name / status */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className={`font-bold text-[15px] sm:text-[16px] leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeChat.name}
                </h3>
                <p className={`text-xs font-medium transition-all ${isTyping ? 'text-blue-400 animate-pulse' : isOnline ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isTyping ? '● typing...' : isOnline ? '● Active now' : '○ Offline'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white/6 hover:bg-white/10 text-slate-300' : 'bg-black/5 hover:bg-black/8 text-slate-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <ChatBox theme={theme} isOnline={isOnline} />
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center h-full md:rounded-2xl border shadow-2xl text-center p-8
            ${isDark ? 'bg-[#161b27]/90 border-white/6 backdrop-blur-xl' : 'bg-white/90 border-black/6 backdrop-blur-xl'}`}>
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-900/40">
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/10 to-transparent" />
                <span className="text-4xl z-10 relative">💬</span>
              </div>
              <div className="absolute -inset-3 -z-10 rounded-[32px] blur-xl bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-30" />
            </div>
            <h2 className={`text-2xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white to-slate-400' : 'from-slate-800 to-slate-500'}`}>
              Chat App
            </h2>
            <p className={`text-sm max-w-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Select a friend and start chatting 💬
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
