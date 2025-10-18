// Updated Sidebar.jsx - Add "Manage Channel" button for current channel
import { Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RoomList from './RoomList';

const Sidebar = ({ rooms, currentRoom, onRoomSelect, currentUsername, onCreateOpen }) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 border-r border-gray-700 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Omnichannel</h2>
        <button onClick={onCreateOpen} className="text-gray-400 hover:text-white transition-colors" title="Create new">
          <Plus size={20} />
        </button>
      </div>
      <RoomList rooms={rooms} currentRoom={currentRoom} onRoomSelect={onRoomSelect} currentUsername={currentUsername} />
      {currentRoom && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate(`/channel/${currentRoom._id}`)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-[#1f2329] hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Settings size={16} /> Manage Channel
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;