# PROJECT SYNOPSIS

---

<div align="center">

## MERN Stack Real-Time Chat Application

**A Full-Stack Web Application with WebSocket-Based Live Messaging**

---

**Submitted By:** Priyanshu Panwar
**GitHub Repository:** https://github.com/achantbaliyan267/chat-app
**Technology Stack:** MongoDB · Express.js · React.js · Node.js · Socket.IO

---

</div>

---

## 1. PROJECT TITLE

**"ChatterBox — A Real-Time Chat Application Built on the MERN Stack"**

---

## 2. ABSTRACT

ChatterBox is a modern, full-stack real-time chat web application developed using the MERN (MongoDB, Express.js, React.js, Node.js) technology stack. The application enables users to communicate instantly with each other through a WebSocket-based bidirectional connection powered by Socket.IO. The system supports user registration, authentication via JSON Web Tokens (JWT), a friend/contact management system, real-time typing indicators, message read receipts, profile management with photo upload, and a guest access mode — all wrapped in a premium dark glassmorphism UI.

The project demonstrates the practical integration of modern web technologies to build a production-grade, responsive, and scalable communication platform.

---

## 3. INTRODUCTION

### 3.1 Background

Real-time communication has become a fundamental requirement of modern digital life. From workplace collaboration tools like Slack to social messaging platforms like WhatsApp, the ability to exchange messages instantly has transformed how people interact. Traditional HTTP-based request-response models are insufficient for real-time communication because they require the client to repeatedly "poll" the server for new data — an inefficient and resource-heavy approach.

This project addresses that problem by implementing WebSocket technology through Socket.IO, which maintains a persistent, bidirectional connection between the client and server. This allows the server to **push** messages to the client the moment they arrive, with zero polling overhead.

### 3.2 Problem Statement

> *"Build a secure, scalable, and real-time web chat application that allows registered and guest users to communicate privately, manage their social connections, and personalize their profiles — accessible from any modern web browser without app installation."*

### 3.3 Motivation

- Growing demand for real-time web applications
- Practical application of full-stack JavaScript development skills
- Understanding of WebSocket protocol and event-driven architecture
- Hands-on experience with modern state management (Redux Toolkit)
- Implementation of industry-standard security practices (JWT, bcrypt hashing)

---

## 4. OBJECTIVES

| # | Objective |
|---|-----------|
| 1 | Implement a secure user authentication system (Signup / Login / JWT) |
| 2 | Enable real-time, private one-to-one messaging using Socket.IO WebSockets |
| 3 | Build a friend/contact management system (send, accept, reject requests) |
| 4 | Create a dedicated profile page with photo upload and detail editing |
| 5 | Allow guest users to join without registration using unique identities |
| 6 | Show live online/offline presence indicators for all users |
| 7 | Implement real-time typing indicators and message read receipts |
| 8 | Design a responsive, mobile-first UI with dark glassmorphism aesthetics |
| 9 | Deploy the application for live access via GitHub-integrated workflow |

---

## 5. SYSTEM ARCHITECTURE

### 5.1 Architecture Overview

The application follows a **Client-Server Architecture** with a **Three-Tier Design**:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT TIER                          │
│          React.js + Redux Toolkit (Vite Build)           │
│    Browser ←──── WebSocket (Socket.IO) ────→ Server     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST API (Axios)
┌──────────────────────▼──────────────────────────────────┐
│                   APPLICATION TIER                        │
│        Node.js + Express.js REST API Server              │
│        Socket.IO WebSocket Server (same process)         │
│        JWT Authentication Middleware                      │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│                     DATA TIER                             │
│              MongoDB Atlas (Cloud Database)               │
│         Collections: Users, Messages                      │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Communication Model

```
User A Browser                    Server                    User B Browser
     │                               │                              │
     │── HTTP POST /auth/login ──►   │                              │
     │◄── JWT Token ─────────────    │                              │
     │                               │                              │
     │── WebSocket Connect ────────► │ ◄──── WebSocket Connect ─── │
     │── emit("join", userId) ─────► │ ◄──── emit("join", userId) ─│
     │                               │──► emit("activeUsers",[]) ──►│
     │                               │                              │
     │── emit("sendMessage", msg) ──►│──────► emit("receiveMessage")│
     │                               │                              │
     │── emit("typing") ───────────► │──────────────► emit("typing")│
     │                               │                              │
```

