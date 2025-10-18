// src/components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createUser, createChannel, updateChannel, addUserToChannel, getAllUsers, getRooms } from '../services/rocketchat';
import { useNavigate, Navigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, Hash } from 'lucide-react';

const AdminDashboard = () => {
  const { authToken, userId, isAdmin, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // State for user creation form
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: ['user'],
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  
  // State for channel creation form
  const [channelFormData, setChannelFormData] = useState({
    name: '',
    description: '',
    readOnly: false,
    private: false,
  });
  const [channelFormErrors, setChannelFormErrors] = useState({});
  
  // State for channel editing form
  const [editChannelFormData, setEditChannelFormData] = useState({
    roomId: '',
    description: '',
  });
  const [editChannelFormErrors, setEditChannelFormErrors] = useState({});
  const [rooms, setRooms] = useState([]);
  
  // State for adding user to channel form
  const [addUserFormData, setAddUserFormData] = useState({
    roomId: '',
    userId: '',
  });
  const [addUserFormErrors, setAddUserFormErrors] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  
  // Common state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Load rooms and users on mount
  useEffect(() => {
    const loadData = async () => {
      if (!authToken || !userId) return;

      // Load rooms
      const roomResult = await getRooms(authToken, userId);
      if (roomResult.success) {
        setRooms(roomResult.rooms.filter(room => room.t === 'c')); // Only public channels
      } else {
        setError(roomResult.error);
      }

      // Load users
      const userResult = await getAllUsers(authToken, userId);
      if (userResult.success) {
        setAllUsers(userResult.users);
      } else {
        setError(userResult.error);
      }
    };

    loadData();
  }, [authToken, userId]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f2329] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect non-authenticated users to login
  if (!authToken || !userId) {
    return <Navigate to="/login" />;
  }

  // Redirect non-admins to chat
  if (!isAdmin) {
    return <Navigate to="/chat" />;
  }

  // Validate user creation form
  const validateUserForm = () => {
    const errors = {};
    if (!userFormData.name.trim()) errors.name = 'Name is required';
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userFormData.email)) errors.email = 'Invalid email format';
    if (!userFormData.password.trim()) errors.password = 'Password is required';
    else if (userFormData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (userFormData.roles.length === 0) errors.roles = 'At least one role is required';
    return errors;
  };

  // Validate channel creation form
  const validateChannelForm = () => {
    const errors = {};
    if (!channelFormData.name.trim()) errors.name = 'Channel name is required';
    else if (!/^[a-z0-9-]+$/.test(channelFormData.name)) errors.name = 'Channel name must be lowercase, numbers, or hyphens';
    if (channelFormData.description.length > 250) errors.description = 'Description must be 250 characters or less';
    return errors;
  };

  // Validate channel editing form
  const validateEditChannelForm = () => {
    const errors = {};
    if (!editChannelFormData.roomId) errors.roomId = 'Please select a channel';
    if (editChannelFormData.description.length > 250) errors.description = 'Description must be 250 characters or less';
    return errors;
  };

  // Validate add user to channel form
  const validateAddUserForm = () => {
    const errors = {};
    if (!addUserFormData.roomId) errors.roomId = 'Please select a channel';
    if (!addUserFormData.userId) errors.userId = 'Please select a user';
    return errors;
  };

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const errors = validateUserForm();
    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      setFormLoading(false);
      return;
    }

    const userData = {
      name: userFormData.name.trim(),
      username: userFormData.username.trim(),
      email: userFormData.email.trim(),
      password: userFormData.password,
      roles: userFormData.roles,
      verified: true, // Ensure user is verified
      requirePasswordChange: false, // Prevent pending state
      joinDefaultChannels: true,
    };

    const result = await createUser(userData, authToken, userId);
    if (result.success) {
      setSuccess(`User ${result.user.username} created successfully!`);
      setUserFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        roles: ['user'],
      });
      setUserFormErrors({});
      // Refresh user list
      const userResult = await getAllUsers(authToken, userId);
      if (userResult.success) {
        setAllUsers(userResult.users);
      }
    } else {
      setError(result.error);
    }
    setFormLoading(false);
  };

  // Handle channel creation
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const errors = validateChannelForm();
    if (Object.keys(errors).length > 0) {
      setChannelFormErrors(errors);
      setFormLoading(false);
      return;
    }

    const channelData = {
      name: channelFormData.name.trim(),
      description: channelFormData.description.trim(),
      readOnly: channelFormData.readOnly,
      private: channelFormData.private,
    };

    const result = await createChannel(channelData, authToken, userId);
    if (result.success) {
      setSuccess(`Channel #${result.channel.name} created successfully!`);
      setChannelFormData({
        name: '',
        description: '',
        readOnly: false,
        private: false,
      });
      setChannelFormErrors({});
      // Refresh room list
      const roomResult = await getRooms(authToken, userId);
      if (roomResult.success) {
        setRooms(roomResult.rooms.filter(room => room.t === 'c'));
      }
    } else {
      setError(result.error);
    }
    setFormLoading(false);
  };

  // Handle channel editing
  const handleEditChannel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const errors = validateEditChannelForm();
    if (Object.keys(errors).length > 0) {
      setEditChannelFormErrors(errors);
      setFormLoading(false);
      return;
    }

    const channelData = {
      description: editChannelFormData.description.trim(),
    };

    const result = await updateChannel(editChannelFormData.roomId, channelData, authToken, userId);
    if (result.success) {
      setSuccess(`Channel updated successfully!`);
      setEditChannelFormData({
        roomId: '',
        description: '',
      });
      setEditChannelFormErrors({});
      // Refresh room list
      const roomResult = await getRooms(authToken, userId);
      if (roomResult.success) {
        setRooms(roomResult.rooms.filter(room => room.t === 'c'));
      }
    } else {
      setError(result.error);
    }
    setFormLoading(false);
  };

  // Handle adding user to channel
  const handleAddUserToChannel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const errors = validateAddUserForm();
    if (Object.keys(errors).length > 0) {
      setAddUserFormErrors(errors);
      setFormLoading(false);
      return;
    }

    const result = await addUserToChannel(addUserFormData.roomId, addUserFormData.userId, authToken, userId);
    if (result.success) {
      setSuccess(`User added to channel successfully!`);
      setAddUserFormData({
        roomId: '',
        userId: '',
      });
      setAddUserFormErrors({});
    } else {
      setError(result.error);
    }
    setFormLoading(false);
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
    setUserFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleUserRoleChange = (role) => {
    setUserFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
    setUserFormErrors((prev) => ({ ...prev, roles: '' }));
  };

  const handleChannelInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChannelFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setChannelFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEditChannelInputChange = (e) => {
    const { name, value } = e.target;
    setEditChannelFormData((prev) => ({ ...prev, [name]: value }));
    setEditChannelFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setAddUserFormData((prev) => ({ ...prev, [name]: value }));
    setAddUserFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNavigateToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-[#1f2329] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 h-16 bg-[#2f343d] border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold text-lg">Admin Dashboard</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-medium">{user?.name || user?.username}</div>
            <div className="text-xs text-emerald-400">Admin</div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
        <div className="max-w-2xl w-full space-y-8">
          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleNavigateToChat}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <MessageSquare size={20} />
              Go to Chat
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded">
              {success}
            </div>
          )}

          {/* Create User Form */}
          <div className="bg-[#2f343d] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${userFormErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Enter full name"
                />
                {userFormErrors.name && <p className="text-red-400 text-xs mt-1">{userFormErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={userFormData.username}
                  onChange={handleUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${userFormErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Enter username"
                />
                {userFormErrors.username && <p className="text-red-400 text-xs mt-1">{userFormErrors.username}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${userFormErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Enter email"
                />
                {userFormErrors.email && <p className="text-red-400 text-xs mt-1">{userFormErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${userFormErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Enter password"
                />
                {userFormErrors.password && <p className="text-red-400 text-xs mt-1">{userFormErrors.password}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Roles</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={userFormData.roles.includes('user')}
                      onChange={() => handleUserRoleChange('user')}
                      className="form-checkbox text-emerald-500"
                    />
                    User
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={userFormData.roles.includes('admin')}
                      onChange={() => handleUserRoleChange('admin')}
                      className="form-checkbox text-emerald-500"
                    />
                    Admin
                  </label>
                </div>
                {userFormErrors.roles && <p className="text-red-400 text-xs mt-1">{userFormErrors.roles}</p>}
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {formLoading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Create Channel Form */}
          <div className="bg-[#2f343d] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Create New Channel</h2>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Channel Name</label>
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={channelFormData.name}
                    onChange={handleChannelInputChange}
                    className={`w-full px-4 py-2 bg-[#1f2329] border ${channelFormErrors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="Enter channel name"
                  />
                </div>
                {channelFormErrors.name && <p className="text-red-400 text-xs mt-1">{channelFormErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={channelFormData.description}
                  onChange={handleChannelInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${channelFormErrors.description ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                  placeholder="Enter channel description"
                  rows={3}
                />
                {channelFormErrors.description && <p className="text-red-400 text-xs mt-1">{channelFormErrors.description}</p>}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    name="readOnly"
                    checked={channelFormData.readOnly}
                    onChange={handleChannelInputChange}
                    className="form-checkbox text-emerald-500"
                  />
                  Read-only
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    name="private"
                    checked={channelFormData.private}
                    onChange={handleChannelInputChange}
                    className="form-checkbox text-emerald-500"
                  />
                  Private
                </label>
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {formLoading ? 'Creating...' : 'Create Channel'}
              </button>
            </form>
          </div>

          {/* Edit Channel Form */}
          <div className="bg-[#2f343d] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Edit Channel</h2>
            <form onSubmit={handleEditChannel} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Select Channel</label>
                <select
                  name="roomId"
                  value={editChannelFormData.roomId}
                  onChange={handleEditChannelInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${editChannelFormErrors.roomId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  <option value="">Select a channel</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      #{room.name}
                    </option>
                  ))}
                </select>
                {editChannelFormErrors.roomId && <p className="text-red-400 text-xs mt-1">{editChannelFormErrors.roomId}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editChannelFormData.description}
                  onChange={handleEditChannelInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${editChannelFormErrors.description ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none`}
                  placeholder="Enter new channel description"
                  rows={3}
                />
                {editChannelFormErrors.description && <p className="text-red-400 text-xs mt-1">{editChannelFormErrors.description}</p>}
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {formLoading ? 'Updating...' : 'Update Channel'}
              </button>
            </form>
          </div>

          {/* Add User to Channel Form */}
          <div className="bg-[#2f343d] rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Add User to Channel</h2>
            <form onSubmit={handleAddUserToChannel} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Select Channel</label>
                <select
                  name="roomId"
                  value={addUserFormData.roomId}
                  onChange={handleAddUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${addUserFormErrors.roomId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  <option value="">Select a channel</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      #{room.name}
                    </option>
                  ))}
                </select>
                {addUserFormErrors.roomId && <p className="text-red-400 text-xs mt-1">{addUserFormErrors.roomId}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Select User</label>
                <select
                  name="userId"
                  value={addUserFormData.userId}
                  onChange={handleAddUserInputChange}
                  className={`w-full px-4 py-2 bg-[#1f2329] border ${addUserFormErrors.userId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  <option value="">Select a user</option>
                  {allUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.username}
                    </option>
                  ))}
                </select>
                {addUserFormErrors.userId && <p className="text-red-400 text-xs mt-1">{addUserFormErrors.userId}</p>}
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {formLoading ? 'Adding...' : 'Add User to Channel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;