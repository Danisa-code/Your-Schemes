import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpWithPassword: (email: string, password: string, username: string) => Promise<{ user: User | null; error: AuthError | null }>;
  loginWithPassword: (email: string, password: string) => Promise<{ session: Session | null; error: AuthError | null }>;
  loginWithOTP: (email: string, username: string) => Promise<{ error: AuthError | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ session: Session | null; error: AuthError | null }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  exchangeCodeForSession: (code: string) => Promise<{ session: Session | null; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth Context] Initializing session listener...");
    
    // 1. Initial Session Check (Real Supabase)
    const checkSession = async () => {
      try {
        console.log("[Auth Context] Fetching current active session...");
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Auth Context] Error fetching initial session:", error.message);
          throw error;
        }
        
        if (initialSession) {
          console.log("[Auth Context] Active session retrieved successfully. User email:", initialSession.user?.email);
        } else {
          console.log("[Auth Context] No active session found.");
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error("[Auth Context] Unexpected error in checkSession:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Auth State Listener (Real Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log(`[Auth State Changed] Event: ${event}`);
      if (currentSession) {
        console.log(`[Auth State Changed] Active User details: Email=${currentSession.user?.email}, ID=${currentSession.user?.id}`);
      } else {
        console.log("[Auth State Changed] Session is null (User signed out).");
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && currentSession?.user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInEmail", currentSession.user.email ?? "");
        localStorage.setItem("loggedInUsername", currentSession.user.user_metadata?.username || currentSession.user.user_metadata?.full_name || currentSession.user.email?.split("@")[0] || "Farmer");
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInEmail");
        localStorage.removeItem("loggedInUsername");
      }
    });

    return () => {
      console.log("[Auth Context] Cleaning up auth listener subscription.");
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithPassword = async (email: string, password: string, username: string) => {
    console.log("[Auth Service] Sign up started for email:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("[Auth Service] Sign up failed with Supabase error:", error);
        return { user: null, error };
      }
      
      console.log("[Auth Service] Sign up successful for user ID:", data.user?.id);
      return { user: data.user, error: null };
    } catch (err) {
      console.error("[Auth Service] Sign up failed with unexpected error:", err);
      throw err;
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    console.log("[Auth Service] Password login started for email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("[Auth Service] Password login failed with Supabase error:", error);
        return { session: null, error };
      }
      
      console.log("[Auth Service] Password login successful. Session user ID:", data.session?.user?.id);
      return { session: data.session, error: null };
    } catch (err) {
      console.error("[Auth Service] Password login failed with unexpected error:", err);
      throw err;
    }
  };

  const loginWithOTP = async (email: string, username: string) => {
    console.log("[Auth Service] OTP login started for email:", email, "username metadata:", username);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("[Auth Service] OTP login failed with Supabase error:", error);
        return { error };
      }
      
      console.log("[Auth Service] OTP request sent successfully by Supabase.");
      return { error: null };
    } catch (err) {
      console.error("[Auth Service] OTP login failed with unexpected error:", err);
      throw err;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    console.log("[Auth Service] OTP verification started for email:", email, "token length:", token.length);
    try {
      // Try magiclink type first (used for signInWithOtp)
      let { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "magiclink",
      });
      
      // If that fails, try signup type (used for signUp verification codes)
      if (error) {
        console.log("[Auth Service] Magiclink verification failed, trying signup type. Error info:", error.message);
        const signupRes = await supabase.auth.verifyOtp({
          email,
          token,
          type: "signup",
        });
        if (!signupRes.error) {
          data = signupRes.data;
          error = null;
        } else {
          // If signup fails as well, return original error or the signup error
          console.error("[Auth Service] Both magiclink and signup verification failed.");
          return { session: null, error: signupRes.error };
        }
      }
      
      console.log("[Auth Service] OTP verification successful. Session user ID:", data.session?.user?.id);
      return { session: data.session, error: null };
    } catch (err) {
      console.error("[Auth Service] OTP verification failed with unexpected error:", err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const redirectUrl = window.location.origin + "/auth/callback";
    console.log("[Auth Service] Google OAuth login started. Callback target redirectUrl:", redirectUrl);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error("[Auth Service] Google OAuth sign-in request failed with Supabase error:", error);
        throw error;
      }
      
      console.log("[Auth Service] Google OAuth redirection initiated successfully.");
    } catch (err) {
      console.error("[Auth Service] Google OAuth failed with unexpected error:", err);
      throw err;
    }
  };

  const logout = async () => {
    console.log("[Auth Service] Logout request started for active session.");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Auth Service] Logout failed with Supabase error:", error);
        throw error;
      }
      
      console.log("[Auth Service] Logout completed successfully.");
    } catch (err) {
      console.error("[Auth Service] Logout failed with unexpected error:", err);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInEmail");
      localStorage.removeItem("loggedInUsername");
    }
  };

  const forgotPassword = async (email: string) => {
    console.log("[Auth Service] Password reset request started for email:", email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("[Auth Service] Password reset link request failed with Supabase error:", error);
        return { error };
      }
      
      console.log("[Auth Service] Password reset link sent successfully.");
      return { error: null };
    } catch (err) {
      console.error("[Auth Service] Password reset failed with unexpected error:", err);
      throw err;
    }
  };

  const updatePassword = async (password: string) => {
    console.log("[Auth Service] Password update started.");
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error("[Auth Service] Password update failed with Supabase error:", error);
        return { error };
      }
      
      console.log("[Auth Service] Password updated successfully.");
      return { error: null };
    } catch (err) {
      console.error("[Auth Service] Password update failed with unexpected error:", err);
      throw err;
    }
  };

  const exchangeCodeForSession = async (code: string) => {
    console.log("[Auth Service] Exchanging authorization code for session...");
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Auth Service] Code exchange failed with Supabase error:", error);
        return { session: null, error };
      }
      
      console.log("[Auth Service] Code exchange successful. Session user ID:", data.session?.user?.id);
      return { session: data.session, error: null };
    } catch (err) {
      console.error("[Auth Service] Code exchange failed with unexpected error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUpWithPassword,
        loginWithPassword,
        loginWithOTP,
        verifyOTP,
        loginWithGoogle,
        logout,
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
