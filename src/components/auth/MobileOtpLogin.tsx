/**
 * src/components/auth/MobileOtpLogin.tsx
 *
 * OTP Gateway Phone Authentication – Login UI Component.
 *
 * Flow:
 *  1. Farmer enters 10-digit Indian mobile number
 *  2. Backend calls OTP Gateway to send SMS OTP
 *  3. Farmer enters 6-digit OTP → navigates to /verify-otp
 *  4. On verification success → profile check → /dashboard or /complete-profile
 */

import React, { useState, useEffect, useRef } from "react";
import {
  isValidIndianPhoneNumber,
  normalizeIndianPhoneNumber,
  FarmerProfile,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { Phone, ShieldCheck, ArrowRight, AlertCircle, Loader2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MobileOtpLoginProps {
  onLoginSuccess?: (userProfile: FarmerProfile | null, isNewUser?: boolean) => void;
  onNavigateHome?: () => void;
  onNavigateToCompleteProfile?: (authUserId: string, phone: string) => void;
  /** Called after OTP is sent successfully — navigates host to /verify-otp */
  onOtpSent?: (normalizedPhone: string, verificationId?: string) => void;
}

// ---------------------------------------------------------------------------
// Bilingual Dictionary
// ---------------------------------------------------------------------------

const dictionary = {
  ta: {
    title: "யுவர் ஸ்கீம்ஸ் (Your Schemes)",
    subtitle: "விவசாயிகள் உதவி & நில தகவல் போர்ட்டல்",
    enterMobile: "உங்கள் கைபேசி எண்ணை உள்ளிடவும்",
    enterMobileDesc: "சரிபார்ப்பு OTP-ஐப் பெற உங்கள் 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்",
    mobileLabel: "கைபேசி எண்",
    sendOtpBtn: "OTP அனுப்பவும்",
    sending: "OTP அனுப்பப்படுகிறது...",
    invalidMobileError: "சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.",
    sendOtpError: "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    otpSentSuccess: "OTP வெற்றிகரமாக அனுப்பப்பட்டது! உங்கள் கைபேசியை சரிபார்க்கவும்.",
    securityNote: "பாதுகாப்பான WP-SMS Gateway மூலம் பாதுகாக்கப்பட்டுள்ளது",
  },
  en: {
    title: "Your Schemes",
    subtitle: "Farmer Assistance & Land Intelligence Portal",
    enterMobile: "Enter your mobile number",
    enterMobileDesc: "Enter your 10-digit mobile number to receive a verification OTP",
    mobileLabel: "Mobile Number",
    sendOtpBtn: "Send OTP",
    sending: "Sending OTP...",
    invalidMobileError: "Please enter a valid 10-digit Indian mobile number.",
    sendOtpError: "Unable to send OTP. Please try again.",
    otpSentSuccess: "OTP sent successfully! Please check your mobile.",
    securityNote: "Protected by WP-SMS Gateway",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MobileOtpLogin: React.FC<MobileOtpLoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateToCompleteProfile,
  onOtpSent,
}) => {
  const auth = useAuth();

  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = dictionary[lang];

  // Focus phone input on mount
  const phoneInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => phoneInputRef.current?.focus(), 200);
  }, []);

  // ---------------------------------------------------------------------------
  // Send OTP Handler
  // ---------------------------------------------------------------------------

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate
    if (!isValidIndianPhoneNumber(mobileNumber)) {
      setErrorMessage(t.invalidMobileError);
      return;
    }

    const normalizedPhone = normalizeIndianPhoneNumber(mobileNumber);
    setLoading(true);

    try {
      const res = await auth.sendPhoneOtp(normalizedPhone);
      if (res.success) {
        setSuccessMessage(t.otpSentSuccess);
        if (onOtpSent) {
          onOtpSent(normalizedPhone, res.verificationId);
        }
      } else {
        setErrorMessage(res.message || t.sendOtpError);
      }
    } catch (err: any) {
      console.error("[MobileOtpLogin] Error sending OTP:", err?.message);
      setErrorMessage(err?.message || t.sendOtpError);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-center relative">
          {/* Language Toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/40 border border-white/10 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setLang("ta")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                lang === "ta" ? "bg-emerald-500 text-white shadow-sm" : "text-emerald-300 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                lang === "en" ? "bg-emerald-500 text-white shadow-sm" : "text-emerald-300 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-display">{t.title}</h1>
          <p className="text-emerald-200 text-sm">{t.subtitle}</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">{t.enterMobile}</h2>
            <p className="text-slate-400 text-sm">{t.enterMobileDesc}</p>
          </div>

          {/* Error / Success Banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-900/40 border border-red-700/50 rounded-xl p-3 text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 flex items-start gap-3 bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-3 text-emerald-300 text-sm"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone Number Form */}
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t.mobileLabel}
              </label>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition">
                <span className="text-slate-400 text-sm font-semibold select-none">🇮🇳 +91</span>
                <span className="text-slate-600">|</span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  id="phone-number-input"
                  value={mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setMobileNumber(val);
                    setErrorMessage(null);
                  }}
                  placeholder=""
                  maxLength={10}
                  autoComplete="tel-national"
                  className="flex-1 bg-transparent outline-none text-white text-lg tracking-widest placeholder-slate-600"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              id="send-otp-btn"
              disabled={loading || mobileNumber.length < 10}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.sending}</span>
                </>
              ) : (
                <>
                  <span>{t.sendOtpBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <p className="text-center text-slate-600 text-xs mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {t.securityNote}
          </p>

          {/* Back to Home */}
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full mt-4 text-slate-500 hover:text-slate-300 text-sm text-center transition flex items-center justify-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "ta" ? "முகப்புக்கு திரும்பு" : "Back to Home"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

