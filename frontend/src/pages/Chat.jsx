import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../features/notifications/notificationSlice';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { formatTimeAgo } from '../utils/ui-helpers';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [jobDetails, setJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [jobRes, chatRes] = await Promise.all([
          axios.get(`${backendUrl}/jobs/${jobId}`),
          axios.get(`${backendUrl}/chats/${jobId}`, { headers }),
        ]);
        setJobDetails(jobRes.data);
        setMessages(chatRes.data.messages || []);
      } catch (err) {
        setError('Failed to load chat. Make sure you have permission.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  useEffect(() => {
    if (isLoading || error) return;

    socketRef.current = io(socketUrl);
    // Register user for notifications
    socketRef.current.emit('register', user?.id);
    socketRef.current.emit('joinChat', jobId);

    // Initial mark as read if there are unread messages
    socketRef.current.emit('markAsRead', { jobId, userId: user?.id });

    socketRef.current.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      const isMe = message.senderId === user?.id || message.senderId?._id === user?.id;
      if (!isMe) {
        dispatch(addNotification({ type: 'message', message: 'New message in your job chat' }));
        // If we are currently in chat and a new message arrives, mark it as read
        socketRef.current.emit('markAsRead', { jobId, userId: user?.id });
      }
    });

    socketRef.current.on('messagesRead', ({ jobId: readJobId, userId }) => {
      if (readJobId === jobId) {
        setMessages((prev) => prev.map(msg => {
          if (msg.senderId !== userId && !msg.readBy?.includes(userId)) {
            return { ...msg, readBy: [...(msg.readBy || []), userId] };
          }
          return msg;
        }));
      }
    });

    socketRef.current.on('typing', ({ senderId }) => {
      if (senderId !== user?.id) {
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socketRef.current.on('notification', (payload) => {
      dispatch(addNotification(payload));
      toast(payload.message, { icon: '🔔' });
    });

    return () => { socketRef.current?.disconnect(); };
  }, [jobId, isLoading, error, user?.id, dispatch]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !mediaFile) return;

    let mediaUrl = null;

    if (mediaFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('media', mediaFile);
        
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${backendUrl}/upload`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            mediaUrl = res.data.fileUrl; // Expect backend to return S3/Cloudinary URL or local path
        } catch (err) {
            console.error('File upload failed', err);
            toast.error('Failed to upload image', { icon: '❌' });
            setIsUploading(false);
            return;
        }
        setIsUploading(false);
        setMediaFile(null);
    }

    // Now emit the message, optionally containing an image
    socketRef.current?.emit('sendMessage', { 
        jobId, 
        senderId: user.id, 
        text: newMessage,
        mediaUrl 
    });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socketRef.current?.emit('typing', { jobId, senderId: user?.id });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-400 rounded p-6 text-red-700 font-semibold">{error}</div>
      </div>
    );
  }

  const otherPerson = user?.id === jobDetails?.buyerId?._id ? jobDetails?.sellerId : jobDetails?.buyerId;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/jobs/${jobId}`)} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">
              {otherPerson?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">{otherPerson?.name || 'Participant'}</p>
              <p className="text-gray-400 text-xs">Re: <span className="text-gray-600 font-semibold">{jobDetails?.title}</span></p>
            </div>
          </div>
        </div>
        <Link
          to={`/jobs/${jobId}`}
          className="border-2 border-gray-300 hover:border-gray-900 text-gray-600 hover:text-gray-900 font-black text-xs px-3 py-1.5 rounded transition-colors no-underline"
        >
          View Job →
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-400 font-semibold text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id;
          const senderName = isMe ? 'You' : (msg.senderId?.name || otherPerson?.name || 'User');
          const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);

          return (
            <div key={index} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {!isMe && (
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-xs ${showAvatar ? 'bg-blue-500' : 'opacity-0'}`}>
                  {senderName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showAvatar && !isMe && (
                  <p className="text-xs text-gray-400 font-semibold mb-1 ml-1">{senderName}</p>
                )}
                <div className={`flex flex-col rounded-2xl overflow-hidden ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border-2 border-gray-200 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.mediaUrl && (
                    <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                      <img src={msg.mediaUrl} alt="Attachment" className="max-w-full max-h-64 object-cover" />
                    </a>
                  )}
                  {msg.text && (
                    <div className="px-4 py-2.5 text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 mx-1">
                  <p className="text-xs text-gray-400">
                    {msg.timestamp ? formatTimeAgo(msg.timestamp) : ''}
                  </p>
                  {isMe && msg.readBy?.length > 0 && (
                    <svg className="w-3.5 h-3.5 text-blue-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t-2 border-gray-200 px-4 py-3 flex-shrink-0">
        
        {/* Attachment Preview Overlay */}
        {mediaFile && (
          <div className="mb-3 flex items-center gap-3 bg-gray-100 p-2 rounded border border-gray-200 w-max">
            <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">📎 {mediaFile.name}</span>
            <button onClick={() => setMediaFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="flex gap-1 bg-gray-200 px-3 py-2 rounded-2xl rounded-bl-sm">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-400 font-semibold">typing...</span>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />

          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={isUploading ? "Uploading media..." : "Type a message..."}
            disabled={isUploading}
            className="flex-1 border-2 border-gray-200 focus:border-blue-600 rounded-full px-4 py-2.5 text-sm outline-none transition-colors placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !mediaFile) || isUploading}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
