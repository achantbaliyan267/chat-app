import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { addMessage, updateMessageStatus } from "../redux/chatSlice";
import { socket } from "../socket/socket";

// WhatsApp-style tick SVG components
const SingleTick = ({ color = "#94a3b8" }) => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 5.5L5.5 9.5L14.5 1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoubleTick = ({ color = "#60a5fa" }) => (
  <svg width="20" height="11" viewBox="0 0 20 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 5.5L5.5 9.5L14.5 1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 5.5L10 9.5L19 1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MessageStatus = ({ msg, isSender }) => {
  if (!isSender) return null;
  const status = msg.status || "sent";
  if (status === "read") return <DoubleTick color="#60a5fa" />;
  if (status === "delivered") return <DoubleTick color="#94a3b8" />;
  return <SingleTick color="#94a3b8" />;
};

const ChatBox = ({ theme, isOnline }) => {
  const dispatch = useDispatch();
  const { messages, activeChat, typingUsers } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, typingUsers]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (activeChat?._id) {
      API.put(`/messages/read/${activeChat._id}`)
        .then(() => {
          dispatch(updateMessageStatus({ senderId: activeChat._id }));
        })
        .catch(() => {});
    }
  }, [activeChat]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (activeChat) {
      socket.emit("typing", { senderId: user._id, receiverId: activeChat._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: user._id, receiverId: activeChat._id });
      }, 2000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be less than 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeChat) return;
    try {
      socket.emit("stopTyping", { senderId: user._id, receiverId: activeChat._id });
      const { data } = await API.post(`/messages/send/${activeChat._id}`, {
        text: newMessage,
        image: selectedImage
      });
      dispatch(addMessage(data));
      socket.emit("sendMessage", data);
      setNewMessage("");
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    }
  };

  const isOtherTyping = activeChat && typingUsers.includes(activeChat._id);
  const isDark = theme === 'dark';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      
      {/* Messages Area */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar ${isDark ? 'bg-gradient-to-b from-slate-950/0 to-slate-950/0' : ''}`}
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(ellipse at top left, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.05) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at top left, rgba(59,130,246,0.04) 0%, transparent 50%)',
        }}
      >
        {messages.map((msg, index) => {
          const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
          const prevMsg = messages[index - 1];
          const showAvatar = !isSender && (!prevMsg || (prevMsg.sender !== msg.sender && prevMsg.sender?._id !== msg.sender?._id));
          const isLastFromSender = !messages[index + 1] || (messages[index + 1].sender !== msg.sender && messages[index + 1].sender?._id !== msg.sender?._id);

          return (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}
              style={{ animation: `slideUp 0.25s ease-out ${Math.min(index * 0.03, 0.3)}s both` }}
            >
              {/* Avatar for received messages */}
              {!isSender && (
                <div className="w-8 shrink-0 mb-1">
                  {isLastFromSender && (
                    activeChat?.profilePic
                      ? <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover shadow-md ring-1 ring-white/10" alt="" />
                      : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${isDark ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                          {activeChat?.name?.charAt(0).toUpperCase()}
                        </div>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[72%] flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                <div
                  className={`relative px-4 py-2.5 text-[14.5px] leading-relaxed break-words shadow-lg transition-all duration-200 hover:shadow-xl
                    ${isSender
                      ? isDark
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md backdrop-blur-sm ring-1 ring-blue-500/30'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md shadow-blue-200'
                      : isDark
                        ? 'bg-slate-800/80 backdrop-blur-sm text-slate-100 rounded-2xl rounded-bl-md ring-1 ring-white/8'
                        : 'bg-white/90 backdrop-blur-sm text-slate-800 rounded-2xl rounded-bl-md ring-1 ring-black/5 shadow-sm'
                    }`}
                >
                  {/* Glassmorphism shine for sender */}
                  {isSender && (
                    <div className="absolute inset-0 rounded-2xl rounded-br-md bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                  )}

                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="attachment"
                      className="max-w-full rounded-xl mb-2 object-cover max-h-60 shadow-md"
                    />
                  )}
                  {msg.text && <span>{msg.text}</span>}

                  {/* Time + Tick */}
                  <div className={`flex items-center justify-end gap-1.5 mt-1 ${isSender ? 'text-blue-200/80' : isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    <span className="text-[10.5px] font-medium">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <MessageStatus msg={msg} isSender={isSender} />
                  </div>
                </div>
              </div>

              {/* Spacer for sent messages (no avatar) */}
              {isSender && <div className="w-0" />}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isOtherTyping && (
          <div className="flex items-end gap-2 justify-start" style={{ animation: 'slideUp 0.2s ease-out both' }}>
            <div className="w-8 shrink-0 mb-1">
              {activeChat?.profilePic
                ? <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover shadow-md ring-1 ring-white/10" alt="" />
                : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isDark ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    {activeChat?.name?.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5 shadow-md ${isDark ? 'bg-slate-800/80 backdrop-blur-sm ring-1 ring-white/8' : 'bg-white/90 ring-1 ring-black/5'}`}>
              <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`} style={{ animationDelay: '160ms' }} />
              <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`} style={{ animationDelay: '320ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className={`shrink-0 px-3 py-3 border-t transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-white/8 backdrop-blur-xl' : 'bg-white/95 border-gray-200 backdrop-blur-xl'}`}>
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img src={selectedImage} alt="preview" className="h-16 w-16 rounded-xl object-cover shadow-md ring-1 ring-white/10" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg transition-all"
              >✕</button>
            </div>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Image ready to send</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          
          {/* Image button */}
          <label className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 ring-1 ring-white/8' : 'bg-gray-100 hover:bg-gray-200 text-slate-500'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </label>

          {/* Text Input */}
          <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'scale-[1.01]' : ''}`}>
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type a message..."
              className={`w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none transition-all duration-200
                ${isDark
                  ? 'bg-slate-800 text-white placeholder-slate-500 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/60'
                  : 'bg-gray-100 text-slate-900 placeholder-slate-400 ring-1 ring-black/5 focus:ring-2 focus:ring-blue-400/50 focus:bg-white'
                }`}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedImage}
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95
              ${(!newMessage.trim() && !selectedImage)
                ? (isDark ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-blue-500/30'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.4); }
      `}</style>
    </div>
  );
};

export default ChatBox;
