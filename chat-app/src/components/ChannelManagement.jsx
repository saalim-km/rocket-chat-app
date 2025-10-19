// src/components/ChannelManagement.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoomInfo, updateChannelTopic, updateChannelDescription, deleteRoom, addUserToChannel, getRoomMembers, getAllUsers, removeUserFromChannel } from '../services/rocketchat';
import { Users, Hash, Trash2, Plus, Edit, UserMinus } from 'lucide-react';

const ChannelManagement = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { authToken, userId, isAdmin } = useAuth();
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [addUserId, setAddUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadChannelInfo = async () => {
      if (!roomId || !authToken || !userId) return;
      setLoading(true);
      try {
        const roomInfo = await getRoomInfo(roomId, authToken, userId);
        if (roomInfo.success) {
          setRoom(roomInfo.room);
          setTopic(roomInfo.room.topic || '');
          setDescription(roomInfo.room.description || '');
        } else {
          setError(roomInfo.error);
        }

        const membersResult = await getRoomMembers(roomId, 'c', authToken, userId);
        if (membersResult.success) {
          setMembers(membersResult.members);
        }

        const usersResult = await getAllUsers(authToken, userId);
        if (usersResult.success) {
          setAllUsers(usersResult.users);
        }
      } catch (err) {
        setError('Failed to load channel information');
      } finally {
        setLoading(false);
      }
    };
    loadChannelInfo();
  }, [roomId, authToken, userId]);

  const handleUpdateTopic = async () => {
    if (!topic.trim()) return;
    const result = await updateChannelTopic(roomId, topic, authToken, userId);
    if (result.success) {
      setRoom({ ...room, topic });
      setSuccess('Topic updated successfully');
    } else {
      setError(result.error);
    }
  };

  const handleUpdateDescription = async () => {
    if (!description.trim()) return;
    const result = await updateChannelDescription(roomId, description, authToken, userId);
    if (result.success) {
      setRoom({ ...room, description });
      setSuccess('Description updated successfully');
    } else {
      setError(result.error);
    }
  };

  const handleAddMember = async () => {
    if (!addUserId) return;
    const result = await addUserToChannel(roomId, addUserId, authToken, userId);
    if (result.success) {
      const membersResult = await getRoomMembers(roomId, 'c', authToken, userId);
      if (membersResult.success) {
        setMembers(membersResult.members);
      }
      setAddUserId('');
      setSuccess('User added successfully');
    } else {
      setError(result.error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!memberId || !room?.u?._id || memberId === room.u._id) {
      setError('Cannot remove the channel creator');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${members.find(m => m._id === memberId)?.username} from the channel?`)) return;
    const result = await removeUserFromChannel(roomId, memberId, authToken, userId);
    if (result.success) {
      setMembers(members.filter(m => m._id !== memberId));
      setSuccess('Member removed successfully');
    } else {
      setError(result.error);
    }
  };

  const handleDeleteChannel = async () => {
    if (!window.confirm('Are you sure you want to delete this channel?')) return;
    const result = await deleteRoom(roomId, authToken, userId);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
  };

  const filteredUsers = allUsers.filter(u => !members.some(m => m._id === u._id) && u.username.includes(searchUsers));

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#1f2329] p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/chat')} className="mb-4 text-gray-400 hover:text-white">
          Back to Chat
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">Manage Channel: #{room?.name}</h1>

        {success && <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 mb-4 rounded">{success}</div>}
        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 mb-4 rounded">{error}</div>}

        {/* Update Topic */}
        <div className="bg-[#2f343d] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Update Topic</h2>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter new topic"
            className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white mb-4"
          />
          <button onClick={handleUpdateTopic} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            Update Topic
          </button>
        </div>

        {/* Update Description */}
        <div className="bg-[#2f343d] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Update Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter new description"
            className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white mb-4"
            rows={3}
          />
          <button onClick={handleUpdateDescription} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            Update Description
          </button>
        </div>

        {/* Add Members */}
        <div className="bg-[#2f343d] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add Members</h2>
          <input
            type="text"
            value={searchUsers}
            onChange={(e) => setSearchUsers(e.target.value)}
            placeholder="Search users to add"
            className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white mb-4"
          />
          <select
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white mb-4"
          >
            <option value="">Select user to add</option>
            {filteredUsers.map((u) => (
              <option key={u._id} value={u._id}>{u.name || u.username}</option>
            ))}
          </select>
          <button onClick={handleAddMember} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            Add Member
          </button>
        </div>

        {/* Current Members */}
        <div className="bg-[#2f343d] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Members ({members.length})</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {members.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2 bg-[#1f2329] rounded">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                  {member.username[0].toUpperCase()}
                </div>
                <div className="flex-1 text-white">{member.name || member.username}</div>
                {(isAdmin || userId !== member._id) && member._id !== room?.u?._id && (
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-600"
                    title="Remove Member"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delete Channel */}
        {isAdmin && (
          <div className="bg-[#2f343d] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
            <button onClick={handleDeleteChannel} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
              Delete Channel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelManagement;