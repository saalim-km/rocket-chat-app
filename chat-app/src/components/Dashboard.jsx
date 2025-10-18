// src/components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createUser } from '../services/rocketchat';
import { useNavigate, Navigate } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { authToken, userId, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: ['user'],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect non-admins to chat or login
  if (!authToken || !userId) {
    return <Navigate to="/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/chat" />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      roles: formData.roles,
      verified: true, // Auto-verify email for simplicity
      joinDefaultChannels: true,
    };

    const result = await createUser(userData, authToken, userId);
    if (result.success) {
      setSuccess(`User ${result.user.username} created successfully!`);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        roles: ['user'],
      });
    } else {
      setError(result.error);
    }
    setLoading(false);
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#2f343d] rounded-lg p-6">
          <div className="flex justify-between mb-6">
            <button
              onClick={handleNavigateToChat}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <MessageSquare size={20} />
              Go to Chat
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">Create New User</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Roles</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('user')}
                    onChange={() => handleRoleChange('user')}
                    className="form-checkbox text-emerald-500"
                  />
                  User
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('admin')}
                    onChange={() => handleRoleChange('admin')}
                    className="form-checkbox text-emerald-500"
                  />
                  Admin
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;