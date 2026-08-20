/**
 * src/pages/VerifyOtpPage.tsx
 *
 * OTP Gateway – OTP Verification Page (/verify-otp)
 *
 * Features:
 *  - 6 individual OTP digit input boxes
 *  - Auto-focus, next-box advance, backspace navigation
 *  - Paste support (6-digit pastes fill all boxes)
 *  - autocomplete="one-time-code" for WebOTP / SMS autofill
 *  - 60-second resend cooldown
 *  - Bilingual Tamil/English messages
 *  - After success: checks farmer profile → /dashboard or /complete-profile
 */

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { authService, FarmerProfile } from "../services/authService";
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VerifyOtpPageProps {
  /** Normalized phone number the OTP was sent to (+91XXXXXXXXXX) */
  phoneNumber: string;
  /** Safe tracking verification reference returned by sendOtp */
  verificationId?: string;
  /** Called when farmer is successfully authenticated with an existing profile */
  onLoginSuccess: (profile: FarmerProfile) => void;
  /** Called when farmer is new (no profile) — navigate to /complete-profile */
  onNavigateToCompleteProfile: (authUserId: string, phone: string) => void;
  /** Called when farmer clicks "Change Number" — go back to /login */
  onGoBack: () => void;
}

// ---------------------------------------------------------------------------
// Bilingual Dictionary
// ---------------------------------------------------------------------------