---

## 6. TECHNOLOGY STACK

### 6.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | ^18.x | Component-based UI framework |
| **Vite** | Latest | Fast build tool and dev server |
| **Redux Toolkit** | Latest | Global state management |
| **React Router DOM** | v6 | Client-side routing (SPA navigation) |
| **Axios** | Latest | HTTP API calls to backend |
| **Socket.IO Client** | ^4.8.x | Real-time WebSocket communication |
| **TailwindCSS** | v3 | Utility-first CSS styling |

### 6.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest LTS | JavaScript runtime environment |
| **Express.js** | ^5.x | Web application framework for REST APIs |
| **Socket.IO** | ^4.8.3 | WebSocket server for real-time events |
| **Mongoose** | ^9.3.0 | MongoDB Object Data Modeling (ODM) |
| **bcryptjs** | ^3.0.3 | Password hashing and verification |
| **jsonwebtoken** | ^9.0.3 | JWT creation and verification |
| **dotenv** | ^17.x | Environment variable management |
| **cors** | ^2.8.6 | Cross-Origin Resource Sharing |
| **nodemon** | ^3.x | Auto-restart server in development |

### 6.3 Database

| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose ODM** | Schema validation and querying |

### 6.4 Development & Deployment

| Tool | Purpose |
|------|---------|
| **Git & GitHub** | Version control and code hosting |
| **VS Code** | Primary code editor |
| **Postman** | API testing |
| **npm** | Package management |

---

## 7. DATABASE DESIGN

### 7.1 User Collection Schema

```javascript
User {
  _id        : ObjectId          // Unique user identifier (MongoDB auto-generated)
  name       : String (required) // Full name
  username   : String (unique)   // Unique @username (lowercase)
  email      : String (unique)   // Email address
  phone      : String            // Phone number
  password   : String            // bcrypt hashed password (never stored plaintext)
  profilePic : String            // Base64 image or URL (default: "")
  bio        : String            // User bio, max 200 characters
  isGuest    : Boolean           // true for guest accounts (default: false)
  friends    : [ObjectId]        // Array of User references (friends list)
  friendRequests: [ObjectId]     // Array of pending friend request sender IDs
  createdAt  : Date              // Auto-generated by Mongoose timestamps
  updatedAt  : Date              // Auto-generated by Mongoose timestamps
}
```

### 7.2 Message Collection Schema

```javascript
Message {
  _id       : ObjectId           // Unique message identifier
  sender    : ObjectId (ref:User)// Who sent the message
  reciver   : ObjectId (ref:User)// Who receives the message
  text      : String             // Text content of the message
  image     : String             // Image attachment (Base64 or URL)
  status    : Enum               // "sent" | "delivered" | "read"
  createdAt : Date               // Message timestamp
  updatedAt : Date               // Last update time
}
```

### 7.3 Entity Relationship Diagram

```
┌──────────────┐              ┌───────────────┐
│     USER     │              │    MESSAGE     │
│──────────────│              │───────────────│
│ _id (PK)     │◄─────────── │ sender (FK)   │
│ name         │              │ reciver (FK)  │──────────►│ USER │
│ username     │              │ text          │
│ email        │              │ image         │
│ phone        │              │ status        │
│ password     │              │ createdAt     │
│ profilePic   │              └───────────────┘
│ bio          │
│ isGuest      │
│ friends[]────┼──────────────► USER (self-ref)
│ friendReqs[] ┼──────────────► USER (self-ref)
└──────────────┘
```

---

## 8. MODULE DESCRIPTION

The application is organized into the following major modules:

### Module 1: Authentication System

**Files:** `authController.js`, `authRoutes.js`, `authMiddleware.js`

This module handles all authentication operations:

