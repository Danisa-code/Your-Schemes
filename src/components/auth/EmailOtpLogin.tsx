import React from "react";
import { MobileOtpLogin } from "./MobileOtpLogin";
import { FarmerProfile } from "../../services/authService";

/**
 * EmailOtpLogin is a thin compatibility wrapper that delegates to MobileOtpLogin.
 * The portal now uses Supabase Phone OTP authentication.
 */
interface EmailOtpLoginProps {
  onLoginSuccess: (user: FarmerProfile | null, isNewUser?: boolean) => void;
  onNavigateHome?: () => void;
}

export const EmailOtpLogin: React.FC<EmailOtpLoginProps> = (props) => {
  return <MobileOtpLogin {...props} />;
};
