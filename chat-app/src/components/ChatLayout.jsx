// src/components/ChatLayout.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, getMessages, deleteMessage, reactToMessage, updateMessage } from '../services/rocketchat';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatLayout.css';

const ChatLayout = () => {
  const { authToken, userId, user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');

  // Load rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken || !userId) return;
      
      try {
        const result = await getRooms(authToken, userId);
        console.log(result.rooms);
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

  // Load messages when room changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoom || !authToken || !userId) return;
      
      try {
        const result = await getMessages(currentRoom._id, authToken, userId, 50, currentRoom.t);
        if (result.success) {
          setMessages(result.messages.reverse());
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [currentRoom, authToken, userId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;

    const pollMessages = async () => {
      try {
        const result = await getMessages(currentRoom._id, authToken, userId, 50, currentRoom.t);
        if (result.success) {
          const newMessages = result.messages.reverse();
          setMessages(prevMessages => {
            if (newMessages.length !== prevMessages.length || JSON.stringify(newMessages) !== JSON.stringify(prevMessages)) {
              return newMessages;
            }
            return prevMessages;
          });
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, authToken, userId]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
  };

  const handleNewMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const openDeleteModal = (msgId) => {
    setDeleteMsgId(msgId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentRoom || !deleteMsgId) return;
    
    const result = await deleteMessage(currentRoom._id, deleteMsgId, authToken, userId);
    if (result.success) {
      setMessages(prevMessages => prevMessages.filter(m => m._id !== deleteMsgId));
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
    if (!currentRoom || !editMsgId || !editMessageText.trim()) return;
    
    const result = await updateMessage(currentRoom._id, editMsgId, editMessageText, authToken, userId);
    if (result.success) {
      const msgIndex = messages.findIndex(m => m._id === editMsgId);
      if (msgIndex !== -1) {
        const updatedMsg = { ...messages[msgIndex], msg: editMessageText, editedAt: new Date(), edited: true };
        const newMessages = [...messages];
        newMessages[msgIndex] = updatedMsg;
        setMessages(newMessages);
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
    if (!user?.username) return;
    
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
    } else {
      console.error('Reaction failed:', result.error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="chat-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-layout">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.username}</span>
          <span className="user-status">Online</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="chat-content">
        <div className="sidebar">
          <RoomList 
            rooms={rooms} 
            currentRoom={currentRoom} 
            onRoomSelect={handleRoomSelect} 
          />
        </div>
        
        <div className="chat-area">
          {currentRoom ? (
            <>
              <div className="chat-header-room">
                <h3>#{currentRoom.name}</h3>
                <p>{currentRoom.topic || 'No topic set'}</p>
              </div>
              
              <MessageList 
                messages={messages} 
                currentUserId={userId}
                currentUserUsername={user?.username}
                onDeleteMessage={openDeleteModal}
                onToggleReact={handleToggleReact}
                onEditMessage={openEditModal}
              />
              
              <MessageInput 
                roomId={currentRoom._id}
                onNewMessage={handleNewMessage}
              />
            </>
          ) : (
            <div className="no-room-selected">
              <h3>Select a room to start chatting</h3>
              <p>Choose a room from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this message?</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="modal-button cancel">Cancel</button>
              <button onClick={confirmDelete} className="modal-button delete">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Message</h3>
            <textarea
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              className="edit-textarea"
              rows="3"
            />
            <div className="modal-actions">
              <button onClick={cancelEdit} className="modal-button cancel">Cancel</button>
              <button onClick={confirmEdit} className="modal-button save" disabled={!editMessageText.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;