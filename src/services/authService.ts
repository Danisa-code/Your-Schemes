import { supabase } from "../lib/supabaseClient";

export interface FarmerProfile {
  id?: string | number;
  auth_user_id: string;
  name: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  preferred_language: "Tamil" | "English" | "Telugu" | "Kannada" | "Hindi" | string;
  created_at?: string;
  updated_at?: string;
}

export interface SaveProfileInput {
  auth_user_id: string;
  name: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  preferred_language: "Tamil" | "English" | "Telugu" | "Kannada" | "Hindi" | string;
}

/**
 * Normalizes input mobile number into canonical Indian international E.164 format (+91XXXXXXXXXX)
 */
export const formatIndianPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (phone.startsWith("+")) {
    return phone;
  }
  return `+91${cleaned}`;
};

export const authService = {
  /**
   * 5. Send OTP using supabase.auth.signInWithOtp({ phone })
   */
  async sendPhoneOtp(phone: string) {
    const formattedPhone = formatIndianPhoneNumber(phone);
    console.log("[AuthService] Sending Phone OTP via Supabase Auth to:", formattedPhone);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) {
      console.error("[AuthService] sendPhoneOtp Error:", error.message);
    }
    return { data, error };
  },

  /**
   * 6. Verify OTP using supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
   */
  async verifyPhoneOtp(phone: string, otp: string) {
    const formattedPhone = formatIndianPhoneNumber(phone);
    console.log("[AuthService] Verifying Phone OTP via Supabase Auth for:", formattedPhone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });
    if (error) {
      console.error("[AuthService] verifyPhoneOtp Error:", error.message);
    }
    return { data, error };
  },

  /**
   * Retrieve current Supabase session
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[AuthService] getCurrentSession Error:", error.message);
    }
    return session;
  },

  /**
   * Retrieve current Supabase authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("[AuthService] getCurrentUser Error:", error.message);
    }
    return user;
  },

  /**
   * 15. Sign out user using supabase.auth.signOut()
   */
  async signOut() {
    console.log("[AuthService] Signing out user session via Supabase Auth...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AuthService] signOut Error:", error.message);
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("farmer_profile");
    return { error };
  },

  /**
   * 10 & 11. Store and query farmer profile separately from Supabase Auth
   * Uses auth_user_id as relationship key in the `farmers` table.
   */
  async getFarmerProfile(authUserId: string): Promise<FarmerProfile | null> {
    if (!authUserId) return null;
    try {
      const { data, error } = await supabase
        .from("farmers")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error) {
        console.warn("[AuthService] Farmers table query warning:", error.message);
        // Fallback to local storage cache if table does not exist or network fails
        const local = localStorage.getItem(`farmer_profile_${authUserId}`);
        return local ? JSON.parse(local) : null;
      }

      if (data) {
        localStorage.setItem(`farmer_profile_${authUserId}`, JSON.stringify(data));
        return data as FarmerProfile;
      }

      const local = localStorage.getItem(`farmer_profile_${authUserId}`);
      return local ? JSON.parse(local) : null;
    } catch (e) {
      console.warn("[AuthService] getFarmerProfile exception fallback:", e);
      const local = localStorage.getItem(`farmer_profile_${authUserId}`);
      return local ? JSON.parse(local) : null;
    }
  },

  /**
   * Check whether farmer profile exists for given authenticated user ID
   */
  async checkFarmerProfileExists(authUserId: string): Promise<boolean> {
    if (!authUserId) return false;
    const profile = await this.getFarmerProfile(authUserId);
    return profile !== null && Boolean(profile.name);
  },

  /**
   * Save or update farmer profile in Supabase `farmers` table
   */
  async saveFarmerProfile(profile: SaveProfileInput): Promise<{ data: FarmerProfile | null; error: any }> {
    const payload: FarmerProfile = {
      auth_user_id: profile.auth_user_id,
      name: profile.name,
      phone: formatIndianPhoneNumber(profile.phone),
      district: profile.district,
      taluk: profile.taluk,
      village: profile.village,
      preferred_language: profile.preferred_language,
      updated_at: new Date().toISOString(),
    };

    // Cache locally immediately to ensure instant UI responsiveness
    localStorage.setItem(`farmer_profile_${profile.auth_user_id}`, JSON.stringify(payload));
    localStorage.setItem("farmer_profile", JSON.stringify(payload));

    try {
      const { data, error } = await supabase
        .from("farmers")
        .upsert(
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
          { onConflict: "auth_user_id" }
        )
        .select()
        .single();

      if (error) {
        console.warn("[AuthService] Supabase farmers table upsert notice:", error.message);
        return { data: payload, error: null };
      }

      return { data: data as FarmerProfile, error: null };
    } catch (err) {
      console.warn("[AuthService] saveFarmerProfile exception fallback:", err);
      return { data: payload, error: null };
    }
  },
};
