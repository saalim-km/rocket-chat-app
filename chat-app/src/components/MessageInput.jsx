// src/components/MessageInput.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, uploadFile } from '../services/rocketchat';
import './MessageInput.css';

const MessageInput = ({ roomId, onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const { authToken, userId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !file) || sending) return;
    
    setSending(true);
    setError('');

    try {
      let result;
      if (file) {
        result = await uploadFile(roomId, file, authToken, userId);
        if (result.success) {
          onNewMessage({
            _id: result.message._id,
            msg: `Uploaded ${file.name}`,
            u: { _id: userId, username: result.message.u.username },
            ts: new Date(),
            attachments: [{
              title: file.name,
              image_url: result.message.attachments[0]?.image_url || '',
              description: `Uploaded by ${result.message.u.username}`,
            }],
          });
        } else {
          setError(result.error || 'Failed to upload file');
        }
      }

      if (message.trim()) {
        result = await sendMessage(roomId, message.trim(), authToken, userId);
        if (result.success) {
          onNewMessage(result.message);
        } else {
          setError(result.error || 'Failed to send message');
        }
      }

      if (result && result.success) {
        setMessage('');
        setFile(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="message-input-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or upload a file..."
            disabled={sending}
            className="message-textarea"
            rows="1"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!message.trim() && !file || sending}
            className="send-button"
          >
            {sending ? (
              <div className="sending-spinner"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;