- **User Registration (Signup):** Accepts name, username, email, phone, password. Validates for duplicate users, hashes password with bcrypt (salt rounds: 10), creates user document, returns JWT token.
- **User Login:** Accepts username/email + password, verifies credentials against hashed password, returns JWT token valid for 7 days.
- **Guest Login:** Generates a UUID-based unique guest user automatically (no form filling needed). Guest token is valid for 24 hours.
- **JWT Middleware:** Every protected route verifies the `Authorization: Bearer <token>` header before processing the request.

```
POST /api/auth/signup      → Register new user
POST /api/auth/login       → Login existing user  
POST /api/auth/guest-login → Join as temporary guest
```

---

### Module 2: User & Friend Management

**Files:** `userController.js`, `userRoutes.js`

This module manages user-to-user social connections:

- **User Search:** Search users by username using MongoDB regex
- **Friend Requests:** Send, accept, or reject friend requests
- **Friends List:** Retrieve the authenticated user's friends
- **Profile Management:** View and update profile (name, username, phone, bio)
- **Profile Photo Upload:** Accept Base64-encoded image, store in DB (max 2MB enforced on client)

```
GET  /api/users/search              → Search users by username
POST /api/users/send-request/:id    → Send friend request
POST /api/users/accept-request/:id  → Accept friend request
POST /api/users/reject-request/:id  → Reject friend request
GET  /api/users/friend-requests     → Get pending requests
GET  /api/users/friends             → Get friends list
GET  /api/users/profile             → Get current user profile
PUT  /api/users/profile             → Update profile details
PUT  /api/users/profile-pic         → Update profile photo
```

---

### Module 3: Messaging System

**Files:** `messageController.js`, `messageRoutes.js`, `Message.js`

This module handles the core chat functionality:

- **Send Message:** Store text/image message from sender to receiver in MongoDB
- **Get Messages:** Retrieve conversation history between two users
- **Message Status:** Track delivery state — `sent → delivered → read`

```
POST /api/messages/send        → Send a new message (text/image)
GET  /api/messages/:userId     → Fetch chat history with a user
```

---

### Module 4: Real-Time Socket.IO Engine

**File:** `sockets/socket.js`

The Socket.IO server manages all live events:

| Event (Client → Server) | Description |
|--------------------------|-------------|
| `join` | User connects — added to active users map and their personal "room" |
| `sendMessage` | Routes message to receiver's Socket.IO room in real-time |
| `typing` | Broadcasts typing indicator to receiver |
| `stopTyping` | Clears typing indicator |
| `messageDelivered` | Updates message status to "delivered" in DB |
| `messageRead` | Updates message status to "read" in DB |
| `disconnect` | Removes user from active map, broadcasts updated online list |

| Event (Server → Client) | Description |
|--------------------------|-------------|
| `activeUsers` | Broadcasts array of all online user IDs |
| `receiveMessage` | Delivers a new message to the recipient |
| `typing` | Notifies that sender is typing |
| `stopTyping` | Notifies that sender stopped typing |

---

### Module 5: Frontend State Management (Redux)

**Files:** `redux/authSlice.js`, `redux/chatSlice.js`, `redux/store.js`

The application uses **Redux Toolkit** for global state:

#### `authSlice` — Authentication State
```
state.user  → Logged-in user object (persisted in localStorage)
state.token → JWT token (persisted in localStorage)

Actions:
  setUser(user, token) → On login/signup, save to Redux + localStorage
  logout()             → Clear user and token from Redux + localStorage
```

#### `chatSlice` — Chat Application State
```
state.friends      → Current user's friends list
state.messages     → Active conversation messages
state.activeChat   → Currently selected friend chat
state.onlineUsers  → Array of online user IDs (from Socket.IO)
state.typingUsers  → Array of users currently typing
state.unreadCounts → Map of userId → unread message count

Actions:
  setFriends, setMessages, setActiveChat, addMessage,
  setOnlineUsers, addTypingUser, removeTypingUser,
  incrementUnread, updateMessageStatus
```

---

### Module 6: Profile Page

**File:** `frontend/src/pages/ProfilePage.jsx`

A dedicated full-page profile view accessible at `/profile`:

