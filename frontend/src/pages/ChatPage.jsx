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
  const [theme, setTheme] = useState("dark"); 

  useEffect(() => {
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

      socket.on("activeUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      const handleReceiveMessage = (msg) => {
        if (activeChat && (msg.sender === activeChat._id || msg.receiver === activeChat._id || msg.reciver === activeChat._id)) {
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
      } catch (e) {
        console.error(e);
      }
    };
    fetchMessages();
  }, [activeChat, dispatch]);

  const handleBackToContacts = () => {
    dispatch(setActiveChat(null));
  };

  const isOnline = activeChat && onlineUsers.includes(activeChat._id);
  const isTyping = activeChat && typingUsers.includes(activeChat._id);

  return (
    <div className={`fixed inset-0 flex overflow-hidden transition-colors duration-500 w-full ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-slate-900'} relative`}>
      
      {/* 3D Background Decoration */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-300/30'}`}></div>
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-indigo-300/30'}`}></div>

      {/* Sidebar View */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 lg:w-[360px] h-full z-20 shrink-0 relative transition-transform duration-300`}>
        <Sidebar theme={theme} setTheme={setTheme} />
      </div>

      {/* Main Chat View */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full relative z-10 min-w-0 md:p-3 perspective-1000`}>
        {activeChat ? (
          <div className={`flex-1 flex flex-col h-full overflow-hidden relative shadow-2xl backdrop-blur-2xl border transition-all duration-300 md:rounded-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-white/10' : 'bg-white/70 border-white/50 shadow-blue-900/5'}`}>
            
            {/* Chat Header */}
            <div className={`px-4 py-3 sm:px-6 sm:py-4 flex items-center shadow-md z-30 shrink-0 border-b ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white border-gray-200'}`}>
              
              <button 
                onClick={handleBackToContacts}
                className={`md:hidden mr-3 p-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shadow-sm ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="relative transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                {activeChat.profilePic ? (
                  <img src={activeChat.profilePic} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg object-cover ring-2 ring-white/10" alt="" />
                ) : (
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white/10`}>
                    {activeChat.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
                )}
              </div>
              
              <div className="flex flex-col ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className={`text-lg sm:text-xl font-extrabold tracking-wide truncate drop-shadow-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{activeChat.name}</h3>
                <p className={`text-xs sm:text-sm font-semibold truncate ${isTyping ? 'text-indigo-400 animate-pulse' : isOnline ? 'text-green-500' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                  {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <ChatBox theme={theme} isOnline={isOnline} />
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center flex-col z-10 h-full p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl border transition-all duration-300 md:rounded-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-white/10' : 'bg-white/70 border-white/50 shadow-blue-900/5'}`}>
             <div className="w-28 h-28 sm:w-36 sm:h-36 mb-6 sm:mb-8 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl relative overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-white/10 animate-pulse backdrop-blur-md"></div>
              <span className="text-5xl sm:text-6xl drop-shadow-2xl z-10 relative">💬</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl font-black mb-4 tracking-tight px-4 bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark' ? 'from-white to-slate-400' : 'from-slate-900 to-slate-500'}`}>Chat App</h2>
            <p className={`text-base sm:text-lg max-w-md px-4 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Start a conversation by selecting a contact from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
