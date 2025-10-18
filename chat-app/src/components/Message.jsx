// src/components/Message.js
import React from 'react';
import './Message.css';

const Message = ({ message, isOwn, onDeleteMessage, onToggleReact, currentUserUsername, previousMessage }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toDateString();
  };

  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = getMessageDate(currentMessage.ts);
    const previousDate = getMessageDate(previousMessage.ts);
    
    return currentDate !== previousDate;
  };

  const showDate = shouldShowDate(message, previousMessage);

  // Simple emoji mapping - add more as needed
  const emojiMap = {
    thumbsup: '👍',
    heart: '❤️',
    smile: '😊',
  };

  return (
    <div className={`message-container ${isOwn ? 'own' : 'other'}`}>
      {showDate && (
        <div className="date-separator">
          {formatDate(message.ts)}
        </div>
      )}
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender-name">
            {message.u?.name || message.u?.username || 'Unknown User'}
          </span>
          <span className="message-time">
            {formatTime(message.ts)}
          </span>
        </div>
        
        <div className="message-content">
          {message.msg}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment">
                {attachment.image_url && (
                  <img 
                    src={attachment.image_url} 
                    alt={attachment.title || 'Attachment'} 
                    className="attachment-image"
                  />
                )}
                {attachment.title && (
                  <div className="attachment-title">{attachment.title}</div>
                )}
                {attachment.description && (
                  <div className="attachment-description">{attachment.description}</div>
                )}
                {attachment.audio_url && (
                  <audio controls className="attachment-audio">
                    <source src={attachment.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                {attachment.video_url && (
                  <video controls className="attachment-video">
                    <source src={attachment.video_url} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="reactions">
          {Object.entries(message.reactions || {}).map(([emojiKey, data]) => {
            const emojiName = emojiKey.slice(1, -1);
            const displayEmoji = emojiMap[emojiName] || emojiKey;
            const isReacted = data.usernames.includes(currentUserUsername);
            return (
              <span 
                key={emojiKey} 
                className={`reaction ${isReacted ? 'reacted' : ''}`} 
                onClick={() => onToggleReact(message._id, emojiName)}
              >
                {displayEmoji} {data.usernames.length}
              </span>
            );
          })}
        </div>
        
        <div className="reaction-buttons">
          <span onClick={() => onToggleReact(message._id, 'thumbsup')}>👍</span>
          <span onClick={() => onToggleReact(message._id, 'heart')}>❤️</span>
          <span onClick={() => onToggleReact(message._id, 'smile')}>😊</span>
        </div>
      </div>
      
      {isOwn && (
        <button 
          className="delete-button" 
          onClick={() => onDeleteMessage(message._id)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default Message;