import React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { sendMessage, deleteMessage, updateMessage } from "../services/rocketchat";
import Message from './Message'; // Reuse Message component
import MessageInput from './MessageInput'; // Import MessageInput for replying

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
  const { authToken, userId } = useAuth();
  const [threadMessages, setThreadMessages] = useState(messages || thread?.messages || []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");

  if (!thread && !messages) return null;

  const handleNewMessage = (message) => {
    if (!message.t || !["message_pinned", "rm"].includes(message.t)) {
      setThreadMessages((prev) => [...prev, message]);
    }
  };

  const openDeleteModal = (msgId) => {
    setDeleteMsgId(msgId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!thread?.roomId || !deleteMsgId || !authToken || !userId) return;
    const result = await deleteMessage(
      thread.roomId,
      deleteMsgId,
      authToken,
      userId
    );
    if (result.success) {
      setThreadMessages((prev) => prev.filter((m) => m._id !== deleteMsgId));
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
      !thread?.roomId ||
      !editMsgId ||
      !editMessageText.trim() ||
      !authToken ||
      !userId
    ) return;
    const result = await updateMessage(
      thread.roomId,
      editMsgId,
      editMessageText,
      authToken,
      userId
    );
    if (result.success) {
      const msgIndex = threadMessages.findIndex((m) => m._id === editMsgId);
      if (msgIndex !== -1) {
        const updatedMsg = {
          ...threadMessages[msgIndex],
          msg: editMessageText,
          editedAt: new Date(),
          edited: true,
        };
        setThreadMessages((prev) =>
          prev.map((m, i) => (i === msgIndex ? updatedMsg : m))
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
                onDeleteMessage={openDeleteModal} // Use local handler
                onToggleReact={onToggleReact}
                onEditMessage={openEditModal} // Use local handler
                onPinMessage={onPinMessage}
                onUnpinMessage={onUnpinMessage}
                currentUserUsername={currentUserUsername}
                previousMessage={index > 0 ? threadMessages[index - 1] : null}
                onOpenThread={() => {}} // No-op, already in thread
                onStartReply={() => {}} // No-op, use bottom input
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No replies yet.</p>
          )}
        </div>

        {/* Reply Input */}
        {authToken && userId && (
          <div className="border-t border-gray-700">
            <MessageInput
              roomId={thread?.roomId}
              onNewMessage={handleNewMessage}
              replyingTo={{ id: thread?.threadMessageId, text: "Thread" }} // Show thread context
              onCancelReply={() => {}} // No-op, always in thread reply mode
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#1f2329] rounded-b-lg">
          <p className="text-xs text-gray-500">Replies appear here in real-time.</p>
        </div>
      </div>

      {/* Local Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this message?</p>
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

      {/* Local Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-[#2f343d] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Message</h3>
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
    </div>
  );
};

export default ThreadModal;