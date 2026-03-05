import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App.jsx'

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
