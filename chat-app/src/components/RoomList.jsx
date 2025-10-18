const RoomList = ({ rooms, currentRoom, onRoomSelect, currentUsername }) => {
  return (
    <div className="h-full bg-[#2f343d] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Channels</h3>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
            {rooms.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No rooms available</p>
          </div>
        ) : (
          <div className="py-2">
            {rooms.map((room) => {
              let displayName;
              if (room.t === 'd') {
                displayName = room.usernames?.find(u => u !== currentUsername) || 'Unnamed';
              } else {
                displayName = room.name || room.fname || 'Unnamed Room';
              }
              return (
                <button
                  key={room._id}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                    currentRoom?._id === room._id ? 'bg-gray-700/70' : ''
                  }`}
                  onClick={() => onRoomSelect(room)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-semibold">
                    {room.t === 'c' ? '#' : room.t === 'd' ? '@' : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-white font-medium truncate">{displayName}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {room.topic || room.lastMessage?.msg || 'No recent messages'}
                    </div>
                  </div>
                  {room.unread && room.unread > 0 && (
                    <div className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {room.unread}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;