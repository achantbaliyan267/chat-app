import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { setFriends, setActiveChat } from "../redux/chatSlice";
import { logout } from "../redux/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { friends, activeChat } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth?.user) || JSON.parse(localStorage.getItem("user"));
  
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'all', 'requests'
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
      fetchContactData(); // Refresh UI
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
      fetchContactData(); // Refresh UI
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
    
    // For Global tab, optionally filter out those who are already friends or have sent/received requests
    if (activeTab === 'all') {
      const friendIds = friends.map(f => f._id);
      return allUsers.filter(u => !friendIds.includes(u._id));
    }
    
    if (activeTab === 'requests') return requests;
    return [];
  };

  const displayUsers = getDisplayData();

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl border-r border-white/10 relative">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-6 tracking-wide drop-shadow-sm">Contacts</h2>
        
        <div className="flex p-1 space-x-1 bg-black/20 rounded-xl relative">
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`flex-1 py-2 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 ${activeTab === 'friends' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : 'text-indigo-200 hover:text-white hover:bg-white/5'}`}
          >
            Friends
          </button>
          <button 
            onClick={() => setActiveTab('all')} 
            className={`flex-1 py-2 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 ${activeTab === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : 'text-indigo-200 hover:text-white hover:bg-white/5'}`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`flex-1 py-2 px-1 text-xs sm:text-sm rounded-lg font-bold transition-all duration-300 relative ${activeTab === 'requests' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : 'text-indigo-200 hover:text-white hover:bg-white/5'}`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[10px] items-center justify-center text-white">{requests.length}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 custom-scrollbar">
        {displayUsers.length === 0 ? (
          <p className="text-center text-sm font-medium text-indigo-300/50 mt-8">
            {activeTab === 'friends' && "No friends yet."}
            {activeTab === 'all' && "No other users found."}
            {activeTab === 'requests' && "No pending requests."}
          </p>
        ) : (
          displayUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                if(activeTab === 'friends') dispatch(setActiveChat(user));
              }}
              className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between space-x-2 border border-transparent
                 ${activeTab === 'friends' ? 'cursor-pointer hover:border-white/10' : ''} 
                ${activeChat?._id === user._id && activeTab === 'friends' ? 'bg-white/10 border-white/20 shadow-lg text-white' : 'bg-transparent hover:bg-white/5 text-indigo-100'}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full relative bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                  {activeTab === 'friends' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-sm sm:text-[15px] truncate">{user.name}</p>
                  <p className={`text-xs truncate ${activeChat?._id === user._id && activeTab === 'friends' ? 'text-indigo-200' : 'text-indigo-300/80'}`}>@{user.username}</p>
                </div>
              </div>

              {activeTab === 'all' && (
                <button 
                  onClick={(e) => handleAddFriend(user._id, e)}
                  disabled={loadingAction === `add_${user._id}`}
                  className="shrink-0 px-3 py-1.5 bg-white/10 hover:bg-pink-500 text-xs font-bold text-white rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  {loadingAction === `add_${user._id}` ? '...' : 'Add'}
                </button>
              )}

              {activeTab === 'requests' && (
                <button 
                  onClick={(e) => handleAcceptRequest(user._id, e)}
                  disabled={loadingAction === `accept_${user._id}`}
                  className="shrink-0 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-xs font-bold text-white rounded-lg transition-colors shadow-md disabled:opacity-50"
                >
                  {loadingAction === `accept_${user._id}` ? '...' : 'Accept'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Footer Profile & Logout */}
      {currentUser && (
        <div className="absolute bottom-0 w-full p-4 bg-slate-900/95 border-t border-white/10 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                    {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-white font-bold text-sm truncate">{currentUser.name}</span>
                    <span className="text-indigo-300 text-[10px] truncate">@{currentUser.username}</span>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="shrink-0 p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-white rounded-lg transition-all duration-200"
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
