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

// Upload a file
// src/services/rocketchat.js (partial update)
export const uploadFile = async (roomId, file, authToken, userId) => {
  const formData = new FormData();
  formData.append('file', file); // Required: The file itself
  formData.append('description', `Uploaded ${file.name}`); // Optional: Description instead of msg

  try {
    const response = await api.post(`/rooms.upload/${roomId}`, formData, {
      headers: {
        ...getAuthHeaders(authToken, userId),
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: response.data.success,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to upload file',
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