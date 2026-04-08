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
  const [theme, setTheme] = useState("dark"); // Default dark for professional look

  useEffect(() => {
    // Apply theme class to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Global socket setup
  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("join", user._id);

      socket.on("activeUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      const handleReceiveMessage = (msg) => {
        // If chat is open with the sender, add it to chat history
        if (activeChat && (msg.sender === activeChat._id || msg.receiver === activeChat._id || msg.reciver === activeChat._id)) {
           dispatch(addMessage(msg));
        } else {
           // If chat is NOT open with sender, increment unread counter
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

  // Load active chat messages
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
    <div className={`flex h-[100dvh] overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      
      {/* Theme Toggle Floating Button */}
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`absolute top-4 right-4 md:right-auto md:left-4 z-50 p-2.5 rounded-full shadow-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-gray-100'}`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Sidebar View */}
      <div className={`${activeChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-[350px] h-full shadow-xl z-20 shrink-0 relative ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-gray-200'} backdrop-blur-xl border-r`}>
        <Sidebar theme={theme} />
      </div>

      {/* Main Chat View */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative z-10 min-w-0 ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
        {activeChat ? (
          <div className={`flex-1 flex flex-col h-full overflow-hidden relative shadow-2xl`}>
            
            {/* Chat Header */}
            <div className={`px-4 py-3 sm:px-6 sm:py-4 flex items-center shadow-sm z-30 shrink-0 backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/90 border-b border-slate-800' : 'bg-white/90 border-b border-gray-200'}`}>
              
              {/* Mobile Back Button */}
              <button 
                onClick={handleBackToContacts}
                className={`md:hidden mr-3 p-2 rounded-full transition-all focus:outline-none ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="relative">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shrink-0 bg-blue-600`}>
                  {activeChat.name.charAt(0).toUpperCase()}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full border-white dark:border-slate-900"></div>
                )}
              </div>
              <div className="flex flex-col ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className={`text-lg sm:text-xl font-bold tracking-wide truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{activeChat.name}</h3>
                <p className={`text-xs sm:text-sm font-medium truncate ${isTyping ? 'text-blue-500' : isOnline ? 'text-green-500' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                  {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <ChatBox theme={theme} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col z-10 p-6 sm:p-8 text-center">
             <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
              <span className="text-4xl sm:text-5xl drop-shadow-md z-10">💬</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight drop-shadow-sm px-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Welcome to Messenger</h2>
            <p className={`text-base sm:text-lg max-w-sm px-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Select a contact from the sidebar to chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
