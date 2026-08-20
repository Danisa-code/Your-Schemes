/**
 * src/services/authService.ts
 *
 * Supabase DATABASE service for farmer profiles.
 *
 * Authentication is handled via Spring Boot Backend + OTP Gateway.
 *
 * This file retains the Supabase DATABASE operations:
 *   - getFarmerProfile()       — query farmers table by application user ID / phone
 *   - checkFarmerProfileExists()
 *   - saveFarmerProfile()      — upsert into farmers table
 *
 * The `auth_user_id` field stores the application user's identifier (user ID or normalized phone number).
 */

import { supabase } from "../lib/supabaseClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Phone Number Utilities (used throughout the app)
// ---------------------------------------------------------------------------

/**
 * Validates an Indian mobile number.
 * Accepts 10-digit numbers starting with 6–9, with optional +91 or 91 prefix.
 */
export const isValidIndianPhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;
  if (/[a-zA-Z]/.test(phone)) return false;
  let cleaned = phone.trim().replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Normalizes an Indian phone number to E.164 format: +91XXXXXXXXXX
 */
export const normalizeIndianPhoneNumber = (phone: string): string => {
  let cleaned = phone.trim().replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return `+91${cleaned}`;
};

export const formatIndianPhoneNumber = normalizeIndianPhoneNumber;

// ---------------------------------------------------------------------------
// Farmer Profile — Supabase Database Operations
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * Retrieves the farmer profile from the Supabase `farmers` table.
   * Uses application user ID / phone as `auth_user_id`.
   * Falls back to localStorage cache if the DB is unavailable.
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
   * Returns true if a complete farmer profile exists for the given user ID.
   */
  async checkFarmerProfileExists(authUserId: string): Promise<boolean> {
    if (!authUserId) return false;
    const profile = await this.getFarmerProfile(authUserId);
    return profile !== null && Boolean(profile.name);
  },

  /**
   * Creates or updates the farmer profile in the Supabase `farmers` table.
   * Uses application user ID / phone as the upsert conflict key.
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

    // Cache locally for instant UI responsiveness
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

