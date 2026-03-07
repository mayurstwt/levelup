import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { store } from './store';
import { setCredentials, logout } from './features/auth/authSlice';
import App from './App.jsx'

// Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not already retried (and not the refresh endpoint itself)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const { data } = await axios.post(`${backendUrl}/auth/refresh`, {}, { withCredentials: true });
        
        localStorage.setItem('token', data.token);
        
        const user = store.getState().auth.user;
        if (user) {
          store.dispatch(setCredentials({ user, token: data.token }));
        }

        originalRequest.headers['Authorization'] = 'Bearer ' + data.token;
        processQueue(null, data.token);
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'inherit',
            fontWeight: '900',
            fontSize: '14px',
            borderRadius: '0px',
            border: '2px solid #111827',
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            background: '#ffffff',
            color: '#111827',
            padding: '12px 16px',
          },
          success: {
            style: { borderLeft: '6px solid #10b981' },
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            style: { borderLeft: '6px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </Provider>
  </StrictMode>,
)
