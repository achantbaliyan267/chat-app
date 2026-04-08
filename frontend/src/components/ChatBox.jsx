import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { addMessage } from "../redux/chatSlice";
import { socket } from "../socket/socket";

const ChatBox = () => {
  const dispatch = useDispatch();
  const { messages, activeChat } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("join", user._id);
    }
  }, [user]);

  useEffect(() => {
    const handleReceive = (msg) => {
      // Allow if activeChat matches sender or receiver
      if (activeChat && (msg.sender === activeChat._id || msg.receiver === activeChat._id || msg.reciver === activeChat._id)) {
        dispatch(addMessage(msg));
      }
    };
    
    socket.on("receiveMessage", handleReceive);
    
    return () => socket.off("receiveMessage", handleReceive);
  }, [activeChat, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const { data } = await API.post(`/messages/send/${activeChat._id}`, {
        text: newMessage,
      });

      // Add to local state immediately
      dispatch(addMessage(data));

      // Emit to server for the other client
      socket.emit("sendMessage", data);
      
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
          return (
            <div key={index} className={`flex ${isSender ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {(!isSender && activeChat) && (
                <div className="w-8 h-8 mr-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-auto">
                    {activeChat.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div 
                className={`max-w-[75%] px-5 py-3 rounded-3xl shadow-sm text-[15px] leading-relaxed font-medium ${
                  isSender 
                  ? "bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-br-sm" 
                  : "bg-white/10 text-white rounded-bl-sm border border-white/5"
                }`}
              >
                {msg.text || msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-5 bg-white/5 border-t border-white/10 backdrop-blur-md shrink-0">
        <form onSubmit={handleSendMessage} className="flex relative items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message...`}
            className="flex-1 bg-white/10 border border-white/20 pl-4 sm:pl-6 pr-14 sm:pr-16 py-3 sm:py-4 rounded-full text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/15 transition-all shadow-inner text-sm sm:text-base"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-1 sm:right-2 w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 -mr-0.5 sm:-mr-1">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
