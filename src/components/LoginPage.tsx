import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { User, Mail, Check, ShieldAlert, ArrowRight, Loader2, Globe, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import { MobileOtpLogin } from "./auth/MobileOtpLogin";

interface LoginPageProps {
  onLoginSuccess: (username: string, email: string) => void;
  mode?: "login" | "reset-password";
}

export function LoginPage({ onLoginSuccess, mode = "login" }: LoginPageProps) {
  if (mode !== "reset-password") {
    return (
      <MobileOtpLogin
        onLoginSuccess={(farmerProfile) => {
          onLoginSuccess(farmerProfile?.name || "Farmer", farmerProfile?.phone || "");
        }}
      />
    );
  }

  // Note: reset-password flow is no longer available with Firebase Phone Auth.
  // This branch is unreachable since App.tsx removed the /reset-password route.
  // Keeping a minimal stub to avoid unused variable errors.
  const _auth = useAuth();

  // Check if environment variables are still default placeholders
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL ||
                       import.meta.env.VITE_SUPABASE_URL.includes("your-project") ||
                       !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                       import.meta.env.VITE_SUPABASE_ANON_KEY.includes("your-supabase-anon-key");

  // Navigation mode (otp-login, password-login, signup, forgot-password, reset-password)
  const [authMode, setAuthMode] = useState<"otp-login" | "password-login" | "signup" | "forgot-password" | "reset-password">(
    mode === "reset-password" ? "reset-password" : "otp-login"
  );

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // OTP step states
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  
  // Interaction/status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Sync mode changes from props
  useEffect(() => {
    if (mode === "reset-password") {
      setAuthMode("reset-password");
    } else {
      setAuthMode("otp-login");
    }
  }, [mode]);

  // Background particle configuration
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

  // Setup random floating background particles once on mount
  useEffect(() => {
    const generated = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 8 + 4, // pixels
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 10,
    }));
    setParticles(generated);
  }, []);

  // Mouse coordinate state for cursor-reactive background & tilt effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tilt/light reflection on the card
  const cardXSpring = useSpring(0, { stiffness: 100, damping: 20 });
  const cardYSpring = useSpring(0, { stiffness: 100, damping: 20 });
  const [cardLightX, setCardLightX] = useState(50);
  const [cardLightY, setCardLightY] = useState(50);

  // Custom cursor position and scale springs
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorRingScale = useSpring(1, { stiffness: 300, damping: 20 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // Detect touch screens to disable custom cursor and use simpler touch events
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  // Track global mouse position for custom cursor and interactive background
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isCursorActive) setIsCursorActive(true);
      
      // Update custom cursor coordinates
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Track relative positions for parallax elements
      const pctX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const pctY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      mouseX.set(pctX);
      mouseY.set(pctY);

      // Also check if mouse is over interactive element to scale ring
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = 
          target.tagName === "BUTTON" || 
          target.tagName === "A" || 
          target.tagName === "INPUT" || 
          target.tagName === "SELECT" || 
          target.closest("button") || 
          target.closest("a") ||
          target.closest(".interactive-clickable");
        
        if (isClickable) {
          setIsHoveringClickable(true);
          cursorRingScale.set(1.8);
        } else {
          setIsHoveringClickable(false);
          cursorRingScale.set(1);
        }
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsCursorActive(false);
    };

    const handleMouseEnterWindow = () => {
      setIsCursorActive(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
    };
  }, [isTouchDevice, isCursorActive]);

  // Card reference for calculating local relative cursor coordinates for the light reflection & 3D tilt
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element

    // Light gradient coordinates in percentages
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setCardLightX(pctX);
    setCardLightY(pctY);

    // 3D tilt calculation (max 10 degrees tilt)
    const tiltX = -((y / rect.height) - 0.5) * 12; // tilt around X axis based on Y coordinate
    const tiltY = ((x / rect.width) - 0.5) * 12;   // tilt around Y axis based on X coordinate
    
    cardXSpring.set(tiltX);
    cardYSpring.set(tiltY);
  };

  const handleCardMouseLeave = () => {
    cardXSpring.set(0);
    cardYSpring.set(0);
    setCardLightX(50);
    setCardLightY(50);
  };

  // Real-time Validation helpers
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = isUsernameValid && isEmailValid;

  // Verbose error parser that shows exact Supabase failures
  const handleAuthError = (err: any) => {
    console.error("[LoginPage] Authentication failure details logged:", err);
    const msg = err.message || err.error_description || "An unexpected error occurred.";
    setErrorMsg(msg);
    showToast(msg, "error");
  };

  // Handle Credentials form submission to trigger OTP send
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameTouched(true);
    setEmailTouched(true);
    setErrorMsg(null);

    if (isPlaceholder) {
      handleAuthError(new Error("Supabase URL and Anon Key are missing or placeholders. Add valid keys in .env."));
      return;
    }

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    console.log(`[LoginPage] Initiating OTP send for email: ${email}`);

    try {
      throw new Error("Email/OTP auth has been replaced by Firebase Phone Auth.");

      setLoginStep("otp");
      showToast("OTP email sent successfully!", "success");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP submission and verification logic
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpTouched(true);
    setErrorMsg(null);

    if (otpCode.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    console.log(`[LoginPage] Initiating OTP verification for email: ${email}, code: ${otpCode}`);

    try {
      const { session, error } = { session: null, error: new Error("Firebase Phone Auth only.") }; await Promise.resolve();
      if (error) throw error;

      setOtpError(false);
      setIsSuccess(true);
      showToast("Verification successful! Logging in...", "success");
      
      setTimeout(() => {
        onLoginSuccess(username || session?.user?.user_metadata?.username || "Farmer", email);
      }, 1200);
    } catch (err) {
      setOtpError(true);
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Login Submit
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setErrorMsg(null);

    if (isPlaceholder) {
      handleAuthError(new Error("Supabase URL and Anon Key are missing or placeholders. Add valid keys in .env."));
      return;
    }

    if (!isEmailValid || !password || isSubmitting) return;

    setIsSubmitting(true);
    console.log(`[LoginPage] Initiating password login for: ${email}`);

    try {
      const { session, error } = { session: null, error: new Error("Firebase Phone Auth only.") }; await Promise.resolve();
      if (error) throw error;

      setIsSuccess(true);
      showToast("Login successful!", "success");
      setTimeout(() => {
        onLoginSuccess(session?.user?.user_metadata?.username || "Farmer", email);
      }, 1200);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setErrorMsg(null);

    if (isPlaceholder) {
      handleAuthError(new Error("Supabase URL and Anon Key are missing or placeholders. Add valid keys in .env."));
      return;
    }

    if (!isFormValid || !isPasswordValid || isSubmitting) return;

    setIsSubmitting(true);
    console.log(`[LoginPage] Initiating registration for: ${email}`);

    try {
      const { error } = { error: new Error("Firebase Phone Auth only.") }; await Promise.resolve();
      if (error) throw error;

      showToast("Check your email for a verification link!", "success");
      alert(`[Secure Gateway] Registration successful. Verification link sent to ${email}.`);
      setAuthMode("password-login");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setErrorMsg(null);

    if (isPlaceholder) {
      handleAuthError(new Error("Supabase URL and Anon Key are missing or placeholders. Add valid keys in .env."));
      return;
    }

    if (!isEmailValid || isSubmitting) return;

    setIsSubmitting(true);
    console.log(`[LoginPage] Initiating forgot password link request for: ${email}`);

    try {
      const { error } = { error: new Error("Firebase Phone Auth only.") }; await Promise.resolve();
      if (error) throw error;

      showToast("Password reset link sent!", "success");
      alert(`[Secure Gateway] Password reset link dispatched to ${email}.`);
      setAuthMode("password-login");
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth Login
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    
    if (isPlaceholder) {
      handleAuthError(new Error("Supabase URL and Anon Key are missing or placeholders. Add valid keys in .env."));
      return;
    }

    setIsSubmitting(true);
    console.log("[LoginPage] Triggering Google OAuth connection redirect...");
    try {
      throw new Error("Firebase Phone Auth only.");
    } catch (err) {
      handleAuthError(err);
      setIsSubmitting(false);
    }
  };

  // Ripple effect on button tap/click
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    setRipples((prev) => [...prev, newRipple]);
    
    // Auto clear ripple
    setTimeout(() => {
      setRipples((prev) => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  // Parallax transform calculations for floating circles
  const bgCirclesX1 = useTransform(mouseX, [-1, 1], [-25, 25]);
  const bgCirclesY1 = useTransform(mouseY, [-1, 1], [-25, 25]);
  const bgCirclesX2 = useTransform(mouseX, [-1, 1], [30, -30]);
  const bgCirclesY2 = useTransform(mouseY, [-1, 1], [-15, 15]);

  // Antigravity drift translation based on mouse pointer position
  const cardParallaxX = useTransform(mouseX, [-1, 1], [-18, 18]);
  const cardParallaxY = useTransform(mouseY, [-1, 1], [-18, 18]);
  const cardParallaxXSpring = useSpring(cardParallaxX, { stiffness: 120, damping: 25 });
  const cardParallaxYSpring = useSpring(cardParallaxY, { stiffness: 120, damping: 25 });

  // Get current form header titles dynamically
  const getHeaderInfo = () => {
    switch (authMode) {
      case "password-login":
        return { title: "Welcome Back", sub: "Sign in using your account password." };
      case "signup":
        return { title: "Register Account", sub: "Join the Krishi cooperative network." };
      case "forgot-password":
        return { title: "Reset Password", sub: "Enter your registered email below." };
      case "otp-login":
      default:
        return { title: "Welcome Back", sub: "Sign in using a secure one-time passcode." };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans select-none antialiased px-4 py-8"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* Dynamic Toast Notification popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold font-sans ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-emerald-500/5" 
                : toast.type === "error"
                  ? "bg-red-50 border-red-100 text-red-900 shadow-red-500/5"
                  : "bg-blue-50 border-blue-100 text-blue-900 shadow-blue-500/5"
            }`}
          >
            {toast.type === "success" && <Check size={16} className="text-emerald-600 shrink-0" />}
            {toast.type === "error" && <ShieldAlert size={16} className="text-red-600 shrink-0 animate-bounce" />}
            {toast.type === "info" && <Loader2 size={16} className="text-blue-600 shrink-0 animate-spin" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ANTIGRAVITY INTERACTIVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle animated light noise overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Dynamic Light Radial Gradients */}
        <div 
          className="absolute inset-0 opacity-40 transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, rgba(248, 250, 252, 0) 70%)"
          }}
        />

        {/* Parallax Floating Ambient Circles */}
        <motion.div 
          style={{ 
            x: bgCirclesX1, 
            y: bgCirclesY1,
            background: "radial-gradient(circle, #2563EB 0%, rgba(37, 99, 235, 0) 75%)"
          }}
          className="absolute -top-[10%] -left-[5%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-[0.12] mix-blend-multiply pointer-events-none"
        />
        <motion.div 
          style={{ 
            x: bgCirclesX2, 
            y: bgCirclesY2,
            background: "radial-gradient(circle, #3B82F6 0%, rgba(59, 130, 246, 0) 75%)"
          }}
          className="absolute -bottom-[15%] -right-[5%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-[0.14] mix-blend-multiply pointer-events-none"
        />

        {/* Floating Translucent Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{
              opacity: [0.15, 0.45, 0.15],
              scale: [1, 1.25, 1],
              y: [0, -120, 0],
              x: [0, Math.sin(p.id) * 30, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              boxShadow: "0 0 10px 1px rgba(37, 99, 235, 0.05)",
            }}
          />
        ))}
      </div>

      {/* 2. CUSTOM FLOATING GLOWING CURSOR (DESKTOP ONLY) */}
      {!isTouchDevice && isCursorActive && (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-50 overflow-visible">
          {/* Inner Glowing Core Dot */}
          <motion.div
            style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
            className="w-2.5 h-2.5 rounded-full bg-blue-600 fixed pointer-events-none z-50 shadow-[0_0_12px_rgba(37,99,235,0.7)]"
          />
          {/* Dynamic Outer Ring */}
          <motion.div
            style={{ 
              x: cursorX, 
              y: cursorY, 
              translateX: "-50%", 
              translateY: "-50%",
              scale: cursorRingScale
            }}
            animate={{
              borderColor: isHoveringClickable ? "rgba(37, 99, 235, 0.6)" : "rgba(37, 99, 235, 0.25)",
              borderWidth: isHoveringClickable ? "1.5px" : "1px",
              backgroundColor: isHoveringClickable ? "rgba(37, 99, 235, 0.06)" : "rgba(37, 99, 235, 0)"
            }}
            transition={{ duration: 0.15 }}
            className="w-7 h-7 rounded-full fixed pointer-events-none z-50 border border-solid"
          />
        </div>
      )}

      {/* 3. CENTERED LOGIN CARD CONTAINER */}
      <div className="w-full max-w-[460px] z-10 relative flex flex-col items-center">
        
        {/* ENTRANCE FADE & BLUR REVEAL SLIDE-IN SEQUENCE */}
        <motion.div
          initial={{ opacity: 0, y: 35, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 18,
            mass: 0.9,
            delay: 0.1 
          }}
          className="w-full flex flex-col"
        >
          {/* Antigravity floating wrapper responsive to pointer */}
          <motion.div
            style={{
              x: cardParallaxXSpring,
              y: cardParallaxYSpring,
            }}
            className="w-full flex flex-col"
          >
            {/* Interactive Card with 3D Tilt */}
            <motion.div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                rotateX: cardXSpring,
                rotateY: cardYSpring,
                transformStyle: "preserve-3d"
              }}
              whileHover={{ 
                y: -15,
                scale: 1.01,
                rotateX: 2,
                boxShadow: "0 50px 100px -20px rgba(37, 99, 235, 0.25), 0 0 80px rgba(37, 99, 235, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.8 }}
              className="w-full bg-white/85 backdrop-blur-xl border border-[rgba(0,0,0,0.08)] rounded-[24px] px-6 sm:px-10 py-10 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.06)] flex flex-col relative overflow-hidden text-center select-none"
            >
              {/* Ambient Card Cursor-Following Spot-Light Reflection */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle 180px at ${cardLightX}% ${cardLightY}%, rgba(37, 99, 235, 0.04) 0%, rgba(255, 255, 255, 0) 100%)`,
                }}
              />

              {/* Logo Section */}
              <div className="flex flex-col items-center relative z-10 mb-6">
                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  className="w-20 h-20 rounded-full bg-slate-950 shadow-xl border border-emerald-900/40 flex items-center justify-center relative cursor-pointer group p-1 overflow-hidden"
                >
                  {/* Micro-sparkle glow */}
                  <span className="absolute inset-0 rounded-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <img
                    src="/logo.jpeg"
                    alt="Your Schemes Logo"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    className="w-full h-full object-contain rounded-full"
                  />
                </motion.div>

                <h1 className="text-2xl font-bold text-[#0F172A] mt-5 tracking-tight font-display">
                  {headerInfo.title}
                </h1>
                <p className="text-xs text-[#64748B] mt-1.5 font-medium">
                  {headerInfo.sub}
                </p>
              </div>

              {/* Environment Placeholder Warning Banner */}
              {isPlaceholder && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-left text-[10px] leading-relaxed">
                  <div className="font-bold flex items-center gap-1 mb-1 text-amber-700">
                    <ShieldAlert size={13} /> Supabase Configuration Required
                  </div>
                  Authentication is ready, but your project is still using placeholders. Replace <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your <code>.env</code> file to enable real email OTPs and Google OAuth.
                </div>
              )}

              {/* Error Message display block */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border border-red-100 text-red-900 rounded-xl flex items-center gap-2 text-left"
                  >
                    <ShieldAlert size={16} className="text-red-600 shrink-0 animate-bounce" />
                    <span className="text-[11px] font-bold tracking-tight">{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* -------------------- FORMS -------------------- */}

              {/* OTP LOGIN MODE */}
              {authMode === "otp-login" && (
                loginStep === "credentials" ? (
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4 relative z-10 text-left">
                    
                    {/* Field 1: Username */}
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                        <User size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting || isSuccess}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setUsernameTouched(true)}
                        placeholder=" "
                        id="username-input"
                        className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                      />
                      <label 
                        htmlFor="username-input"
                        className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                          peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                          peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                      >
                        Username
                      </label>
                      
                      {/* Status Indicator */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {usernameTouched && username.trim() !== "" && (
                          isUsernameValid ? (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                              <Check size={16} strokeWidth={3} />
                            </motion.span>
                          ) : (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Too short">
                              <ShieldAlert size={16} />
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Field 2: Email */}
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                        <Mail size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                      <input
                        type="email"
                        required
                        disabled={isSubmitting || isSuccess}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder=" "
                        id="email-input"
                        className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                      />
                      <label 
                        htmlFor="email-input"
                        className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                          peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                          peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                      >
                        Email Address
                      </label>

                      {/* Status Indicator */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {emailTouched && email !== "" && (
                          isEmailValid ? (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                              <Check size={16} strokeWidth={3} />
                            </motion.span>
                          ) : (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Valid email required">
                              <ShieldAlert size={16} />
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center text-[11px] font-semibold select-none pt-1">
                      <label className="flex items-center gap-2 text-[#64748B] cursor-pointer hover:text-[#0F172A] transition">
                        <input
                          type="checkbox"
                          disabled={isSubmitting || isSuccess}
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition disabled:opacity-60"
                        />
                        <span>Remember Me</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="relative pt-1">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        onMouseDown={handleButtonPress}
                        whileHover={(!isSubmitting && !isSuccess) ? { 
                          scale: 1.02,
                          boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2)"
                        } : {}}
                        whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.98 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-80"
                      >
                        {ripples.map(r => (
                          <span 
                            key={r.id}
                            className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                            style={{ left: r.x, top: r.y, width: 100, height: 100, transform: "translate(-50%, -50%)" }}
                          />
                        ))}

                        <div className="flex items-center gap-1.5 relative z-10 font-display">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending OTP...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification OTP</span>
                              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>

                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4 relative z-10 text-left">
                    
                    {/* OTP Alert */}
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-sm">mail</span>
                      <span className="text-[11px] font-semibold">Verification OTP has been sent to {email}</span>
                    </div>

                    {/* OTP Input */}
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                        <span className="material-symbols-outlined text-base">pin</span>
                      </span>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting || isSuccess}
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setOtpCode(val.slice(0, 6));
                        }}
                        onBlur={() => setOtpTouched(true)}
                        placeholder=" "
                        id="otp-input"
                        className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] tracking-[1em] text-center font-bold transition-all disabled:opacity-60"
                      />
                      <label 
                        htmlFor="otp-input"
                        className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                          peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                          peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                      >
                        Enter 6-Digit OTP
                      </label>
                      
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {otpTouched && otpCode !== "" && (
                          otpCode.length === 6 ? (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                              <Check size={16} strokeWidth={3} />
                            </motion.span>
                          ) : (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Incorrect code">
                              <ShieldAlert size={16} />
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>

                    {otpError && (
                      <p className="text-[#EF4444] text-[10px] font-bold uppercase tracking-wider">
                        Incorrect OTP code. Please try again.
                      </p>
                    )}

                    {/* Submit Button */}
                    <div className="relative pt-1">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        onMouseDown={handleButtonPress}
                        whileHover={(!isSubmitting && !isSuccess) ? { 
                          scale: 1.02,
                          boxShadow: "0 10px 20px -5px rgba(34, 197, 94, 0.4), 0 0 12px rgba(34, 197, 94, 0.2)"
                        } : {}}
                        whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.98 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="w-full h-12 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-80"
                      >
                        {ripples.map(r => (
                          <span 
                            key={r.id}
                            className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                            style={{ left: r.x, top: r.y, width: 100, height: 100, transform: "translate(-50%, -50%)" }}
                          />
                        ))}

                        <div className="flex items-center gap-1.5 relative z-10 font-display">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying OTP...</span>
                            </>
                          ) : isSuccess ? (
                            <>
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </motion.div>
                              <span>Success! Entering...</span>
                            </>
                          ) : (
                            <>
                              <span>Verify OTP & Sign In</span>
                              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setLoginStep("credentials");
                          setOtpCode("");
                          setOtpError(false);
                          setOtpTouched(false);
                          setErrorMsg(null);
                        }}
                        className="text-xs text-blue-600 hover:underline font-bold bg-transparent border-none cursor-pointer disabled:opacity-60"
                      >
                        Change email address or edit username
                      </button>
                    </div>

                  </form>
                )
              )}

              {/* PASSWORD LOGIN MODE */}
              {authMode === "password-login" && (
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4 relative z-10 text-left">
                  
                  {/* Email */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Mail size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="email"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder=" "
                      id="email-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="email-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Email Address
                    </label>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {emailTouched && email !== "" && (
                        isEmailValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Valid email required">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Lock size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="password"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      placeholder=" "
                      id="password-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="password-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Password
                    </label>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {passwordTouched && password !== "" && (
                        isPasswordValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="At least 6 characters">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Extras */}
                  <div className="flex justify-between items-center text-[11px] font-semibold select-none pt-1">
                    <label className="flex items-center gap-2 text-[#64748B] cursor-pointer hover:text-[#0F172A] transition">
                      <input
                        type="checkbox"
                        disabled={isSubmitting || isSuccess}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition disabled:opacity-60"
                      />
                      <span>Remember Me</span>
                    </label>
                    
                    <button 
                      type="button" 
                      disabled={isSubmitting}
                      onClick={() => { setAuthMode("forgot-password"); setErrorMsg(null); }}
                      className="text-blue-600 hover:text-blue-500 hover:underline bg-transparent border-none cursor-pointer transition font-bold disabled:opacity-60"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="relative pt-1">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      onMouseDown={handleButtonPress}
                      whileHover={(!isSubmitting && !isSuccess) ? { 
                        scale: 1.02,
                        boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2)"
                      } : {}}
                      whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-80"
                    >
                      {ripples.map(r => (
                        <span 
                          key={r.id}
                          className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                          style={{ left: r.x, top: r.y, width: 100, height: 100, transform: "translate(-50%, -50%)" }}
                        />
                      ))}

                      <div className="flex items-center gap-1.5 relative z-10 font-display">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                            <span>Success! Entering...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>

                </form>
              )}

              {/* SIGN UP MODE */}
              {authMode === "signup" && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4 relative z-10 text-left">
                  
                  {/* Username */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <User size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => setUsernameTouched(true)}
                      placeholder=" "
                      id="username-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="username-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Username
                    </label>
                    
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {usernameTouched && username.trim() !== "" && (
                        isUsernameValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Too short">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Mail size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="email"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder=" "
                      id="email-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="email-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Email Address
                    </label>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {emailTouched && email !== "" && (
                        isEmailValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Valid email required">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Lock size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="password"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      placeholder=" "
                      id="password-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="password-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Password
                    </label>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {passwordTouched && password !== "" && (
                        isPasswordValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="At least 6 characters">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative pt-1">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      onMouseDown={handleButtonPress}
                      whileHover={(!isSubmitting && !isSuccess) ? { 
                        scale: 1.02,
                        boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2)"
                      } : {}}
                      whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-80"
                    >
                      {ripples.map(r => (
                        <span 
                          key={r.id}
                          className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                          style={{ left: r.x, top: r.y, width: 100, height: 100, transform: "translate(-50%, -50%)" }}
                        />
                      ))}

                      <div className="flex items-center gap-1.5 relative z-10 font-display">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Register</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>

                </form>
              )}

              {/* FORGOT PASSWORD MODE */}
              {authMode === "forgot-password" && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 relative z-10 text-left">
                  
                  {/* Email */}
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Mail size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="email"
                      required
                      disabled={isSubmitting || isSuccess}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder=" "
                      id="email-input"
                      className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium disabled:opacity-60"
                    />
                    <label 
                      htmlFor="email-input"
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Email Address
                    </label>

                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {emailTouched && email !== "" && (
                        isEmailValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="Valid email required">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative pt-1">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      onMouseDown={handleButtonPress}
                      whileHover={(!isSubmitting && !isSuccess) ? { 
                        scale: 1.02,
                        boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2)"
                      } : {}}
                      whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-80"
                    >
                      {ripples.map(r => (
                        <span 
                          key={r.id}
                          className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                          style={{ left: r.x, top: r.y, width: 100, height: 100, transform: "translate(-50%, -50%)" }}
                        />
                      ))}

                      <div className="flex items-center gap-1.5 relative z-10 font-display">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Requesting Link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Recovery Link</span>
                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>

                </form>
              )}

              {/* GOOGLE OAUTH DIVIDER & BUTTON */}
              {authMode !== "reset-password" && loginStep === "credentials" && (
                <div className="relative z-10 flex flex-col items-center mt-5">
                  <div className="flex items-center w-full my-3">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting || isSuccess}
                    whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-11 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Sign In with Google</span>
                  </motion.button>
                </div>
              )}

              {/* Bottom Actions Links with expanding lines */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 select-none relative z-10 text-[11px] font-bold text-[#64748B]">
                
                {/* Secondary Toggles */}
                <div className="flex justify-between items-center w-full text-left">
                  {authMode === "otp-login" ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span>New here?</span>
                        <button 
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => { setAuthMode("signup"); setLoginStep("credentials"); setErrorMsg(null); }}
                          className="text-blue-600 hover:text-blue-500 transition relative bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                        >
                          Register
                        </button>
                      </div>

                      <button 
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => { setAuthMode("password-login"); setLoginStep("credentials"); setErrorMsg(null); }}
                        className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                      >
                        Use Password
                      </button>
                    </>
                  ) : authMode === "password-login" ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span>New here?</span>
                        <button 
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => { setAuthMode("signup"); setErrorMsg(null); }}
                          className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                        >
                          Register
                        </button>
                      </div>

                      <button 
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => { setAuthMode("otp-login"); setLoginStep("credentials"); setErrorMsg(null); }}
                        className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                      >
                        Use OTP Login
                      </button>
                    </>
                  ) : authMode === "signup" ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span>Have an account?</span>
                        <button 
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => { setAuthMode("password-login"); setErrorMsg(null); }}
                          className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                        >
                          Login
                        </button>
                      </div>

                      <button 
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => { setAuthMode("otp-login"); setLoginStep("credentials"); setErrorMsg(null); }}
                        className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                      >
                        Use OTP Login
                      </button>
                    </>
                  ) : authMode === "forgot-password" ? (
                    <div className="flex justify-center w-full">
                      <button 
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => { setAuthMode("password-login"); setErrorMsg(null); }}
                        className="text-blue-600 hover:text-blue-500 transition bg-transparent border-none cursor-pointer p-0 font-bold disabled:opacity-60"
                      >
                        Back to Password Login
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center w-full">
                      <span className="text-[10px] text-slate-400">Updating secure ledger credentials...</span>
                    </div>
                  )}
                </div>

                {/* Guest access option */}
                {authMode !== "reset-password" && loginStep === "credentials" && (
                  <div className="flex justify-end w-full pt-1">
                    <a 
                      href="#"
                      onClick={(e) => { e.preventDefault(); onLoginSuccess("Guest Farmer", "guest@krishisahay.in"); }}
                      className="text-[#0F172A] hover:text-blue-600 transition flex items-center gap-1 relative group"
                    >
                      <span>Enter as Guest</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#0F172A] hover:bg-blue-600 transition-all group-hover:w-full group-hover:left-0 duration-300" />
                    </a>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer Credit */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] text-[#64748B] text-center mt-6 font-medium tracking-wide flex items-center gap-1"
        >
          <Globe size={11} /> Secured by Krishi Cooperative Ledger
        </motion.p>

      </div>
    </div>
  );
}
