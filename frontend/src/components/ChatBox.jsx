import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { addMessage, updateMessageStatus } from "../redux/chatSlice";
import { socket } from "../socket/socket";

/* ── Helpers ───────────────────────────────────────────────── */
const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const fmtTime = (d) => new Date(d || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ── WhatsApp-style SVG ticks ──────────────────────────────── */
const Tick = ({ status }) => {
  if (status === "read")
    return (
      <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
        <path d="M1 5.5l4 4L13 1" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5.5l4 4 8-8.5" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (status === "delivered")
    return (
      <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
        <path d="M1 5.5l4 4L13 1" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5.5l4 4 8-8.5" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  return (
    <svg width="12" height="11" viewBox="0 0 12 11" fill="none">
      <path d="M1 5.5l4 4L11 1" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

/* ── Emoji quick-react bar ─────────────────────────────────── */
const EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

const ChatBox = ({ theme, isOnline }) => {
  const dispatch = useDispatch();
  const { messages, activeChat, typingUsers } = useSelector((s) => s.chat);
  const user = useSelector((s) => s.auth?.user) || JSON.parse(localStorage.getItem("user"));
  const isDark = theme === "dark";

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFocused, setIsFocused]   = useState(false);
  const [reactions, setReactions]   = useState({});   // { msgIndex: emoji }
  const [hovered, setHovered]       = useState(null);  // msg index

  const containerRef    = useRef(null);
  const typingTimeout   = useRef(null);
  const imageInputRef   = useRef(null);

  /* auto-scroll */
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typingUsers]);

  /* mark read */
  useEffect(() => {
    if (!activeChat?._id) return;
    API.put(`/messages/read/${activeChat._id}`)
      .then(() => dispatch(updateMessageStatus({ senderId: activeChat._id })))
      .catch(() => {});
  }, [activeChat]);

  const handleInput = (e) => {
    setNewMessage(e.target.value);
    if (activeChat) {
      socket.emit("typing", { senderId: user._id, receiverId: activeChat._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: user._id, receiverId: activeChat._id });
      }, 2000);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    try {
      socket.emit("stopTyping", { senderId: user._id, receiverId: activeChat._id });
      const { data } = await API.post(`/messages/send/${activeChat._id}`, { text: newMessage, image: selectedImage });
      dispatch(addMessage(data));
      socket.emit("sendMessage", data);
      setNewMessage(""); setSelectedImage(null);
    } catch { alert("Failed to send."); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSend(e);
  };

  const toggleReaction = (idx, emoji) => {
    setReactions(prev => ({
      ...prev,
      [idx]: prev[idx] === emoji ? undefined : emoji,
    }));
    setHovered(null);
  };

  const isOtherTyping = activeChat && typingUsers.includes(activeChat._id);

  /* ── Build message list with date separators ── */
  const renderMessages = () => {
    const items = [];
    messages.forEach((msg, idx) => {
      const isSender = msg.sender === user?._id || msg.sender?._id === user?._id;
      const prev = messages[idx - 1];

      // Date separator
      if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
        items.push(
          <div key={`date-${idx}`} className="flex items-center gap-3 my-4">
            <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-black/8"}`} />
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${isDark ? "bg-white/6 text-slate-400" : "bg-black/5 text-slate-500"}`}>
              {formatDateLabel(msg.createdAt)}
            </span>
            <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-black/8"}`} />
          </div>
        );
      }

      // Avatar: show only if last in a group from same sender
      const nextMsg = messages[idx + 1];
      const isLastInGroup = !nextMsg || (
        (typeof nextMsg.sender === "object" ? nextMsg.sender._id : nextMsg.sender) !==
        (typeof msg.sender === "object" ? msg.sender._id : msg.sender)
      );

      items.push(
        <div
          key={msg._id || idx}
          className={`flex items-end gap-2 mb-1 ${isSender ? "justify-end" : "justify-start"}`}
          style={{ animation: `msgIn 0.2s ease-out both` }}
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Receiver avatar */}
          {!isSender && (
            <div className="w-8 shrink-0 mb-0.5">
              {isLastInGroup && (
                activeChat?.profilePic
                  ? <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover" alt="" />
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {activeChat?.name?.charAt(0).toUpperCase()}
                    </div>
              )}
            </div>
          )}

          {/* Bubble + reaction */}
          <div className={`relative flex flex-col max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
            
            {/* Emoji reaction picker on hover */}
            {hovered === idx && (
              <div className={`absolute ${isSender ? "right-0 -top-10" : "left-0 -top-10"} z-20 flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-xl border backdrop-blur-xl
                ${isDark ? "bg-slate-800/95 border-white/10" : "bg-white/95 border-black/8"}`}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    onClick={() => toggleReaction(idx, em)}
                    className={`text-base transition-transform hover:scale-125 active:scale-90 ${reactions[idx] === em ? "scale-125" : ""}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* Bubble */}
            <div className={`relative px-3.5 py-2.5 text-[14px] leading-relaxed break-words shadow-sm transition-shadow duration-200 hover:shadow-md
              ${isSender
                ? isDark
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                  : "bg-blue-500 text-white rounded-2xl rounded-br-md"
                : isDark
                  ? "bg-slate-800 text-slate-100 rounded-2xl rounded-bl-md"
                  : "bg-white text-slate-800 rounded-2xl rounded-bl-md ring-1 ring-black/5"
              }`}
            >
              {/* Sender shine overlay */}
              {isSender && (
                <div className="absolute inset-0 rounded-2xl rounded-br-md bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              )}
              {msg.image && (
                <img src={msg.image} alt="img" className="max-w-full rounded-xl mb-2 max-h-56 object-cover shadow" />
              )}
              {msg.text}

              {/* Time + tick */}
              <div className={`flex items-center justify-end gap-1.5 mt-1 ${isSender ? "text-blue-200/80" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                <span className="text-[10px] font-medium">{fmtTime(msg.createdAt)}</span>
                {isSender && <Tick status={msg.status || "sent"} />}
              </div>
            </div>

            {/* Emoji reaction display */}
            {reactions[idx] && (
              <button
                onClick={() => toggleReaction(idx, reactions[idx])}
                className={`text-xs mt-0.5 px-1.5 py-0.5 rounded-full border transition-all hover:scale-105
                  ${isDark ? "bg-slate-800 border-white/10 text-slate-300" : "bg-white border-black/8 text-slate-700"} shadow-sm`}
              >
                {reactions[idx]}
              </button>
            )}
          </div>

          {/* Spacer so sender bubbles don't hug the edge */}
          {isSender && <div className="w-0" />}
        </div>
      );
    });
    return items;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Messages */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-4 sm:px-5 py-4 no-scrollbar`}
        style={{
          backgroundImage: isDark
            ? "radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.04) 0%, transparent 60%)"
            : "radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.03) 0%, transparent 60%)",
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <span className="text-4xl">👋</span>
            <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>Say hi to {activeChat?.name?.split(" ")[0]}!</p>
          </div>
        )}

        {renderMessages()}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex items-end gap-2 mb-1" style={{ animation: "msgIn 0.2s ease-out both" }}>
            <div className="w-8 shrink-0 mb-0.5">
              {activeChat?.profilePic
                ? <img src={activeChat.profilePic} className="w-8 h-8 rounded-full object-cover" alt="" />
                : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {activeChat?.name?.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-bl-md shadow flex items-center gap-1.5 ${isDark ? "bg-slate-800" : "bg-white ring-1 ring-black/5"}`}>
              {[0, 160, 320].map(delay => (
                <span key={delay} className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-slate-400" : "bg-slate-300"}`} style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className={`shrink-0 px-3 py-3 border-t backdrop-blur-xl transition-all
        ${isDark ? "bg-slate-900/95 border-white/8" : "bg-white/95 border-black/6"}`}>

        {/* Image preview */}
        {selectedImage && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              <img src={selectedImage} alt="preview" className="h-14 w-14 rounded-xl object-cover shadow ring-1 ring-white/10" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-400 text-white rounded-full text-xs flex items-center justify-center shadow-md"
              >✕</button>
            </div>
            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Image selected</span>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Image btn */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95
              ${isDark ? "bg-white/8 hover:bg-white/12 text-slate-300" : "bg-black/5 hover:bg-black/10 text-slate-500"}`}
          >
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>

          {/* Text input */}
          <input
            type="text"
            value={newMessage}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all duration-200
              ${isDark
                ? "bg-white/7 text-slate-100 placeholder-slate-500 ring-1 ring-white/8 focus:ring-2 focus:ring-blue-500/50"
                : "bg-black/5 text-slate-900 placeholder-slate-400 ring-1 ring-black/6 focus:ring-2 focus:ring-blue-400/50 focus:bg-white"
              }`}
          />

          {/* Send */}
          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedImage}
            className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md
              ${(!newMessage.trim() && !selectedImage)
                ? isDark ? "bg-white/6 text-slate-600 cursor-not-allowed" : "bg-black/5 text-slate-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(10px) scale(.97); } to { opacity:1; transform:none; } }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
};

export default ChatBox;
