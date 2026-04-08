import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { setMessages, setActiveChat } from "../redux/chatSlice";

import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((state) => state.chat);

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

  return (
    <div className="flex h-[100dvh] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Sidebar View - Hidden on mobile if chat is active */}
      <div className={`${activeChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 lg:w-1/4 md:min-w-[320px] h-full shadow-2xl z-20 shrink-0 relative bg-slate-900/60`}>
        <Sidebar />
      </div>

      {/* Main Chat View - Hidden on mobile if NO chat is active */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-900/40 backdrop-blur-sm relative shadow-inner z-10 min-w-0`}>
        {activeChat ? (
          <div className="flex-1 flex flex-col h-full bg-white/5 backdrop-blur-md md:rounded-tl-2xl overflow-hidden border-t md:border-l border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] relative">
            
            {/* Chat Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white/5 border-b border-white/10 flex items-center shadow-sm z-30 shrink-0">
              
              {/* Mobile Back Button */}
              <button 
                onClick={handleBackToContacts}
                className="md:hidden mr-3 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ring-2 ring-white/20 shrink-0">
                {activeChat.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">{activeChat.name}</h3>
                <p className="text-xs sm:text-sm text-indigo-300 truncate">@{activeChat.username}</p>
              </div>
            </div>

            <ChatBox />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col z-10 p-6 sm:p-8 text-center bg-white/5 backdrop-blur-md rounded-tl-2xl border-t border-l border-white/10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 animate-pulse"></div>
              <span className="text-4xl sm:text-5xl drop-shadow-md z-10">💬</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-4 tracking-tight drop-shadow-sm px-4">Welcome to Messenger</h2>
            <p className="text-base sm:text-lg text-indigo-200/80 max-w-sm px-4">Tap on any user from the Global Contacts sidebar to start your encrypted real-time chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
