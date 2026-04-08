import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { setFriends, setActiveChat } from "../redux/chatSlice";
import { setUser, logout } from "../redux/authSlice";

const Sidebar = ({ theme, setTheme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friends, activeChat, onlineUsers, unreadCounts } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  
  const [activeTab, setActiveTab] = useState('friends');
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchContactData = async () => {
    try {
      const { data: friendsData } = await API.get("/users/friends");
      dispatch(setFriends(friendsData));
      
      const { data: allUsersData } = await API.get("/users/search");
      setAllUsers(allUsersData);

      const { data: requestsData } = await API.get("/users/friend-requests");
      setRequests(requestsData);
    } catch (err) {
      console.error("Failed to fetch contact data");
    }
  };

  useEffect(() => {
    fetchContactData();
  }, [dispatch]);

  const handleAddFriend = async (userId, e) => {
    e.stopPropagation();
    setLoadingAction(`add_${userId}`);
    try {
      await API.post(`/users/send-request/${userId}`);
      alert("Friend request sent!");
      fetchContactData();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptRequest = async (userId, e) => {
    e.stopPropagation();
    setLoadingAction(`accept_${userId}`);
    try {
      await API.post(`/users/accept-request/${userId}`);
      alert("Friend request accepted!");
      fetchContactData();
    } catch (err) {
      alert(err.response?.data?.message || "Error accepting request");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Profile picture must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await API.put("/users/profile-pic", { profilePic: reader.result });
        // Update user in auth slice and localStorage
        dispatch(setUser({ user: data, token: localStorage.getItem("token") }));
        alert("Profile picture updated!");
      } catch (err) {
        console.error(err);
        alert("Failed to upload profile picture");
      }
    };
    reader.readAsDataURL(file);
  };

  const getDisplayData = () => {
    if (activeTab === 'friends') return friends;
    if (activeTab === 'all') {
      const friendIds = friends.map(f => f._id);
      return allUsers.filter(u => !friendIds.includes(u._id));
    }
    if (activeTab === 'requests') return requests;
    return [];
  };

  const displayUsers = getDisplayData();

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className={`p-6 pb-4 border-b shrink-0 z-10 shadow-sm ${theme === 'dark' ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white/40'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-black tracking-wide drop-shadow-md ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Chats</h2>
          
          {/* Theme Toggle Now Inside Sidebar Header */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl shadow-inner transition-all transform hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-gray-100 text-indigo-600 border border-gray-200'}`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className={`flex p-1.5 space-x-1 rounded-xl relative shadow-inner ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-200/50'}`}>
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 ${activeTab === 'friends' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white text-blue-700 shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
          >
            Friends
          </button>
          <button 
            onClick={() => setActiveTab('all')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 ${activeTab === 'all' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white text-blue-700 shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 relative ${activeTab === 'requests' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white text-blue-700 shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[10px] items-center justify-center text-white shadow-sm border border-white/20">{requests.length}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-28 custom-scrollbar">
        {displayUsers.length === 0 ? (
          <p className={`text-center text-sm font-semibold mt-10 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            {activeTab === 'friends' && "No friends yet."}
            {activeTab === 'all' && "No other users found."}
            {activeTab === 'requests' && "No pending requests."}
          </p>
        ) : (
          displayUsers.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);
            const unreadCount = unreadCounts?.[user._id] || 0;
            const isSelected = activeChat?._id === user._id && activeTab === 'friends';

            return (
              <div
                key={user._id}
                onClick={() => {
                  if(activeTab === 'friends') dispatch(setActiveChat(user));
                }}
                className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between space-x-2   
                  ${activeTab === 'friends' ? 'cursor-pointer transform hover:-translate-y-0.5' : ''} 
                  ${isSelected ? (theme === 'dark' ? 'bg-blue-600/30 border border-blue-500/50 shadow-lg' : 'bg-white border border-blue-200 shadow-md ring-1 ring-blue-100') : (theme === 'dark' ? 'bg-transparent border border-transparent hover:bg-slate-800/80 hover:border-slate-700' : 'bg-transparent border border-transparent hover:bg-white hover:shadow-sm')}`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-inner ${theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    {user.profilePic ? (
                      <img src={user.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                    {isOnline && (
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full animate-pulse shadow-sm ${theme === 'dark' ? 'border-slate-800' : 'border-white'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`font-bold text-[15px] truncate drop-shadow-sm ${theme === 'dark' ? (isSelected ? 'text-blue-200' : 'text-slate-100') : (isSelected ? 'text-blue-800' : 'text-slate-800')}`}>{user.name}</p>
                    <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>@{user.username}</p>
                  </div>
                </div>

                {/* Badges and actions */}
                <div className="shrink-0 flex items-center">
                  {unreadCount > 0 && activeTab === 'friends' && (
                    <div className="w-6 h-6 bg-blue-500 text-white text-[11px] font-black rounded-full flex items-center justify-center mr-1 shadow-md border border-white/20">
                      {unreadCount}
                    </div>
                  )}

                  {activeTab === 'all' && (
                    <button 
                      onClick={(e) => handleAddFriend(user._id, e)}
                      disabled={loadingAction === `add_${user._id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-transform active:scale-95 shadow-md disabled:opacity-50"
                    >
                      {loadingAction === `add_${user._id}` ? '...' : 'Add'}
                    </button>
                  )}

                  {activeTab === 'requests' && (
                    <button 
                      onClick={(e) => handleAcceptRequest(user._id, e)}
                      disabled={loadingAction === `accept_${user._id}`}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-xs font-bold text-white rounded-lg transition-transform active:scale-95 shadow-md disabled:opacity-50"
                    >
                      {loadingAction === `accept_${user._id}` ? '...' : 'Accept'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Current Profile */}
      {currentUser && (
        <div className={`absolute bottom-0 w-full p-4 border-t flex items-center justify-between shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] z-20 ${theme === 'dark' ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-200'} backdrop-blur-2xl`}>
            <div className="flex items-center space-x-3 overflow-hidden">
                {/* Clickable Profile Picture */}
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold shadow-lg shrink-0 cursor-pointer group ring-2 ring-transparent hover:ring-blue-500 transition-all ${theme === 'dark' ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}
                   title="Click to update Profile Picture"
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                    
                    {currentUser.profilePic ? (
                      <img src={currentUser.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      currentUser.name?.charAt(0).toUpperCase()
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                       </svg>
                    </div>
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                    <span className={`font-extrabold text-[15px] truncate drop-shadow-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</span>
                    <span className={`text-xs font-semibold truncate flex items-center gap-1.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
                      Online
                    </span>
                </div>
            </div>
            
            {/* Explicit Logout Button */}
            <button 
                onClick={handleLogout}
                className={`shrink-0 flex items-center px-3 py-2 rounded-xl transition-all duration-200 transform active:scale-95 font-bold text-sm shadow-sm border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-white' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:shadow-md'}`}
                title="Logout"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
            </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
