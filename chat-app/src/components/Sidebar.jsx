import { Plus } from 'lucide-react';
import RoomList from './RoomList';

const Sidebar = ({ rooms, currentRoom, onRoomSelect, currentUsername, onCreateOpen }) => {
  return (
    <div className="w-64 border-r border-gray-700 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Omnichannel</h2>
        <button onClick={onCreateOpen} className="text-gray-400 hover:text-white transition-colors" title="Create new">
          <Plus size={20} />
        </button>
      </div>
      <RoomList rooms={rooms} currentRoom={currentRoom} onRoomSelect={onRoomSelect} currentUsername={currentUsername} />
    </div>
  );
};

export default Sidebar;