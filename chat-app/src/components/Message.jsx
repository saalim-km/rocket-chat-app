// src/components/Message.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Pin } from 'lucide-react';

const Message = ({
  message,
  isOwn,
  onDeleteMessage,
  onToggleReact,
  onEditMessage,
  currentUserUsername,
  previousMessage,
  onPinMessage,
  onUnpinMessage,
}) => {
  const { isAdmin } = useAuth();

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

  const emojiMap = {
    thumbsup: '👍',
    heart: '❤️',
    smile: '😊',
  };

  return (
    <>
      {showDate && (
        <div className="flex items-center justify-center my-4">
          <div className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
            {formatDate(message.ts)}
          </div>
        </div>
      )}
      <div className={`group px-6 py-2 hover:bg-gray-700/30 transition-colors ${isOwn ? 'ml-auto' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-semibold">
            {(message.u?.name || message.u?.username || 'U')[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white">
                {message.u?.name || message.u?.username || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.ts)}
                {message.pinned && (
                  <Pin size={14} className="inline ml-2 text-emerald-400" title="Pinned" />
                )}
              </span>
              {(isOwn || isAdmin) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-auto">
                  {isOwn && (
                    <>
                      <button
                        onClick={() => onEditMessage(message._id, message.msg)}
                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteMessage(message._id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => (message.pinned ? onUnpinMessage(message._id) : onPinMessage(message._id))}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      {message.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-gray-200 break-words">
              {message.msg}
              {message.edited && (
                <span className="text-xs text-gray-500 ml-2">(Edited)</span>
              )}
            </div>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    {attachment.image_url && (
                      <img
                        src={attachment.image_url}
                        alt={attachment.title || 'Attachment'}
                        className="rounded max-w-md max-h-96 object-contain"
                      />
                    )}
                    {attachment.video_url && (
                      <video controls className="mt-2 max-w-md rounded">
                        <source src={attachment.video_url} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    )}
                    {attachment.audio_url && (
                      <audio controls className="mt-2 w-full">
                        <source src={attachment.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {(!attachment.image_url && !attachment.video_url && !attachment.audio_url) && (
                      <a
                        href={attachment.download_url || attachment.image_url} // Fallback to download URL
                        download={attachment.title}
                        className="text-emerald-400 hover:underline"
                      >
                        {attachment.title || 'Download File'}
                      </a>
                    )}
                    {attachment.description && (
                      <div className="text-sm text-gray-400 mt-1">{attachment.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(message.reactions).map(([emojiKey, data]) => {
                  const emojiName = emojiKey.slice(1, -1);
                  const displayEmoji = emojiMap[emojiName] || emojiKey;
                  const isReacted = data.usernames.includes(currentUserUsername);
                  return (
                    <button
                      key={emojiKey}
                      onClick={() => onToggleReact(message._id, emojiName)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                        isReacted
                          ? 'bg-emerald-600/20 border border-emerald-600/50 text-emerald-400'
                          : 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span>{displayEmoji}</span>
                      <span className="text-xs">{data.usernames.length}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-2">
              <button
                onClick={() => onToggleReact(message._id, 'thumbsup')}
                className="text-lg hover:scale-125 transition-transform"
                title="Thumbs up"
              >
                👍
              </button>
              <button
                onClick={() => onToggleReact(message._id, 'heart')}
                className="text-lg hover:scale-125 transition-transform"
                title="Heart"
              >
                ❤️
              </button>
              <button
                onClick={() => onToggleReact(message._id, 'smile')}
                className="text-lg hover:scale-125 transition-transform"
                title="Smile"
              >
                😊
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Message;