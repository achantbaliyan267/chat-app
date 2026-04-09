import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  friends: [],
  messages: [],
  activeChat: null,
  onlineUsers: [],
  typingUsers: [],
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setFriends(state, action) {
      state.friends = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload;
      // Clear unread count when opening a chat
      if (action.payload) {
        state.unreadCounts[action.payload._id] = 0;
      }
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    addTypingUser(state, action) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser(state, action) {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
    incrementUnread(state, action) {
      const senderId = action.payload;
      if (state.activeChat?._id !== senderId) {
        if (!state.unreadCounts[senderId]) {
          state.unreadCounts[senderId] = 0;
        }
        state.unreadCounts[senderId] += 1;
      }
    },
    updateMessageStatus(state, action) {
      // Mark all messages from a sender as 'read' in local state
      const { senderId } = action.payload;
      state.messages = state.messages.map(msg => {
        const msgSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
        if (msgSenderId === senderId && msg.status !== 'read') {
          return { ...msg, status: 'read' };
        }
        return msg;
      });
    }
  },
});

export const { 
  setFriends, setMessages, setActiveChat, addMessage, 
  setOnlineUsers, addTypingUser, removeTypingUser, incrementUnread, updateMessageStatus
} = chatSlice.actions;

export default chatSlice.reducer;
