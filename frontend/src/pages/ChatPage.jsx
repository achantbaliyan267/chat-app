import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r bg-white">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          Messages here
        </div>

        <ChatBox />
      </div>
    </div>
  );
};

export default ChatPage;