- **Profile Photo:** Tap avatar to open file picker, enforces 2MB max client-side, uploads as Base64
- **Edit Mode:** Toggle edit mode to update Name, Username, Phone, Bio (max 200 chars)
- **Read-Only Fields:** Email and unique User ID (with copy button)
- **Guest Badge:** Shows "👤 Guest" indicator and "Create Account →" CTA for guest users
- **Member Since:** Shows formatted account creation date

---

### Module 7: Chat Interface

**Files:** `ChatBox.jsx`, `ChatPage.jsx`, `Sidebar.jsx`

- **Sidebar:** Shows friends, explore (all users), friend requests tabs; search; online stories row; real-time unread badges; profile footer
- **ChatBox:** Message history, send text/image, typing indicator display, message read receipts (✓ sent, ✓✓ delivered, blue ✓✓ read)
- **ChatPage:** Orchestrates layout, handles Socket.IO listeners, responsive split-view (sidebar ↔ chatbox)

---

## 9. KEY FEATURES

### ✅ Implemented Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Auth** | JWT-based login/signup with bcrypt password hashing |
| 👤 **Guest Login** | One-click guest access with UUID-based unique identity |
| 💬 **Real-Time Chat** | Instant messaging via Socket.IO WebSockets |
| 🖼️ **Image Sharing** | Send images in chat (Base64 encoded) |
| ✍️ **Typing Indicator** | Live "typing..." animation when friend types |
| 👁️ **Read Receipts** | Sent ✓ → Delivered ✓✓ → Read 🔵✓✓ |
| 🟢 **Online Presence** | Real-time green dot shows who is online |
| 🔔 **Unread Badges** | Badge count for messages in unopened chats |
| 👥 **Friend System** | Send/accept/reject friend requests |
| 🔍 **User Search** | Search users by username |
| 📸 **Profile Photo** | Upload/change photo (max 2MB enforced) |
| ✏️ **Profile Edit** | Edit name, username, phone, bio |
| 🌙 **Dark/Light Mode** | Toggle between dark and light themes |
| 📱 **Responsive Design** | Mobile-first layout with split-pane on desktop |
| 🎨 **Glassmorphism UI** | Premium frosted-glass dark aesthetic |

---

## 10. DATA FLOW DIAGRAM

### 10.1 Login Flow

```
User Fills Form
      │
      ▼
POST /api/auth/login
      │
      ▼
authMiddleware skipped (public route)
      │
      ▼
Find user by username/email in MongoDB
      │
      ├── Not Found → 400 Error
      │
      ▼
bcrypt.compare(password, hash)
      │
      ├── Mismatch → 400 Error
      │
      ▼
jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" })
      │
      ▼
Response: { token, user }
      │
      ▼
Redux setUser() + localStorage.setItem()
      │
      ▼
Navigate to "/" (ChatPage)
      │
      ▼
socket.connect() + socket.emit("join", user._id)
```

### 10.2 Message Sending Flow

```
User types message → clicks Send
           │
           ▼
POST /api/messages/send (HTTP)
  → Saved to MongoDB with status: "sent"
           │
           ▼
socket.emit("sendMessage", messageObj)
           │
           ▼
Server: io.to(receiverId).emit("receiveMessage", msg)
           │
           ▼
Receiver's browser: dispatch(addMessage(msg))
  → Message appears in UI instantly
           │
           ▼
Receiver opens chat → "messageRead" event emitted
  → MongoDB status updated to "read"
  → Sender UI shows blue double tick
```

---

## 11. SECURITY IMPLEMENTATION

| Security Concern | Implementation |
|-----------------|----------------|
| **Password Storage** | Passwords hashed with bcrypt (10 salt rounds) — never stored plaintext |
| **Authentication** | JWT tokens with expiry (7 days regular, 24h guest) |
| **Route Protection** | `authMiddleware` verifies JWT on every protected API call |
| **Request Size Limit** | Express configured with 50MB body limit for image transfers |
| **Guest Isolation** | Guest accounts have `isGuest: true` flag — limited profile editing |
| **Input Validation** | Username uniqueness check on profile updates prevents conflicts |
| **CORS** | Configured to allow frontend-backend communication |

