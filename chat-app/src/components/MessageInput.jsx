import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, uploadFile } from '../services/rocketchat';
import { Send, Smile, Paperclip } from 'lucide-react';

const MessageInput = ({ roomId, onNewMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const { authToken, userId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !file) || sending || !authToken || !userId) return;

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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
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
              className="hidden"
              disabled={sending}
            />
            <Paperclip size={20} />
          </label>

          <button
            type="submit"
            disabled={(!message.trim() && !file) || sending}
            className="flex-shrink-0 p-3 text-emerald-500 hover:text-emerald-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        {file && (
          <div className="mt-2 text-sm text-gray-400">
            Selected file: {file.name}
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;