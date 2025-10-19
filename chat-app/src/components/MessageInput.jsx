// src/components/MessageInput.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage, uploadFile } from "../services/rocketchat";
import { Send, Smile, Paperclip, X } from "lucide-react"; // FIXED: Added X import

const MessageInput = ({ roomId, onNewMessage, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]); // Changed to array for multiple files
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authToken, userId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (!message.trim() && files.length === 0) ||
      sending ||
      !authToken ||
      !userId
    )
      return;

    setSending(true);
    setError("");

    try {
      let result;
      if (files.length > 0) {
        for (const file of files) {
          result = await uploadFile(
            roomId,
            file,
            authToken,
            userId,
            (progress) => setUploadProgress(progress)
          );
          if (result.success) {
            onNewMessage({
              _id: result.message._id,
              msg: `Uploaded ${file.name}`,
              u: { _id: userId, username: result.message.u.username },
              ts: new Date(),
              attachments: [
                {
                  title: file.name,
                  image_url: result.message.attachments[0]?.image_url || "",
                  description: `Uploaded by ${result.message.u.username}`,
                  type: file.type.split("/")[0], // e.g., 'image', 'video', 'application'
                },
              ],
            });
          } else {
            setError(result.error || "Failed to upload file");
          }
        }
      }

      if (message.trim()) {
        result = await sendMessage(
          roomId,
          message.trim(),
          authToken,
          userId,
          replyingTo?.id
        ); // UPDATED: Pass threadId
        if (result.success) {
          onNewMessage(result.message);
          setMessage("");
          if (replyingTo) onCancelReply(); // NEW: Close reply mode
        } else {
          setError(result.error || "Failed to send message");
        }
      }

      if (result && result.success) {
        setMessage("");
        setFiles([]);
        setUploadProgress(0);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      // Optional: Limit number of files (e.g., max 5)
      const validFiles = selectedFiles.slice(0, 5);
      setFiles(validFiles);
    }
  };

  return (
    <div className="border-t border-gray-700 bg-[#2f343d]">
      {error && (
        <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">

        {/* Reply context bar */}
        {replyingTo && (
          <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              Replying to: "{replyingTo.text}"
            </div>
            <button
              onClick={onCancelReply}
              className="text-blue-300 hover:text-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-[#1f2329] rounded-lg border border-gray-700 focus-within:border-emerald-500 transition-colors">
          <button
            type="button"
            className="flex-shrink-0 p-3 text-gray-400 hover:text-white transition-colors"
            title="Add emoji"
          >
            <Smile size={20} />
          </button>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-transparent text-white placeholder-gray-500 py-3 px-0 resize-none outline-none max-h-32"
            rows={1}
          />

          <label className="flex-shrink-0 p-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              multiple // Enable multiple file selection
              className="hidden"
              disabled={sending}
              accept="image/*,video/*,audio/*,application/pdf,.docx,.txt" // Restrict file types if needed
            />
            <Paperclip size={20} />
          </label>

          <button
            type="submit"
            disabled={(!message.trim() && files.length === 0) || sending}
            className="flex-shrink-0 p-3 text-emerald-500 hover:text-emerald-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        {uploadProgress > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Uploading: {Math.round(uploadProgress)}%
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Selected files: {files.map((f) => f.name).join(", ")}
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;