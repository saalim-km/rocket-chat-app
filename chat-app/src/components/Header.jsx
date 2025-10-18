// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Circle, Settings, Bell, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const Header = ({ 
  currentRoom, 
  onMembersOpen, 
  onPinnedOpen, 
  searchTerm, 
  onSearchChange, 
  onLogout, 
  user, 
  onStatusChange 
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(user?.status || 'online');

  useEffect(() => {
    setStatus(user?.status || 'online');
  }, [user]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);
  };

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'text-emerald-400' },
    { value: 'away', label: 'Away', color: 'text-yellow-400' },
    { value: 'busy', label: 'Busy', color: 'text-red-400' },
    { value: 'offline', label: 'Offline', color: 'text-gray-500' },
  ];

  return (
    <header className="bg-[#2f343d] border-b border-gray-700 p-4 flex items-center justify-between">
      {/* Left Section: Room Info, Status, Search */}
      <div className="flex items-center gap-6">
        {/* Room Name */}
        <h2 className="text-xl font-bold text-white truncate max-w-xs" title={currentRoom?.name}>
          {currentRoom ? `#${currentRoom.name}` : 'Omnichannel'}
        </h2>
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${statusOptions.find(opt => opt.value === status)?.color || 'text-gray-500'}`}>
            {statusOptions.find(opt => opt.value === status)?.label || 'Offline'}
          </span>
          <Circle size={8} className={`${statusOptions.find(opt => opt.value === status)?.color || 'text-gray-500'} animate-pulse`} />
        </div>
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Search messages"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right Section: User Actions */}
      <div className="flex items-center gap-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onMembersOpen}
            className="text-white hover:bg-gray-700 hover:text-white"
            aria-label="View Members"
          >
            Members
          </Button>
          <Button
            variant="ghost"
            onClick={onPinnedOpen}
            className="text-white hover:bg-gray-700 hover:text-white"
            aria-label="View Pinned Messages"
          >
            Pinned
          </Button>
        </div>
        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity" aria-label="User menu">
              <AvatarImage src={user?.avatarUrl || "https://via.placeholder.com/40"} alt={user?.username || "User"} />
              <AvatarFallback>{user?.username ? user.username[0].toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2f343d] border border-gray-700 text-white mt-2 w-56">
            {/* Status Section */}
            <DropdownMenuRadioGroup value={status} onValueChange={handleStatusChange}>
              <div className="px-2 py-1 text-sm font-medium text-gray-300">Status</div>
              {statusOptions.map((option) => (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-gray-700 cursor-pointer"
                >
                  <span className={option.color}>{option.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator className="bg-gray-700" />
            {/* Other Options */}
            <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-gray-700 cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-gray-700 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="hover:bg-gray-700 cursor-pointer">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className="hover:bg-gray-700 cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" /> Help
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem onClick={() => { onLogout(); navigate('/login'); }} className="hover:bg-red-700 text-white cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;