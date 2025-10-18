// src/components/MessageList.js
import React, { useEffect, useRef } from 'react';
import Message from './Message';
import './MessageList.css';

const MessageList = ({ messages, currentUserId, currentUserUsername, onDeleteMessage, onToggleReact, onEditMessage }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <Message
          key={message._id || index}
          message={message}
          previousMessage={index > 0 ? messages[index - 1] : null}
          isOwn={message.u?._id === currentUserId}
          onDeleteMessage={onDeleteMessage}
          onToggleReact={onToggleReact}
          onEditMessage={onEditMessage} // Add this prop
          currentUserUsername={currentUserUsername}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;