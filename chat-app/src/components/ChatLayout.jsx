// src/components/ChatLayout.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages, deleteMessage, reactToMessage, updateMessage, pinMessage, unpinMessage } from '../services/rocketchat';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Search, LogOut, Hash, Star, User } from 'lucide-react';

const ChatLayout = () => {
  const { authToken, userId, user, isAdmin, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;

      try {
        const result = await getRooms(authToken, userId);
        if (result.success) {
          setRooms(result.rooms);
          if (result.rooms.length > 0) {
            setCurrentRoom(result.rooms[0]);
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [authToken, userId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !authToken || !userId) return;

      try {
        const result = await getMessages(currentRoom._id, authToken, userId, 50, currentRoom.t);
        if (result.success) {
          const loadedMessages = result.messages.reverse();
          setMessages(loadedMessages);
          setAllMessages(loadedMessages);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;

    const pollMessages = async () => {
      try {
        const result = await getMessages(currentRoom._id, authToken, userId, 50, currentRoom.t);
        if (result.success) {
          const newMessages = result.messages.reverse();
          setAllMessages(newMessages);
          setMessages(newMessages);
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMessages(allMessages);
    } else {
      const filteredMessages = allMessages.filter(message =>
        message.msg.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMessages(filteredMessages);
    }
  }, [searchTerm, allMessages]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
    setAllMessages([]);
    setSearchTerm('');
  };

  const handleNewMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    setAllMessages(prevMessages => [...prevMessages, message]);
  };

  const openDeleteModal = (msgId) => {
    setDeleteMsgId(msgId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentRoom || !deleteMsgId || !authToken || !userId) return;

    const result = await deleteMessage(currentRoom._id, deleteMsgId, authToken, userId);
    if (result.success) {
      setMessages(prevMessages => prevMessages.filter(m => m._id !== deleteMsgId));
      setAllMessages(prevMessages => prevMessages.filter(m => m._id !== deleteMsgId));
    } else {
      console.error('Delete failed:', result.error);
    }
    setIsDeleteModalOpen(false);
    setDeleteMsgId(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteMsgId(null);
  };

  const openEditModal = (msgId, currentText) => {
    setEditMsgId(msgId);
    setEditMessageText(currentText);
    setIsEditModalOpen(true);
  };

  const confirmEdit = async () => {
    if (!currentRoom || !editMsgId || !editMessageText.trim() || !authToken || !userId) return;

    const result = await updateMessage(currentRoom._id, editMsgId, editMessageText, authToken, userId);
    if (result.success) {
      const msgIndex = allMessages.findIndex(m => m._id === editMsgId);
      if (msgIndex !== -1) {
        const updatedMsg = { ...allMessages[msgIndex], msg: editMessageText, editedAt: new Date(), edited: true };
        const newAllMessages = [...allMessages];
        newAllMessages[msgIndex] = updatedMsg;
        setAllMessages(newAllMessages);
        setMessages(prevMessages => prevMessages.map(m => m._id === editMsgId ? updatedMsg : m));
      }
    } else {
      console.error('Edit failed:', result.error);
    }
    setIsEditModalOpen(false);
    setEditMsgId(null);
    setEditMessageText('');
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    setEditMsgId(null);
    setEditMessageText('');
  };

  const handleToggleReact = async (msgId, emoji) => {
    if (!user?.username || !authToken || !userId) return;

    const msgIndex = messages.findIndex(m => m._id === msgId);
    if (msgIndex === -1) return;

    const msg = messages[msgIndex];
    const reactionKey = `:${emoji}:`;
    const reactions = msg.reactions || {};
    const userReactions = reactions[reactionKey] || { usernames: [] };
    const isReacted = userReactions.usernames.includes(user.username);

    const shouldReact = !isReacted;

    const result = await reactToMessage(msgId, emoji, shouldReact, authToken, userId);
    if (result.success) {
      if (shouldReact) {
        if (!userReactions.usernames.includes(user.username)) {
          userReactions.usernames.push(user.username);
        }
      } else {
        userReactions.usernames = userReactions.usernames.filter(u => u !== user.username);
        if (userReactions.usernames.length === 0) {
          delete reactions[reactionKey];
        } else {
          reactions[reactionKey] = userReactions;
        }
      }

      const updatedMsg = { ...msg, reactions: { ...reactions } };
      const newMessages = [...messages];
      newMessages[msgIndex] = updatedMsg;
      setMessages(newMessages);
      const allMsgIndex = allMessages.findIndex(m => m._id === msgId);
      if (allMsgIndex !== -1) {
        const newAllMessages = [...allMessages];
        newAllMessages[allMsgIndex] = updatedMsg;
        setAllMessages(newAllMessages);
      }
    } else {
      console.error('Reaction failed:', result.error);
    }
  };

  const handlePinMessage = async (msgId) => {
    if (!authToken || !userId || !isAdmin) return;
    const result = await pinMessage(msgId, authToken, userId);
    if (result.success) {
      const updatedMessages = messages.map((m) =>
        m._id === msgId ? { ...m, pinned: true } : m
      );
      setMessages(updatedMessages);
      setAllMessages(updatedMessages);
    } else {
      console.error('Pin failed:', result.error);
    }
  };

  const handleUnpinMessage = async (msgId) => {
    if (!authToken || !userId || !isAdmin) return;
    const result = await unpinMessage(msgId, authToken, userId);
    if (result.success) {
      const updatedMessages = messages.map((m) =>
        m._id === msgId ? { ...m, pinned: false } : m
      );
      setMessages(updatedMessages);
      setAllMessages(updatedMessages);
    } else {
      console.error('Unpin failed:', result.error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1f2329] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1f2329] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1f2329]">
      <div className="flex-shrink-0 h-16 bg-[#2f343d] border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold text-lg">Omnichannel</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-medium">{user?.name || user?.username}</div>
            <div className="text-xs text-emerald-400">{isAdmin ? 'Admin' : 'Online'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0 border-r border-gray-700">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              <div className="flex-shrink-0 bg-[#2f343d] border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-semibold">
                      {currentRoom.t === 'c' ? <Hash size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {currentRoom.t === 'c' && '#'}{currentRoom.name}
                        <Star size={16} className="text-gray-500" />
                      </h3>
                      <p className="text-sm text-gray-400">{currentRoom.topic || 'No topic set'}</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <MessageList
                messages={messages}
                currentUserId={userId || ''}
                currentUserUsername={user?.username || ''}
                onDeleteMessage={openDeleteModal}
                onToggleReact={handleToggleReact}
                onEditMessage={openEditModal}
                onPinMessage={handlePinMessage}
                onUnpinMessage={handleUnpinMessage}
              />

              <MessageInput
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Select a room to start chatting</h3>
                <p className="text-gray-400">Choose a room from the sidebar to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this message?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Message</h3>
            <textarea
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              className="w-full px-4 py-3 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                disabled={!editMessageText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;