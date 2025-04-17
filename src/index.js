import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      async (registration) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Service Worker registered:', registration);
        }
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Get push subscription
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY, // Add to .env
          });
          // Send subscription to backend
          try {
            const userId = localStorage.getItem('userId'); // From your auth (March 11, 2025)
            console.log(userId);
            if (userId) {
              await axios.post('https://momentcraft-backend.onrender.com/api/push/subscribe', {
                userId,
                subscription,
              });
              toast.success('Subscribed to notifications!');
            }
          } catch (error) {
            toast.error('Failed to subscribe to notifications');
          }
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('New update available! Refresh to apply.', {
                position: 'top-right',
                autoClose: false,
                onClick: () => window.location.reload(),
              });
            }
          });
        });
      },
      (error) => {
        console.error('Service Worker registration failed:', error);
      }
    );
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