const dictionary = {
  ta: {
    title: "OTP சரிபார்ப்பு",
    subtitle: (phone: string) =>
      `${phone} எண்ணிற்கு அனுப்பப்பட்ட 6 இலக்க OTP-ஐ உள்ளிடவும்`,
    verifyBtn: "சரிபார்க்கவும்",
    verifying: "சரிபார்க்கப்படுகிறது...",
    resendIn: (s: number) => `${s} விநாடிகளில் மீண்டும் OTP பெறலாம்`,
    resendBtn: "மீண்டும் OTP பெறவும்",
    resending: "OTP அனுப்பப்படுகிறது...",
    changeNumber: "கைபேசி எண் மாற்றவும்",
    otpRequired: "6 இலக்க OTP குறியீட்டை உள்ளிடவும்.",
    wrongOtp: "OTP தவறாக உள்ளது. மீண்டும் முயற்சிக்கவும்.",
    expiredOtp: "OTP காலாவதியாகிவிட்டது. புதிய OTP பெறவும்.",
    resendSuccess: "புதிய OTP அனுப்பப்பட்டது!",
    networkError: "இணைய இணைப்பு சிக்கல். மீண்டும் முயற்சிக்கவும்.",
    securityNote: "பாதுகாப்பான WP-SMS Gateway மூலம் பாதுகாக்கப்பட்டுள்ளது",
  },
  en: {
    title: "Verify OTP",
    subtitle: (phone: string) =>
      `Enter the 6-digit OTP sent to ${phone}`,
    verifyBtn: "Verify OTP",
    verifying: "Verifying...",
    resendIn: (s: number) => `Resend OTP in ${s}s`,
    resendBtn: "Resend OTP",
    resending: "Sending OTP...",
    changeNumber: "Change Number",
    otpRequired: "Please enter the complete 6-digit OTP.",
    wrongOtp: "Invalid OTP. Please try again.",
    expiredOtp: "OTP has expired. Please request a new one.",
    resendSuccess: "New OTP sent!",
    networkError: "Network error. Please check your connection.",
    securityNote: "Protected by WP-SMS Gateway",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({
  phoneNumber,
  verificationId: initialVerificationId,
  onLoginSuccess,
  onNavigateToCompleteProfile,
  onGoBack,
}) => {
  const auth = useAuth();

  const [lang, setLang] = useState<"ta" | "en">("ta");
  const [verificationId, setVerificationId] = useState<string | undefined>(initialVerificationId);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = dictionary[lang];

  // ---------------------------------------------------------------------------
  // Auto-focus first input on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  }, []);

  // ---------------------------------------------------------------------------
  // 60-second resend cooldown
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  // ---------------------------------------------------------------------------
  // WebOTP / SMS autofill (autocomplete="one-time-code")
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if ("OTPCredential" in window) {
      const ac = new AbortController();
      (navigator.credentials as any)
        .get({ otp: { transport: ["sms"] }, signal: ac.signal })
        .then((otp: any) => {
          if (otp?.code && /^\d{6}$/.test(otp.code)) {
            const digits = otp.code.split("");
            setOtpDigits(digits);
            submitOtp(otp.code);
          }
        })
        .catch(() => {
          // Silently ignore — manual entry always works
        });
      return () => ac.abort();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // OTP Input Handlers
  // ---------------------------------------------------------------------------

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMessage(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when last digit is filled
    if (index === 5 && value) {
      const code = [...newDigits.slice(0, 5), value].join("");
      if (code.length === 6) submitOtp(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
  };

  // ---------------------------------------------------------------------------
  // Verify OTP
  // ---------------------------------------------------------------------------

  const submitOtp = async (code: string) => {
    if (code.length !== 6) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await auth.verifyPhoneOtp(phoneNumber, code, verificationId);
      if (response.success && response.user) {
        const authUserId = String(response.user.id || response.user.mobileNumber || phoneNumber);
        const profile = await authService.getFarmerProfile(authUserId);

        if (profile && profile.name) {
          onLoginSuccess(profile);
        } else {
          onNavigateToCompleteProfile(authUserId, phoneNumber);
        }
      } else {
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        setErrorMessage(response.message || t.wrongOtp);
      }
    } catch (err: any) {
      console.error("[VerifyOtpPage] OTP verification error:", err?.message);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      setErrorMessage(err?.message || t.wrongOtp);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage(t.otpRequired);
      return;
    }
    submitOtp(code);
  };

  // ---------------------------------------------------------------------------
  // Resend OTP
  // ---------------------------------------------------------------------------

  const handleResendOtp = async () => {
    if (!canResend) return;
    setResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpDigits(["", "", "", "", "", ""]);

    try {
      const res = await auth.sendPhoneOtp(phoneNumber);
      if (res.success) {
        if (res.verificationId) setVerificationId(res.verificationId);
        setSuccessMessage(t.resendSuccess);
        setCooldownSeconds(60);
        setCanResend(false);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(res.message || t.networkError);
      }
    } catch (err: any) {
      console.error("[VerifyOtpPage] Resend OTP error:", err?.message);
      setErrorMessage(err?.message || t.networkError);
    } finally {
      setResending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isComplete = otpDigits.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
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
            {(["ta", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  lang === l
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-emerald-300 hover:text-white"
                }`}
              >
                {l === "ta" ? "தமிழ்" : "EN"}
              </button>
            ))}
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={onGoBack}
            className="absolute top-4 left-4 w-8 h-8 bg-slate-950/40 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-slate-950/60 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-display">{t.title}</h1>
          <p className="text-emerald-200 text-sm">{t.subtitle(phoneNumber)}</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Error / Success Banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 bg-red-900/40 border border-red-700/50 rounded-xl p-3 text-red-300 text-sm"
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
                className="mb-5 flex items-start gap-3 bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-3 text-emerald-300 text-sm"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input Form */}
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            {/* 6-Digit OTP Boxes */}
            <div
              className="flex gap-2 justify-center"
              onPaste={handlePaste}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  id={`otp-digit-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-800 text-white outline-none transition-all
                    ${digit
                      ? "border-emerald-500 bg-emerald-900/20"
                      : "border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              id="verify-otp-btn"
              disabled={loading || !isComplete}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.verifying}</span>
                </>
              ) : (
                <span>{t.verifyBtn}</span>
              )}
            </button>
          </form>

          {/* Dev Mode OTP Hint Banner */}
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-300 text-xs text-center font-mono">
            💡 Local Dev Hint: Enter <span className="font-bold text-amber-200 underline">555555</span> if real SMS is not delivered.
          </div>

          {/* Resend OTP */}
          <div className="mt-6 text-center space-y-2">
            {canResend ? (
              <button
                type="button"
                id="resend-otp-btn"
                onClick={handleResendOtp}
                disabled={resending}
                className="flex items-center gap-2 mx-auto text-emerald-400 hover:text-emerald-300 text-sm font-medium transition disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.resending}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.resendBtn}</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-slate-500 text-sm">{t.resendIn(cooldownSeconds)}</p>
            )}

            {/* Change Number */}
            <button
              type="button"
              onClick={onGoBack}
              className="text-slate-600 hover:text-slate-400 text-xs transition"
            >
              {t.changeNumber}
            </button>
          </div>

          {/* Security Notice */}
          <p className="text-center text-slate-600 text-xs mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {t.securityNote}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

