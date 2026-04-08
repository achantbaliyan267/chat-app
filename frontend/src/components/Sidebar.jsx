import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { setFriends, setActiveChat } from "../redux/chatSlice";
import { logout } from "../redux/authSlice";

const Sidebar = ({ theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friends, activeChat, onlineUsers, unreadCounts } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  
  const [activeTab, setActiveTab] = useState('friends');
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

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
      <div className={`p-6 border-b shrink-0 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-extrabold mb-6 tracking-wide drop-shadow-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Chats</h2>
        
        <div className={`flex p-1 space-x-1 rounded-xl relative ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === 'friends' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            Friends
          </button>
          <button 
            onClick={() => setActiveTab('all')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-300 ${activeTab === 'all' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`flex-1 py-1.5 px-1 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-300 relative ${activeTab === 'requests' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[10px] items-center justify-center text-white">{requests.length}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24 custom-scrollbar">
        {displayUsers.length === 0 ? (
          <p className={`text-center text-sm font-medium mt-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
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
                className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-between space-x-2 border 
                  ${activeTab === 'friends' ? 'cursor-pointer' : ''} 
                  ${isSelected ? (theme === 'dark' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-blue-50 border-blue-200') : (theme === 'dark' ? 'bg-transparent border-transparent hover:bg-slate-800' : 'bg-transparent border-transparent hover:bg-gray-100')}`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full relative flex items-center justify-center text-white font-bold text-lg shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-600 text-white'}`}>
                    {user.name.charAt(0).toUpperCase()}
                    {isOnline && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full ${theme === 'dark' ? 'border-slate-900' : 'border-white'}`}></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`font-semibold text-[15px] truncate ${theme === 'dark' ? (isSelected ? 'text-blue-400' : 'text-slate-200') : (isSelected ? 'text-blue-700' : 'text-slate-800')}`}>{user.name}</p>
                    <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>@{user.username}</p>
                  </div>
                </div>

                {/* Badges and actions */}
                <div className="shrink-0 flex items-center">
                  {unreadCount > 0 && activeTab === 'friends' && (
                    <div className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center mr-1">
                      {unreadCount}
                    </div>
                  )}

                  {activeTab === 'all' && (
                    <button 
                      onClick={(e) => handleAddFriend(user._id, e)}
                      disabled={loadingAction === `add_${user._id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loadingAction === `add_${user._id}` ? '...' : 'Add'}
                    </button>
                  )}

                  {activeTab === 'requests' && (
                    <button 
                      onClick={(e) => handleAcceptRequest(user._id, e)}
                      disabled={loadingAction === `accept_${user._id}`}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-xs font-bold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
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

      {currentUser && (
        <div className={`absolute bottom-0 w-full p-4 border-t flex items-center justify-between shrink-0 ${theme === 'dark' ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-gray-200'} backdrop-blur-xl`}>
            <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-600'}`}>
                    {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                    <span className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</span>
                    <span className={`text-[11px] truncate flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </span>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className={`shrink-0 p-2 rounded-lg transition-all duration-200 ${theme === 'dark' ? 'bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'bg-gray-100 hover:bg-red-50 text-slate-600 hover:text-red-500'}`}
                title="Logout"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
            </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
