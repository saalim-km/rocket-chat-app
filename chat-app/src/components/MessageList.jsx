import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Message from './Message';

const MessageList = ({ messages, currentUserId, currentUserUsername, onDeleteMessage, onToggleReact, onEditMessage, onPinMessage, onUnpinMessage }) => {
  const { authToken, userId } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <Message
          key={message._id || index}
          message={message}
          previousMessage={index > 0 ? messages[index - 1] : null}
          isOwn={message.u?._id === currentUserId}
          onDeleteMessage={onDeleteMessage}
          onToggleReact={onToggleReact}
          onEditMessage={onEditMessage}
          onPinMessage={onPinMessage}
          onUnpinMessage={onUnpinMessage}
          currentUserUsername={currentUserUsername}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;