import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { authService, FarmerProfile, SaveProfileInput } from "../services/authService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  farmerProfile: FarmerProfile | null;
  loading: boolean;

  // ── Primary: Phone OTP Auth (Supabase Phone) ──────────────────────────────
  sendPhoneOtp: (phone: string) => Promise<{ data: any; error: AuthError | null }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ data: any; error: AuthError | null }>;
  logout: () => Promise<void>;
  saveProfile: (input: SaveProfileInput) => Promise<{ data: FarmerProfile | null; error: any }>;
  refreshProfile: () => Promise<FarmerProfile | null>;

  // ── Backward-compat: Email/Password/OTP Auth (used in LoginPage.tsx) ──────
  loginWithOTP: (email: string, username: string) => Promise<{ error: AuthError | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ session: Session | null; error: AuthError | null }>;
  loginWithPassword: (email: string, password: string) => Promise<{ session: Session | null; error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string, username: string) => Promise<{ user: User | null; error: AuthError | null }>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  exchangeCodeForSession: (code: string) => Promise<{ session: Session | null; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] Initializing Supabase Auth Session listener...");

    // Initial session check
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[AuthContext] Session fetch error:", error.message);
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profile = await authService.getFarmerProfile(initialSession.user.id);
          setFarmerProfile(profile);
          localStorage.setItem("isLoggedIn", "true");
        }
      } catch (err) {
        console.error("[AuthContext] Error in checkInitialSession:", err);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 14. Implement supabase.auth.onAuthStateChange() to keep authentication state synchronized
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[Auth State Change] Event: ${event}`);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && currentSession?.user) {
        localStorage.setItem("isLoggedIn", "true");
        const profile = await authService.getFarmerProfile(currentSession.user.id);
        setFarmerProfile(profile);
      } else if (event === "SIGNED_OUT") {
        setFarmerProfile(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("farmer_profile");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Primary Phone OTP Methods ──────────────────────────────────────────────

  const sendPhoneOtp = async (phone: string) => {
    return await authService.sendPhoneOtp(phone);
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    const res = await authService.verifyPhoneOtp(phone, otp);
    if (res.data?.session?.user) {
      const profile = await authService.getFarmerProfile(res.data.session.user.id);
      setFarmerProfile(profile);
    }
    return res;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setFarmerProfile(null);
  };

  const saveProfile = async (input: SaveProfileInput) => {
    const result = await authService.saveFarmerProfile(input);
    if (result.data) {
      setFarmerProfile(result.data);
    }
    return result;
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const prof = await authService.getFarmerProfile(user.id);
      setFarmerProfile(prof);
      return prof;
    }
    return null;
  };

  // ── Backward-compatible Email/Password/OTP stubs (used in LoginPage.tsx) ───

  const loginWithOTP = async (email: string, username: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as AuthError | null };
  };

  const verifyOTP = async (email: string, token: string) => {
    // Try magiclink first, then signup type
    let { data, error } = await supabase.auth.verifyOtp({ email, token, type: "magiclink" });
    if (error) {
      const res = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      if (!res.error) {
        data = res.data;
        error = null;
      } else {
        return { session: null, error: res.error as AuthError };
      }
    }
    return { session: data.session, error: null };
  };

  const loginWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data.session, error: error as AuthError | null };
  };

  const signUpWithPassword = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { user: data.user, error: error as AuthError | null };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as AuthError | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as AuthError | null };
  };

  const exchangeCodeForSession = async (code: string) => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    return { session: data.session, error: error as AuthError | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        farmerProfile,
        loading,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        saveProfile,
        refreshProfile,
        loginWithOTP,
        verifyOTP,
        loginWithPassword,
        signUpWithPassword,
        loginWithGoogle,
        forgotPassword,
        updatePassword,
        exchangeCodeForSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