---

## 12. SYSTEM REQUIREMENTS

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Dual Core 1.8 GHz | Quad Core 2.5 GHz+ |
| RAM | 4 GB | 8 GB |
| Storage | 500 MB free | 1 GB free |
| Network | 1 Mbps | 10 Mbps+ |

### Software Requirements

| Software | Version |
|----------|---------|
| Node.js | v18+ LTS |
| npm | v9+ |
| MongoDB Atlas | Latest |
| Web Browser | Chrome 90+, Firefox 88+, Edge 90+ |
| Git | v2.30+ |

---

## 13. PROJECT DIRECTORY STRUCTURE

```
mern-realtime-chat-app/
│
├── backend/                        # Node.js + Express Server
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js       # Signup, Login, Guest Login
│   │   ├── userController.js       # Profile, Friends, Search
│   │   └── messageController.js    # Send & fetch messages
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification middleware
│   ├── models/
│   │   ├── User.js                 # User schema (Mongoose)
│   │   └── Message.js              # Message schema (Mongoose)
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/* routes
│   │   ├── userRoutes.js           # /api/users/* routes
│   │   └── messageRoutes.js        # /api/messages/* routes
│   ├── sockets/
│   │   └── socket.js               # Socket.IO event handlers
│   ├── .env                        # Environment variables (secret)
│   ├── package.json
│   └── server.js                   # Main entry point
│
├── frontend/                       # React.js + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx         # Chat window with messages
│   │   │   ├── Sidebar.jsx         # Contact list & navigation
│   │   │   ├── MessageBubble.jsx   # Individual message component
│   │   │   └── PrivateRoute.jsx    # Auth guard for protected routes
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page (+ Guest button)
│   │   │   ├── Signup.jsx          # Registration page
│   │   │   ├── ChatPage.jsx        # Main chat layout
│   │   │   └── ProfilePage.jsx     # User profile view/edit
│   │   ├── redux/
│   │   │   ├── store.js            # Redux store configuration
│   │   │   ├── authSlice.js        # Auth state (user, token)
│   │   │   └── chatSlice.js        # Chat state (messages, friends)
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with base URL
│   │   ├── socket/
│   │   │   └── socket.js           # Socket.IO client instance
│   │   ├── App.jsx                 # Root component with routes
│   │   └── main.jsx               # React DOM render entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json                    # Root scripts (concurrent dev)
├── vercel.json                     # Deployment configuration
└── .gitignore
```

---

## 14. API DOCUMENTATION

### Authentication APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | Login with credentials |
| POST | `/api/auth/guest-login` | None | Join as guest user |

### User APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/search?search=query` | JWT | Search users by username |
| GET | `/api/users/friends` | JWT | Get friends list |
| GET | `/api/users/friend-requests` | JWT | Get pending requests |
| POST | `/api/users/send-request/:id` | JWT | Send friend request |
| POST | `/api/users/accept-request/:id` | JWT | Accept friend request |
| POST | `/api/users/reject-request/:id` | JWT | Reject friend request |
| GET | `/api/users/profile` | JWT | Get current user profile |
| PUT | `/api/users/profile` | JWT | Update profile details |
| PUT | `/api/users/profile-pic` | JWT | Update profile photo |

### Message APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages/send` | JWT | Send a message |
| GET | `/api/messages/:userId` | JWT | Get chat with a user |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Register user socket room |
| `sendMessage` | Client → Server | Send new message |
| `typing` | Client → Server | Start typing notification |
| `stopTyping` | Client → Server | Stop typing notification |
| `messageDelivered` | Client → Server | Mark message delivered |
| `messageRead` | Client → Server | Mark message as read |
| `activeUsers` | Server → Client | Broadcast online user list |
| `receiveMessage` | Server → Client | Deliver message to receiver |
| `typing` | Server → Client | Notify receiver of typing |
| `stopTyping` | Server → Client | Notify receiver stopped typing |

---

## 15. TESTING

