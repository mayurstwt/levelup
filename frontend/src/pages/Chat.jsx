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

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

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

    socketRef.current.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      const isMe = message.senderId === user?.id || message.senderId?._id === user?.id;
      if (!isMe) {
        dispatch(addNotification({ type: 'message', message: 'New message in your job chat' }));
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socketRef.current?.emit('sendMessage', { jobId, senderId: user.id, text: newMessage });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socketRef.current?.emit('typing', { jobId, senderId: user?.id });
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
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border-2 border-gray-200 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <p className="text-xs text-gray-400 mt-1 mx-1">
                  {msg.timestamp ? formatTimeAgo(msg.timestamp) : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t-2 border-gray-200 px-4 py-3 flex-shrink-0">
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
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border-2 border-gray-200 focus:border-blue-600 rounded-full px-4 py-2.5 text-sm outline-none transition-colors placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
