// src/components/MessageList.jsx
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pinMessage, unpinMessage } from '../services/rocketchat';
import Message from './Message';

const MessageList = ({
  messages,
  currentUserId,
  currentUserUsername,
  onDeleteMessage,
  onToggleReact,
  onEditMessage,
}) => {
  const { authToken, userId } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePinMessage = async (msgId) => {
    if (!authToken || !userId) return;
    const result = await pinMessage(msgId, authToken, userId);
    if (result.success) {
      // Update the message in state to reflect pinned status
      const updatedMessages = messages.map((m) =>
        m._id === msgId ? { ...m, pinned: true } : m
      );
      setMessages(updatedMessages);
    } else {
      console.error('Pin failed:', result.error);
    }
  };

  const handleUnpinMessage = async (msgId) => {
    if (!authToken || !userId) return;
    const result = await unpinMessage(msgId, authToken, userId);
    if (result.success) {
      // Update the message in state to reflect unpinned status
      const updatedMessages = messages.map((m) =>
        m._id === msgId ? { ...m, pinned: false } : m
      );
      setMessages(updatedMessages);
    } else {
      console.error('Unpin failed:', result.error);
    }
  };

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
          onPinMessage={handlePinMessage}
          onUnpinMessage={handleUnpinMessage}
          currentUserUsername={currentUserUsername}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;