| Test Type | Method | Status |
|-----------|--------|--------|
| API Testing | Postman — all REST endpoints verified | ✅ |
| Auth Flow | Manual — signup, login, guest, JWT expiry | ✅ |
| Real-Time Messaging | Two browser tabs — simultaneous chat | ✅ |
| Typing Indicator | Multi-tab testing | ✅ |
| Read Receipts | Cross-user message state verification | ✅ |
| Profile Photo Upload | File size validation (>2MB rejected) | ✅ |
| Profile Editing | All fields — update and persistence verified | ✅ |
| Guest Login | UUID uniqueness and 24h token verified | ✅ |
| Responsive Design | Chrome DevTools — mobile, tablet, desktop | ✅ |
| Dark/Light Theme | Toggle persistence across sessions | ✅ |

---

## 16. SCREENSHOTS / UI OVERVIEW

### Pages in the Application

1. **Login Page** — Dark glassmorphism card with username/password fields, "Sign In" button, and "Continue as Guest" option with OR divider
2. **Signup Page** — Registration form with full name, username, email, phone, password
3. **Chat Page (Main)** — Split layout: Sidebar (left) + ChatBox (right)
   - Sidebar: Profile footer, search, tabs (Chats/Explore/Requests), online stories row
   - ChatBox: Message bubbles, image sharing, typing indicator, read receipts
4. **Profile Page** — Dedicated page with cover gradient, circular avatar with camera overlay, editable fields, User ID display

---

## 17. FUTURE SCOPE

| Feature | Description |
|---------|-------------|
| 🌐 **Group Chats** | Support for multi-user group conversations |
| 📞 **Voice/Video Calls** | WebRTC-based peer-to-peer calling |
| 🔔 **Push Notifications** | Browser push notifications for new messages |
| 📁 **File Sharing** | Upload and share documents/PDFs/files |
| 🔒 **End-to-End Encryption** | E2EE using the Web Crypto API |
| 🤖 **AI Chatbot Integration** | Built-in AI assistant for smart replies |
| 📊 **Admin Dashboard** | Analytics, user management, moderation |
| 🌍 **Deployment on Cloud** | AWS / Railway full production deployment |
| 📱 **React Native App** | Extend to Android and iOS using shared backend |
| 🗑️ **Message Delete/Edit** | Allow editing or deleting sent messages |

---

## 18. CONCLUSION

The MERN Stack Real-Time Chat Application (ChatterBox) successfully demonstrates the development of a complete, production-grade web communication platform using modern JavaScript technologies. The project covers every layer of web application development:

- **Backend:** RESTful API with Express.js, JWT authentication, bcrypt security
- **Database:** MongoDB with Mongoose schemas for Users and Messages
- **Real-Time Layer:** Socket.IO for bidirectional, event-driven communication
- **Frontend:** React.js with Redux Toolkit for state management
- **UI/UX:** Premium glassmorphism dark design with full mobile responsiveness

The integration of all these technologies results in a seamless, fast, and secure chat experience comparable to commercial messaging applications. The addition of guest login makes the platform accessible to new users without friction, while the profile management system provides personalization capabilities.

This project serves as a strong demonstration of real-world full-stack development skills, WebSocket implementation, and modern web application design principles.

---

## 19. REFERENCES

1. **MongoDB Documentation** — https://www.mongodb.com/docs/
2. **Express.js Documentation** — https://expressjs.com/
3. **React.js Official Docs** — https://react.dev/
4. **Node.js Documentation** — https://nodejs.org/docs/
5. **Socket.IO Documentation** — https://socket.io/docs/v4/
6. **Redux Toolkit Docs** — https://redux-toolkit.js.org/
7. **JSON Web Tokens (JWT)** — https://jwt.io/introduction/
8. **bcrypt.js Library** — https://www.npmjs.com/package/bcryptjs
9. **TailwindCSS Documentation** — https://tailwindcss.com/docs/
10. **Vite Build Tool** — https://vitejs.dev/guide/
11. **Mongoose ODM** — https://mongoosejs.com/docs/

---

*Document prepared for academic project submission.*
*Author: Priyanshu Panwar | Date: April 2026*
