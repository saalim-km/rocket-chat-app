// src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Edit } from 'lucide-react';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const Profile = () => {
  const { username, logout, user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(user?.status || 'online');
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(user?.status || 'online');

  useEffect(() => {
    setStatus(user?.status || 'online');
    setNewStatus(user?.status || 'online');
  }, [user]);

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = () => {
    setStatus(newStatus);
    setIsEditing(false);
    // Add API call here if integrated with backend
  };

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'text-emerald-400' },
    { value: 'away', label: 'Away', color: 'text-yellow-400' },
    { value: 'offline', label: 'Offline', color: 'text-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-[#1f2329] p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="max-w-2xl mx-auto bg-[#2f343d] rounded-lg p-6 shadow-lg">
        {/* User Avatar and Info */}
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatarUrl || "https://via.placeholder.com/80"} alt={username || "User"} />
            <AvatarFallback>{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{username || 'Unknown User'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm ${statusOptions.find(opt => opt.value === status)?.color || 'text-gray-500'}`}>
                {statusOptions.find(opt => opt.value === status)?.label || 'Offline'}
              </span>
              {isEditing ? (
                <>
                  <select
                    value={newStatus}
                    onChange={handleStatusChange}
                    className="bg-[#1f2329] border border-gray-700 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} className={option.color}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleSaveStatus}
                    className="ml-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    className="ml-2 bg-gray-700 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="ml-2 flex items-center gap-1 bg-[#1f2329] hover:bg-gray-700"
                >
                  <Edit size={14} /> Edit Status
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-6">
          <div className="bg-[#1f2329] p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Account Information</h3>
            <p className="text-gray-400">Username: <span className="text-white">{username || 'Not set'}</span></p>
            <p className="text-gray-400">Email: <span className="text-white">{user?.emails?.[0]?.address || 'Not set'}</span></p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;