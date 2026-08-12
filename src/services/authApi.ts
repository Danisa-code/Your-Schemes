import axios from "axios";

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface FarmerUser {
  id: number;
  mobileNumber?: string;
  email?: string;
  role: string;
  name?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  preferredLanguage?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token?: string;
  user?: FarmerUser;
  isNewUser?: boolean;
  message?: string;
}

export interface FarmerProfileData {
  name: string;
  mobileNumber?: string;
  email?: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  preferredLanguage: "Tamil" | "English" | "Telugu" | "Kannada" | "Hindi";
}

const getAuthHeader = () => {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi = {
  sendOtp: async (identifier: string): Promise<SendOtpResponse> => {
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail ? { email: identifier } : { mobileNumber: identifier };
      const response = await axios.post<SendOtpResponse>("/api/auth/send-otp", payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "OTP அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
      }
      throw new Error("OTP அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.");
    }
  },

  verifyOtp: async (identifier: string, otp: string): Promise<VerifyOtpResponse> => {
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail ? { email: identifier, otp } : { mobileNumber: identifier, otp };
      const response = await axios.post<VerifyOtpResponse>("/api/auth/verify-otp", payload);
      if (response.data.token) {
        localStorage.setItem("jwt_token", response.data.token);
        localStorage.setItem("farmer_user", JSON.stringify(response.data.user));
        localStorage.setItem("isLoggedIn", "true");
      }
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        const msg = error.response.data.message;
        throw new Error(msg || "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
      }
      throw new Error("OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
    }
  },

  saveProfile: async (profile: FarmerProfileData): Promise<FarmerUser> => {
    try {
      const response = await axios.post<{ success: boolean; user: FarmerUser; message: string }>(
        "/api/auth/profile",
        profile,
        { headers: getAuthHeader() }
      );
      if (response.data.user) {
        localStorage.setItem("farmer_user", JSON.stringify(response.data.user));
      }
      return response.data.user;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "சுயவிவரத்தை சேமிக்க முடியவில்லை.");
      }
      throw new Error("சுயவிவரத்தை சேமிக்க முடியவில்லை.");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post("/api/auth/logout", {}, { headers: getAuthHeader() });
    } catch (e) {
      console.warn("Logout request completed with local cleanup");
    } finally {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("farmer_user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInEmail");
      localStorage.removeItem("loggedInUsername");
    }
  },

  getCurrentUser: async (): Promise<FarmerUser | null> => {
    try {
      const response = await axios.get<{ success: boolean; user: FarmerUser }>("/api/auth/me", {
        headers: getAuthHeader(),
      });
      return response.data.user;
    } catch (e) {
      return null;
    }
  },
};
