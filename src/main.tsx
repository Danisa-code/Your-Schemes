import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './context/GoogleAuthContext.tsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "100000000000-dummy.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
