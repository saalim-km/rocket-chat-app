import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getRooms,
  getMessages,
  deleteMessage,
  reactToMessage,
  updateMessage,
  pinMessage,
  unpinMessage,
  getRoomMembers,
  searchMessages,
  getPinnedMessages,
  createChannel,
  createDM,
  spotlightSearch,
  setUserStatus,
} from "../services/rocketchat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Hash, User } from "lucide-react";

const ChatLayout = () => {
  const { authToken, userId, user, isAdmin, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const searchRef = useRef(null);
  const [isShortcutGuideOpen, setIsShortcutGuideOpen] = useState(false);

  // New states for create modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null); // 'channel' or 'dm'
  const [channelFormData, setChannelFormData] = useState({
    name: "",
    description: "",
    readOnly: false,
    private: false,
  });
  const [channelFormErrors, setChannelFormErrors] = useState({});
  const [dmSearchQuery, setDmSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        setError("Failed to load rooms");
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
        const result = await getMessages(
          currentRoom._id,
          authToken,
          userId,
          50,
          currentRoom.t
        );
        if (result.success) {
          const filteredMessages = result.messages
            .filter(
              (msg) => !msg.t || !["message_pinned", "rm"].includes(msg.t)
            )
            .reverse();
          setMessages(filteredMessages);
          setAllMessages(filteredMessages);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load messages");
      }
    };
    loadMessages();
  }, [currentRoom, authToken, userId]);

  useEffect(() => {
    if (!currentRoom || !authToken || !userId) return;
    const pollMessages = async () => {
      try {
        const result = await getMessages(
          currentRoom._id,
          authToken,
          userId,
          50,
          currentRoom.t
        );
        if (result.success) {
          const newMessages = result.messages
            .filter(
              (msg) => !msg.t || !["message_pinned", "rm"].includes(msg.t)
            )
            .reverse();
          setAllMessages(newMessages);
          if (!searchTerm.trim()) {
            setMessages(newMessages);
          }
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, authToken, userId, searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMessages(allMessages);
    } else {
      const performSearch = async () => {
        const result = await searchMessages(
          currentRoom._id,
          searchTerm,
          50,
          authToken,
          userId
        );
        if (result.success) {
          const filteredMessages = result.messages
            .filter(
              (msg) => !msg.t || !["message_pinned", "rm"].includes(msg.t)
            )
            .reverse();
          setMessages(filteredMessages);
        } else {
          setError(result.error);
        }
      };
      performSearch();
    }
  }, [searchTerm, allMessages, currentRoom, authToken, userId]);

  // New useEffect for DM user search
  useEffect(() => {
    if (createType !== "dm" || !dmSearchQuery.trim() || !authToken || !userId) {
      setSearchedUsers([]);
      return;
    }
    const searchUsers = async () => {
      const result = await spotlightSearch(dmSearchQuery, authToken, userId);
      if (result.success) {
        // Filter out current user
        const filteredUsers = result.users.filter(
          (u) => u.username !== user.username
        );
        setSearchedUsers(filteredUsers);
      } else {
        setCreateError(result.error);
      }
    };
    searchUsers();
  }, [dmSearchQuery, createType, authToken, userId, user]);

  const handleRoomSelect = (room) => {
    setCurrentRoom(room);
    setMessages([]);
    setAllMessages([]);
    setSearchTerm("");
    setMembers([]);
    setPinnedMessages([]);
  };

  const handleNewMessage = (message) => {
    if (!message.t || !["message_pinned", "rm"].includes(message.t)) {
      setMessages((prevMessages) => [...prevMessages, message]);
      setAllMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const openDeleteModal = (msgId) => {
    setDeleteMsgId(msgId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentRoom || !deleteMsgId || !authToken || !userId) return;
    const result = await deleteMessage(
      currentRoom._id,
      deleteMsgId,
      authToken,
      userId
    );
    if (result.success) {
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m._id !== deleteMsgId)
      );
      setAllMessages((prevMessages) =>
        prevMessages.filter((m) => m._id !== deleteMsgId)
      );
      setPinnedMessages((prevPinned) =>
        prevPinned.filter((m) => m._id !== deleteMsgId)
      );
    } else {
      console.error("Delete failed:", result.error);
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
    if (
      !currentRoom ||
      !editMsgId ||
      !editMessageText.trim() ||
      !authToken ||
      !userId
    )
      return;
    const result = await updateMessage(
      currentRoom._id,
      editMsgId,
      editMessageText,
      authToken,
      userId
    );
    if (result.success) {
      const msgIndex = allMessages.findIndex((m) => m._id === editMsgId);
      if (msgIndex !== -1) {
        const updatedMsg = {
          ...allMessages[msgIndex],
          msg: editMessageText,
          editedAt: new Date(),
          edited: true,
        };
        const newAllMessages = [...allMessages];
        newAllMessages[msgIndex] = updatedMsg;
        setAllMessages(newAllMessages);
        setMessages((prevMessages) =>
          prevMessages.map((m) => (m._id === editMsgId ? updatedMsg : m))
        );
        setPinnedMessages((prevPinned) =>
          prevPinned.map((m) =>
            m._id === editMsgId
              ? {
                  ...m,
                  msg: editMessageText,
                  editedAt: new Date(),
                  edited: true,
                }
              : m
          )
        );
      }
    } else {
      console.error("Edit failed:", result.error);
    }
    setIsEditModalOpen(false);
    setEditMsgId(null);
    setEditMessageText("");
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    setEditMsgId(null);
    setEditMessageText("");
  };

  const handleToggleReact = async (msgId, emoji) => {
    if (!user?.username || !authToken || !userId) return;
    const msgIndex = messages.findIndex((m) => m._id === msgId);
    if (msgIndex === -1) return;
    const msg = messages[msgIndex];
    const reactionKey = `:${emoji}:`;
    const reactions = msg.reactions || {};
    const userReactions = reactions[reactionKey] || { usernames: [] };
    const isReacted = userReactions.usernames.includes(user.username);
    const shouldReact = !isReacted;
    const result = await reactToMessage(
      msgId,
      emoji,
      shouldReact,
      authToken,
      userId
    );
    if (result.success) {
      if (shouldReact) {
        if (!userReactions.usernames.includes(user.username)) {
          userReactions.usernames.push(user.username);
        }
      } else {
        userReactions.usernames = userReactions.usernames.filter(
          (u) => u !== user.username
        );
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
      const allMsgIndex = allMessages.findIndex((m) => m._id === msgId);
      if (allMsgIndex !== -1) {
        const newAllMessages = [...allMessages];
        newAllMessages[allMsgIndex] = updatedMsg;
        setAllMessages(newAllMessages);
      }
      setPinnedMessages((prevPinned) =>
        prevPinned.map((m) =>
          m._id === msgId ? { ...m, reactions: { ...reactions } } : m
        )
      );
    } else {
      console.error("Reaction failed:", result.error);
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
      setAllMessages(
        allMessages.map((m) => (m._id === msgId ? { ...m, pinned: true } : m))
      );
      const messageToPin = messages.find((m) => m._id === msgId);
      if (messageToPin && !pinnedMessages.some((pm) => pm._id === msgId)) {
        setPinnedMessages((prev) => [messageToPin, ...prev]);
      }
    } else {
      console.error("Pin failed:", result.error);
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
      setAllMessages(
        allMessages.map((m) => (m._id === msgId ? { ...m, pinned: false } : m))
      );
      setPinnedMessages((prev) => prev.filter((m) => m._id !== msgId));
    } else {
      console.error("Unpin failed:", result.error);
    }
  };

  const loadMembers = async () => {
    if (!currentRoom || !authToken || !userId) return;
    const result = await getRoomMembers(
      currentRoom._id,
      currentRoom.t,
      authToken,
      userId
    );
    if (result.success) {
      setMembers(result.members);
    } else {
      setError(result.error);
    }
  };

  const loadPinned = async () => {
    if (!currentRoom || !authToken || !userId) return;
    const result = await getPinnedMessages(
      currentRoom._id,
      50,
      0,
      authToken,
      userId
    );
    if (result.success) {
      const filteredPinned = result.messages
        .filter((msg) => !msg.t || !["message_pinned", "rm"].includes(msg.t))
        .reverse();
      setPinnedMessages(filteredPinned);
    } else {
      setError(result.error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLogout = () => {
    logout();
  };

  const handleStatusChange = async (newStatus) => {
    const result = await setUserStatus(newStatus, authToken, userId);
    if (result.success) {
      setCurrentUser({ ...currentUser, status: newStatus });
    } else {
      console.error("Failed to update status:", result.error);
    }
  };

  const validateChannelForm = () => {
    const errors = {};
    if (!channelFormData.name.trim()) errors.name = "Channel name is required";
    else if (!/^[a-z0-9-]+$/.test(channelFormData.name))
      errors.name = "Channel name must be lowercase, numbers, or hyphens";
    if (channelFormData.description.length > 250)
      errors.description = "Description must be 250 characters or less";
    return errors;
  };

  const handleCreateChannel = async () => {
    setCreateError("");
    setCreateLoading(true);
    const errors = validateChannelForm();
    if (Object.keys(errors).length > 0) {
      setChannelFormErrors(errors);
      setCreateLoading(false);
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
      const roomsResult = await getRooms(authToken, userId);
      if (roomsResult.success) {
        setRooms(roomsResult.rooms);
      }
      closeCreateModal();
    } else {
      setCreateError(result.error);
    }
    setCreateLoading(false);
  };

  const handleCreateDM = async (username) => {
    setCreateError("");
    setCreateLoading(true);
    const result = await createDM(username, authToken, userId);
    if (result.success) {
      const roomsResult = await getRooms(authToken, userId);
      if (roomsResult.success) {
        setRooms(roomsResult.rooms);
        setCurrentRoom(result.room);
      }
      closeCreateModal();
    } else {
      setCreateError(result.error);
    }
    setCreateLoading(false);
  };

  const handleChannelInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChannelFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setChannelFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateType(null);
    setChannelFormData({
      name: "",
      description: "",
      readOnly: false,
      private: false,
    });
    setChannelFormErrors({});
    setDmSearchQuery("");
    setSearchedUsers([]);
    setCreateError("");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading chat...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  let createModalContent;
  if (!createType) {
    createModalContent = (
      <>
        <h3 className="text-xl font-semibold text-white mb-4">Create New</h3>
        <div className="space-y-4">
          <button
            onClick={() => setCreateType("channel")}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[#1f2329] hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Hash size={20} /> Channel
          </button>
          <button
            onClick={() => setCreateType("dm")}
            className="w-full flex items-center gap-2 px-4 py-3 bg-[#1f2329] hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <User size={20} /> Direct Message
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={closeCreateModal}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </>
    );
  } else if (createType === "channel") {
    createModalContent = (
      <>
        <h3 className="text-xl font-semibold text-white mb-4">
          Create Channel
        </h3>
        {createError && <p className="text-red-400 mb-4">{createError}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Channel Name
            </label>
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-gray-400" />
              <input
                type="text"
                name="name"
                value={channelFormData.name}
                onChange={handleChannelInputChange}
                className={
                  "w-full px-4 py-2 bg-[#1f2329] border " +
                  (channelFormErrors.name
                    ? "border-red-500"
                    : "border-gray-700") +
                  " rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                }
                placeholder="Enter channel name"
              />
            </div>
            {channelFormErrors.name && (
              <p className="text-red-400 text-xs mt-1">
                {channelFormErrors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={channelFormData.description}
              onChange={handleChannelInputChange}
              className={
                "w-full px-4 py-2 bg-[#1f2329] border " +
                (channelFormErrors.description
                  ? "border-red-500"
                  : "border-gray-700") +
                " rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              }
              placeholder="Enter channel description"
              rows={3}
            />
            {channelFormErrors.description && (
              <p className="text-red-400 text-xs mt-1">
                {channelFormErrors.description}
              </p>
            )}
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
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCreateType(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreateChannel}
              disabled={createLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {createLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </>
    );
  } else {
    createModalContent = (
      <>
        <h3 className="text-xl font-semibold text-white mb-4">
          Create Direct Message
        </h3>
        {createError && <p className="text-red-400 mb-4">{createError}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Search User
            </label>
            <input
              type="text"
              value={dmSearchQuery}
              onChange={(e) => setDmSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#1f2329] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter username"
            />
          </div>
          {searchedUsers.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {searchedUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleCreateDM(u.username)}
                  disabled={createLoading}
                  className="w-full flex items-center gap-3 px-4 py-2 bg-[#1f2329] hover:bg-gray-700 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-white">{u.name || u.username}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCreateType(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={closeCreateModal}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#1f2329] text-gray-200">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomSelect={handleRoomSelect}
        currentUsername={user?.username}
        onCreateOpen={() => setIsCreateModalOpen(true)}
      />

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <Header
          currentRoom={currentRoom}
          onMembersOpen={() => {
            setIsMembersOpen(true);
            loadMembers();
          }}
          onPinnedOpen={() => {
            setIsPinnedOpen(true);
            loadPinned();
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onLogout={handleLogout}
          user={currentUser}
          onStatusChange={handleStatusChange}
          searchRef={searchRef} // NEW: Pass ref
        />

        {/* Messages */}
        {currentRoom ? (
          <MessageList
            messages={messages}
            currentUserId={userId}
            currentUserUsername={user?.username}
            onDeleteMessage={openDeleteModal}
            onToggleReact={handleToggleReact}
            onEditMessage={openEditModal}
            onPinMessage={handlePinMessage}
            onUnpinMessage={handleUnpinMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">
                Select a room to start chatting
              </p>
              <p className="text-sm">
                Choose a room from the sidebar to view messages
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        {currentRoom && (
          <MessageInput
            roomId={currentRoom._id}
            onNewMessage={handleNewMessage}
          />
        )}
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this message?
            </p>
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
            <h3 className="text-xl font-semibold text-white mb-4">
              Edit Message
            </h3>
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

      {isMembersOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Members</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {member.name || member.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {member.status || "offline"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsMembersOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPinnedOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Pinned Messages
            </h3>
            <div className="space-y-4">
              {pinnedMessages.map((msg) => (
                <div key={msg._id} className="p-4 bg-[#1f2329] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-white font-medium">
                      {msg.u.name || msg.u.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(msg.ts)}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleUnpinMessage(msg._id)}
                        className="ml-auto text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                  <div className="text-gray-200">{msg.msg}</div>
                  {msg.edited && (
                    <span className="text-xs text-gray-500 ml-2">(Edited)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsPinnedOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-md w-full mx-4">
            {createModalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
