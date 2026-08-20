import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './context/GoogleAuthContext.tsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "616263047936-so1p3pasddegcn32tne3mi94pd2bo9j4.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
