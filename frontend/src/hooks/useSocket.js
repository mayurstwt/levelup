/**
 * useSocket.js
 * Persistent Socket.IO connection that:
 *  - Registers the user on connect
 *  - Listens for 'notification' events and dispatches them to Redux
 *  - Listens for 'newMessage' events for the chat page
 *
 * Usage: call once at the top of App.jsx (inside a component)
 */
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { addNotification, fetchNotifications } from '../features/notifications/notificationSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Singleton socket instance across re-renders
let socket = null;

export const getSocket = () => socket;

const useSocket = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const registeredRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Fetch historical notifications
        dispatch(fetchNotifications());

        // Create socket only once
        if (!socket || !socket.connected) {
            socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 10,
            });
        }

        socket.on('connect', () => {
            if (!registeredRef.current) {
                socket.emit('register', user.id);
                registeredRef.current = true;
                console.log('[Socket] Connected & registered:', user.id);
            }
        });

        // Re-register after reconnect
        socket.on('reconnect', () => {
            socket.emit('register', user.id);
            console.log('[Socket] Reconnected & re-registered:', user.id);
        });

        // Real-time notification → dispatch to Redux and show toast
        socket.on('notification', (payload) => {
            dispatch(addNotification(payload));
            if (payload?.message) {
                toast(payload.message, {
                    icon: '🔔',
                    duration: 4000,
                    style: {
                        borderRadius: '6px',
                        background: '#333',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '13px'
                    },
                });
            }
        });

        // Keep connection alive
        if (socket.connected && !registeredRef.current) {
            socket.emit('register', user.id);
            registeredRef.current = true;
        }

        return () => {
            if (socket) {
                socket.off('notification');
                socket.off('reconnect');
                socket.disconnect();
                socket = null;
            }
            registeredRef.current = false;
        };
    }, [isAuthenticated, user?.id, dispatch]);

    return socket;
};

export default useSocket;
