/**
 * src/context/AuthContext.tsx
 *
 * Backend JWT + OTP Gateway Authentication Context.
 *
 * Authentication state is managed via backend REST APIs (src/services/authApi.ts)
 * and JWT tokens stored in localStorage.
 *
 * Supabase is used for the `farmers` database table operations.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { authApi, FarmerUser, SendOtpResponse, VerifyOtpResponse } from "../services/authApi";
import { authService, FarmerProfile, SaveProfileInput } from "../services/authService";

// ---------------------------------------------------------------------------
// Context Shape
// ---------------------------------------------------------------------------

interface AuthContextType {
  /** Authenticated farmer user object from backend (null if not signed in) */
  user: FarmerUser | null;
  /** True while resolving initial authentication state */
  loading: boolean;
  /** Shorthand: user !== null */
  isAuthenticated: boolean;
  /** Farmer profile from Supabase DB (null if not yet created) */
  farmerProfile: FarmerProfile | null;

  /**
   * Sends an SMS OTP via Backend -> OTP Gateway.
   * @param phone E.164 normalized number (+91XXXXXXXXXX)
   */
  sendPhoneOtp: (phone: string) => Promise<SendOtpResponse>;

  /**
   * Verifies the 6-digit OTP entered by the farmer via Backend -> OTP Gateway.
   * @param phone Normalized phone number
   * @param otp 6-digit OTP code
   * @param verificationId Safe tracking reference returned by sendPhoneOtp
   */
  verifyPhoneOtp: (phone: string, otp: string, verificationId?: string) => Promise<VerifyOtpResponse>;

  /** Signs out the current user and clears session state */
  logout: () => Promise<void>;

  /** Creates or updates the farmer profile in Supabase */
  saveProfile: (input: SaveProfileInput) => Promise<{ data: FarmerProfile | null; error: any }>;

  /** Re-fetches the farmer profile from Supabase */
  refreshProfile: () => Promise<FarmerProfile | null>;
}

// ---------------------------------------------------------------------------
// Context & Provider
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log("[AuthContext] Initializing Backend Auth session check...");
      const token = localStorage.getItem("jwt_token");
      const localUserStr = localStorage.getItem("farmer_user");

      if (token) {
        let currentUser: FarmerUser | null = null;
        try {
          currentUser = await authApi.getCurrentUser();
        } catch (e) {
          console.warn("[AuthContext] Unable to verify JWT token with backend:", e);
        }

        if (!currentUser && localUserStr) {
          try {
            currentUser = JSON.parse(localUserStr);
          } catch (e) {
            currentUser = null;
          }
        }

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("isLoggedIn", "true");
          const authUserId = String(currentUser.id || currentUser.mobileNumber);
          const profile = await authService.getFarmerProfile(authUserId);
          setFarmerProfile(profile);
        } else {
          setUser(null);
          setFarmerProfile(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("farmer_user");
        }
      } else {
        setUser(null);
        setFarmerProfile(null);
        localStorage.removeItem("isLoggedIn");
      }

      setLoading(false);
      initializedRef.current = true;
    };

    initAuth();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth Methods
  // ---------------------------------------------------------------------------

  const sendPhoneOtp = async (phone: string): Promise<SendOtpResponse> => {
    return await authApi.sendOtp(phone);
  };

  const verifyPhoneOtp = async (
    phone: string,
    otp: string,
    verificationId?: string
  ): Promise<VerifyOtpResponse> => {
    const res = await authApi.verifyOtp(phone, otp, verificationId);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem("isLoggedIn", "true");
      const authUserId = String(res.user.id || res.user.mobileNumber);
      const profile = await authService.getFarmerProfile(authUserId);
      setFarmerProfile(profile);
    }
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setFarmerProfile(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("farmer_user");
  };

  const saveProfile = async (input: SaveProfileInput) => {
    const result = await authService.saveFarmerProfile(input);
    if (result.data) {
      setFarmerProfile(result.data);
    }
    return result;
  };

  const refreshProfile = async (): Promise<FarmerProfile | null> => {
    if (user) {
      const authUserId = String(user.id || user.mobileNumber);
      const prof = await authService.getFarmerProfile(authUserId);
      setFarmerProfile(prof);
      return prof;
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        farmerProfile,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

