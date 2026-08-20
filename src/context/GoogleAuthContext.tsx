/**
 * src/context/GoogleAuthContext.tsx
 *
 * Google Sign-In auth context using @react-oauth/google.
 * Supports "Remember Me":
 *   - Checked  → stores user in localStorage  (persists across restarts)
 *   - Unchecked → stores user in sessionStorage (cleared when browser closes)
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name?: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

interface GoogleAuthContextType {
  user: GoogleUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  signIn: (credential: string) => void;
  signInWithUser: (user: GoogleUser) => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

const LS_KEY  = "google_user";          // localStorage key
const SS_KEY  = "google_user_session";  // sessionStorage key
const RM_KEY  = "google_remember_me";   // remember-me preference

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]           = useState<GoogleUser | null>(null);
  const [isLoaded, setIsLoaded]   = useState(false);
  const [rememberMe, setRememberMeState] = useState<boolean>(() => {
    // Restore remember-me preference
    return localStorage.getItem(RM_KEY) !== "false";
  });

  // Restore session on mount — check localStorage first, then sessionStorage
  useEffect(() => {
    const lsUser = localStorage.getItem(LS_KEY);
    const ssUser = sessionStorage.getItem(SS_KEY);

    if (lsUser) {
      try { setUser(JSON.parse(lsUser)); } catch { localStorage.removeItem(LS_KEY); }
    } else if (ssUser) {
      try { setUser(JSON.parse(ssUser)); } catch { sessionStorage.removeItem(SS_KEY); }
    }
    setIsLoaded(true);
  }, []);

  const setRememberMe = (v: boolean) => {
    setRememberMeState(v);
    localStorage.setItem(RM_KEY, String(v));

    // If toggling off while signed in, migrate storage
    if (user) {
      if (v) {
        localStorage.setItem(LS_KEY, JSON.stringify(user));
        sessionStorage.removeItem(SS_KEY);
      } else {
        sessionStorage.setItem(SS_KEY, JSON.stringify(user));
        localStorage.removeItem(LS_KEY);
      }
    }
  };

  const signIn = (credential: string) => {
    try {
      const decoded = jwtDecode<GoogleUser>(credential);
      setUser(decoded);
      if (rememberMe) {
        localStorage.setItem(LS_KEY, JSON.stringify(decoded));
        sessionStorage.removeItem(SS_KEY);
      } else {
        sessionStorage.setItem(SS_KEY, JSON.stringify(decoded));
        localStorage.removeItem(LS_KEY);
      }
    } catch (e) {
      console.error("[GoogleAuth] Failed to decode credential:", e);
    }
  };

  const signInWithUser = (userData: GoogleUser) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem(LS_KEY, JSON.stringify(userData));
      sessionStorage.removeItem(SS_KEY);
    } else {
      sessionStorage.setItem(SS_KEY, JSON.stringify(userData));
      localStorage.removeItem(LS_KEY);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
    sessionStorage.removeItem(SS_KEY);
  };

  return (
    <GoogleAuthContext.Provider value={{ user, isSignedIn: user !== null, isLoaded, rememberMe, setRememberMe, signIn, signInWithUser, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const ctx = useContext(GoogleAuthContext);
  if (!ctx) throw new Error("useGoogleAuth must be used inside GoogleAuthProvider");
  return ctx;
};
