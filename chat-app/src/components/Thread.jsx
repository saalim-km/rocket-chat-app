import React from 'react';
import Message from './Message'; // Reuse Message component

const ThreadModal = ({
  thread,
  messages, // optional direct prop
  onClose,
  currentUserId,
  currentUserUsername,
  onDeleteMessage,
  onToggleReact,
  onEditMessage,
  onPinMessage,
  onUnpinMessage,
}) => {
  // Prefer explicit messages array, fallback to thread.messages
  const threadMessages = messages || thread?.messages || [];

  if (!thread && !messages) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2f343d] rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Thread</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Thread Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {threadMessages.length > 0 ? (
            threadMessages.map((message, index) => (
              <Message
                key={message._id || index}
                message={message}
                isOwn={message.u?._id === currentUserId}
                onDeleteMessage={onDeleteMessage}
                onToggleReact={onToggleReact}
                onEditMessage={onEditMessage}
                onPinMessage={onPinMessage}
                onUnpinMessage={onUnpinMessage}
                currentUserUsername={currentUserUsername}
                previousMessage={index > 0 ? threadMessages[index - 1] : null}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No replies yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#1f2329] rounded-b-lg">
          <p className="text-xs text-gray-500">Replies appear here in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default ThreadModal;
