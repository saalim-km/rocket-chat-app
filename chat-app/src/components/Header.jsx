import { Search, Users, Pin, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Header = ({ currentRoom, onMembersOpen, onPinnedOpen, searchTerm, onSearchChange, onLogout, user, onStatusChange }) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  if (!currentRoom) return null;

  const statusOptions = ['online', 'away', 'busy', 'offline'];

  const statusColor = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500'
  }[user.status] || 'bg-gray-500';

  return (
    <div className="h-16 bg-[#2f343d] border-b border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold text-white">
          {currentRoom.t === 'c' && '#'} {currentRoom.name}
        </div>
        {currentRoom.topic && <p className="text-sm text-gray-400">{currentRoom.topic}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onMembersOpen} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors" title="Members">
          <Users size={16} /> {currentRoom.usersCount || 0}
        </button>
        <button onClick={onPinnedOpen} className="p-1 text-gray-400 hover:text-white transition-colors" title="Pinned Messages">
          <Pin size={16} />
        </button>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-64 pl-10 pr-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 relative">
          <span className="text-white font-medium">{user.name || user.username}</span>
          <button 
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-1 text-gray-400 hover:text-white"
          >
            <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
            <span className="capitalize">{user.status}</span>
            <ChevronDown size={16} />
          </button>
          {isStatusDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[#2f343d] rounded-lg shadow-lg z-10 border border-gray-700">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700 capitalize transition-colors"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-white transition-colors" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;