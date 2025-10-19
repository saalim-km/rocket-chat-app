// src/components/Sidebar.jsx
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
      {currentRoom && currentRoom.t === 'c' && ( // Only show for channels (type 'c')
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate(`/channel/${currentRoom._id}`)}
            className={`w-full cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#1f2329] text-white rounded-lg transition-colors ${!currentRoom ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700'}`}
            disabled={!currentRoom}
            title="Manage the selected channel"
          >
            <Settings className='' size={16} /> Manage Channel
          </button>
        </div>
      )}
      {!currentRoom || (currentRoom && currentRoom.t !== 'c') && ( // Show disabled state with tooltip for no channel or non-channel
        <div className="p-4 border-t border-gray-700">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 bg-[#1f2329] text-white rounded-lg cursor-not-allowed opacity-50 relative group"
            disabled
            title="Select a channel to manage"
          >
            <Settings size={16} /> Manage Channel
            <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100  transition-opacity whitespace-nowrap z-10 after:content-[''] after:absolute after:left-1/2 after:-bottom-1 after:transform after:-translate-x-1/2 after:border-8 after:border-t-gray-800 after:border-l-transparent after:border-r-transparent after:border-b-transparent">
              Select a channel to manage
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;