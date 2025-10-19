// src/services/rocketchat.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_ROCKETCHAT_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Helper function to get auth headers
const getAuthHeaders = (authToken, userId) => ({
  'X-Auth-Token': authToken,
  'X-User-Id': userId,
});

// Authentication
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', {
      user: username,
      password: password,
    });
    
    if (response.data.status === 'success') {
      return {
        success: true,
        authToken: response.data.data.authToken,
        userId: response.data.data.userId,
        user: response.data.data.me,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Login failed',
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.response?.data?.error || 'Network error during login',
    };
  }
};

// Get user info
export const getUserInfo = async (authToken, userId) => {
  try {
    const response = await api.get('/me', {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      user: response.data,
      isAdmin: response.data.roles.includes('admin'),
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get user info',
    };
  }
};

// Get rooms/channels
export const getRooms = async (authToken, userId) => {
  try {
    const response = await api.get('/rooms.get', {
      headers: getAuthHeaders(authToken, userId),
    });
    return {    
      success: true,
      rooms: response.data.update || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get rooms',
    };
  }
};

// Get messages for a room
export const getMessages = async (roomId, authToken, userId, count = 50, roomType) => {
  let endpoint;
  switch (roomType) {
    case 'c':
      endpoint = 'channels.history';
      break;
    case 'p':
      endpoint = 'groups.history';
      break;
    case 'd':
      endpoint = 'im.history';
      break;
    default:
      return {
        success: false,
        error: 'Unknown room type',
      };
  }

  try {
    const response = await api.get(`/${endpoint}?roomId=${roomId}&count=${count}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get messages',
    };
  }
};

// Send a message
export const sendMessage = async (roomId, message, authToken, userId) => {
  try {
    const response = await api.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: message,
      },
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to send message',
    };
  }
};

// Delete a message
export const deleteMessage = async (roomId, msgId, authToken, userId) => {
  try {
    const response = await api.post('/chat.delete', {
      roomId,
      msgId,
      asUser: true,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete message',
    };
  }
};

// React to a message
export const reactToMessage = async (messageId, emoji, shouldReact = true, authToken, userId) => {
  try {
    const response = await api.post('/chat.react', {
      messageId,
      emoji,
      shouldReact,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add reaction',
    };
  }
};

// Get room info
export const getRoomInfo = async (roomId, authToken, userId) => {
  try {
    const response = await api.get(`/rooms.info?roomId=${roomId}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      room: response.data.room,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get room info',
    };
  }
};

export const pinMessage = async (msgId, authToken, userId) => {
  try {
    const response = await api.post('/chat.pinMessage', {
      messageId: msgId,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to pin message',
    };
  }
};

export const spotlightSearch = async (query, authToken, userId) => {
  try {
    const response = await api.get(`/spotlight?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      users: response.data.users,
      rooms: response.data.rooms,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to search',
    };
  }
};

export const joinChannel = async (roomId, authToken, userId) => {
  try {
    const response = await api.post('/channels.join', {
      roomId,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      room: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to join channel',
    };
  }
};

export const createDM = async (username, authToken, userId) => {
  try {
    const response = await api.post('/im.create', {
      username,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      room: response.data.room,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create DM',
    };
  }
};

export const updateMessage = async (roomId, msgId, newText, authToken, userId) => {
  try {
    const response = await api.post('/chat.update', {
      roomId,
      msgId,
      text: newText,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update message',
    };
  }
};

// Logout
export const logout = async (authToken, userId) => {
  try {
    await api.post('/logout', {}, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Logout failed',
    };
  }
};

export const unpinMessage = async (msgId, authToken, userId) => {
  try {
    const response = await api.post('/chat.unPinMessage', {
      messageId: msgId,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to unpin message',
    };
  }
};

export const createUser = async (userData, authToken, userId) => {
  try {
    const response = await api.post('/users.create', userData, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create user',
    };
  }
};


// src/services/rocketchat.js
// ... existing code ...

export const getRoomMembers = async (roomId, roomType, authToken, userId) => {
  let endpoint;
  switch (roomType) {
    case 'c':
      endpoint = 'channels.members';
      break;
    case 'p':
      endpoint = 'groups.members';
      break;
    case 'd':
      endpoint = 'im.members';
      break;
    default:
      return {
        success: false,
        error: 'Unknown room type',
      };
  }

  try {
    const response = await api.get(`/${endpoint}?roomId=${roomId}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      members: response.data.members || [],
      total: response.data.total,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get members',
    };
  }
};

export const searchMessages = async (roomId, searchText, count = 50, authToken, userId) => {
  try {
    const response = await api.get(`/chat.search?roomId=${roomId}&searchText=${encodeURIComponent(searchText)}&count=${count}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to search messages',
    };
  }
};

export const getPinnedMessages = async (roomId, count = 50, offset = 0, authToken, userId) => {
  try {
    const response = await api.get(`/chat.getPinnedMessages?roomId=${roomId}&count=${count}&offset=${offset}`, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: true,
      messages: response.data.messages || [],
      total: response.data.total,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get pinned messages',
    };
  }
};

export const createChannel = async (channelData, authToken, userId) => {
  try {
    const response = await api.post('/channels.create', channelData, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      channel: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create channel',
    };
  }
};

export const updateChannel = async (roomId, channelData, authToken, userId) => {
  try {
    const response = await api.post('/channels.setDescription', {
      roomId,
      description: channelData.description,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      channel: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update channel',
    };
  }
};


export const addUserToChannel = async (roomId, userIdToAdd, authToken, userId) => {
  try {
    const response = await api.post('/channels.invite', {
      roomId,
      userId: userIdToAdd,
    }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      channel: response.data.channel,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add user to channel',
    };
  }
};

export const getAllUsers = async (authToken, userId) => {
  try {
    const response = await api.get('/users.list', {
      headers: getAuthHeaders(authToken, userId),
    });
    return {
      success: response.data.success,
      users: response.data.users || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get users',
    };
  }
};

export const setUserStatus = async (status, authToken, userId) => {
  try {
    const response = await api.post('/users.setStatus', { status }, { headers: getAuthHeaders(authToken, userId) });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to set status' };
  }
};


export const uploadFile = async (roomId, file, authToken, userId, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', `Uploaded by ${file.name.split('.')[0]}`); // Optional description

  try {
    const response = await api.post(
      `/rooms.upload/${roomId}`,
      formData,
      {
        headers: {
          'X-Auth-Token': authToken,
          'X-User-Id': userId,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) onProgress(percentCompleted);
        },
      }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, error: 'Upload failed' };
  }
};

export const updateChannelTopic = async (roomId, topic, authToken, userId) => {
  try {
    const response = await api.post('/channels.setTopic', { roomId, topic }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to update topic' };
  }
};

export const updateChannelDescription = async (roomId, description, authToken, userId) => {
  try {
    const response = await api.post('/channels.setDescription', { roomId, description }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to update description' };
  }
};

export const deleteRoom = async (roomId, authToken, userId) => {
  try {
    const response = await api.post('/channels.delete', { roomId }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to delete channel' };
  }
};

export const removeUserFromChannel = async (roomId, userIdToRemove, authToken, userId) => {
  try {
    const response = await api.post('/channels.kick', { roomId, userId: userIdToRemove }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to remove user from channel' };
  }
};

export const setAvatar = async (avatar, authToken, userId, type = 'file') => {
  try {
    const formData = new FormData();
    if (type === 'file') {
      formData.append('image', avatar);
    } else if (type === 'url') {
      formData.append('url', avatar);
    }
    const response = await api.post('/users.setAvatar', formData, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success, avatarUrl: response.data.avatarUrl };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to set avatar' };
  }
};

export const updateOwnBasicInfo = async (data, authToken, userId) => {
  try {
    const response = await api.post('/users.updateOwnBasicInfo', { data }, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to update profile' };
  }
};

export const sendVerificationEmail = async (authToken, userId) => {
  try {
    const response = await api.post('/users.sendVerificationEmail', {}, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to resend verification email' };
  }
};

export const logoutOtherClients = async (authToken, userId) => {
  try {
    const response = await api.post('/users.logoutOtherClients', {}, {
      headers: getAuthHeaders(authToken, userId),
    });
    return { success: response.data.success };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Failed to logout from other locations' };
  }
};