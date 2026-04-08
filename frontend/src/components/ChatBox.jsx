import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { addMessage } from "../redux/chatSlice";
import { socket } from "../socket/socket";

const ChatBox = ({ theme }) => {
  const dispatch = useDispatch();
  const { messages, activeChat, typingUsers } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing status
    if (activeChat) {
      socket.emit("typing", { senderId: user._id, receiverId: activeChat._id });
      
      // Clear timeout and set a new one to stop typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: user._id, receiverId: activeChat._id });
      }, 2000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

      // Add to local state immediately
      dispatch(addMessage(data));

      // Emit to server for the other client
      socket.emit("sendMessage", data);
      
      setNewMessage("");
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send message over API. Check network.");
    }
  };

  const isOtherTyping = activeChat && typingUsers.includes(activeChat._id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, index) => {
          const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
          return (
            <div key={index} className={`flex ${isSender ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
              {(!isSender && activeChat) && (
                <div className="mr-3 mt-auto shrink-0 transition-transform duration-300 hover:scale-105">
                  {activeChat.profilePic ? (
                    <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent drop-shadow-md" alt="" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-500'}`}>
                        {activeChat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              
              <div 
                className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed font-medium ${
                  isSender 
                  ? "bg-blue-600 text-white rounded-br-sm" 
                  : (theme === 'dark' ? "bg-slate-800 text-slate-100 rounded-bl-sm" : "bg-white text-slate-800 rounded-bl-sm border border-gray-100")
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="Attachment" className="max-w-full rounded-lg mb-2 object-cover max-h-64" />
                )}
                {msg.text && <div>{msg.text}</div>}
                
                <div className={`text-[10px] mt-1 text-right opacity-60 ${isSender ? 'text-blue-100' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-400')}`}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {isOtherTyping && (
           <div className="flex justify-start animate-in fade-in duration-300">
             <div className="mr-3 mt-auto shrink-0 transition-transform duration-300 hover:scale-105">
                {activeChat.profilePic ? (
                   <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent drop-shadow-md" alt="" />
                ) : (
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-500'}`}>
                      {activeChat.name.charAt(0).toUpperCase()}
                   </div>
                )}
             </div>
             <div className={`px-4 py-3 rounded-2xl rounded-bl-sm flex items-center space-x-1 shadow-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-gray-100'}`}>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-3 sm:p-4 border-t shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        {selectedImage && (
          <div className="mb-3 relative inline-block p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded object-cover" />
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex relative items-center w-full mx-auto gap-2">
          
          {/* Image Upload Button */}
          <label className={`w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center rounded-full cursor-pointer transition-colors shrink-0 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-slate-500'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-3 sm:py-3.5 rounded-2xl focus:outline-none transition-all shadow-sm text-sm sm:text-base ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500' : 'bg-gray-100 border-gray-200 text-slate-900 placeholder-slate-500 focus:ring-1 focus:ring-blue-400'}`}
          />

          <button 
            type="submit"
            disabled={!newMessage.trim() && !selectedImage}
            className="shrink-0 w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-md transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 ml-1">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
