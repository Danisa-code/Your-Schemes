import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { User, Phone, Check, ShieldAlert, ArrowRight, Loader2, Compass, Globe } from "lucide-react";

// Country list for selector
const COUNTRIES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
];

export function LoginPage({ onBackToHome }: { onBackToHome: () => void }) {
  // Form state
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Interaction/status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

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
  const isPhoneValid = /^\d{10}$/.test(phone);
  const isFormValid = isUsernameValid && isPhoneValid;

  // Handle Form Submission with beautiful loading & success transitions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameTouched(true);
    setPhoneTouched(true);

    if (!isFormValid || isSubmitting || isSuccess) return;

    setIsSubmitting(true);

    // Simulate luxury premium API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Navigate or execute callback on success
      setTimeout(() => {
        onBackToHome();
      }, 1600);
    }, 2000);
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

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans select-none antialiased px-4 py-8"
      style={{ backgroundColor: "#F8FAFC" }}
    >
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
              y: -20,
              scale: 1.02,
              rotateX: 2,
              boxShadow: "0 50px 100px -20px rgba(37, 99, 235, 0.3), 0 0 80px rgba(37, 99, 235, 0.2)"
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
            <div className="flex flex-col items-center relative z-10 mb-8">
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
                Welcome Back
              </h1>
              <p className="text-xs text-[#64748B] mt-1.5 font-medium">
                Sign in to continue to your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10 text-left">
              
              {/* Field 1: Username */}
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                  <User size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder=" "
                  id="username-input"
                  className="peer w-full h-12 pl-11 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium"
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
                
                {/* Icon Check / Error */}
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

              {/* Field 2: Phone Number with Country Selector */}
              <div className="space-y-1.5 relative">
                <div className="flex gap-2">
                  {/* Custom Country Selector */}
                  <div className="relative shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 px-3 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium appearance-none cursor-pointer flex items-center gap-1"
                      aria-label="Country Code"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#64748B] pointer-events-none">
                      expand_more
                    </span>
                  </div>

                  {/* Input Code */}
                  <div className="relative flex-1 group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-600 transition-colors duration-300">
                      <Phone size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        // number only mask
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val.slice(0, 10));
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder=" "
                      id="phone-input"
                      className="peer w-full h-12 pl-10 pr-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-[#0F172A] transition-all font-medium"
                    />
                    <label 
                      htmlFor="phone-input"
                      className="absolute left-10 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none transition-all duration-300 origin-left
                        peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/4
                        peer-focus:top-2 peer-focus:scale-[0.82] peer-focus:text-blue-600
                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.82]"
                    >
                      Phone Number
                    </label>

                    {/* Icon Status Check */}
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {phoneTouched && phone !== "" && (
                        isPhoneValid ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#22C55E]">
                            <Check size={16} strokeWidth={3} />
                          </motion.span>
                        ) : (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#EF4444]" title="10 digits required">
                            <ShieldAlert size={16} />
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password Options */}
              <div className="flex justify-between items-center text-[11px] font-semibold select-none pt-1">
                <label className="flex items-center gap-2 text-[#64748B] cursor-pointer hover:text-[#0F172A] transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
                  />
                  <span>Remember Me</span>
                </label>
                
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("We will assist with phone-recovery via registered cooperative agencies."); }}
                  className="text-blue-600 hover:text-blue-500 hover:underline transition"
                >
                  Forgot Phone Number?
                </a>
              </div>

              {/* Submit Button */}
              <div className="relative pt-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  onMouseDown={handleButtonPress}
                  whileHover={(!isSubmitting && !isSuccess) ? { 
                    scale: 1.03,
                    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4), 0 0 12px rgba(37, 99, 235, 0.2)"
                  } : {}}
                  whileTap={(!isSubmitting && !isSuccess) ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-md shadow-blue-500/10 flex items-center justify-center relative overflow-hidden group border-none cursor-pointer disabled:opacity-90"
                >
                  {/* Light Sweep animation */}
                  <span className="absolute top-0 -inset-full h-full w-1/2 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep pointer-events-none" />

                  {/* Render Ripples */}
                  {ripples.map(r => (
                    <span 
                      key={r.id}
                      className="absolute rounded-full bg-white/25 animate-ripple pointer-events-none"
                      style={{
                        left: r.x,
                        top: r.y,
                        width: 100,
                        height: 100,
                        transform: "translate(-50%, -50%)"
                      }}
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
                        <span>Success! Loading...</span>
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

            {/* Bottom Actions Links with expanding lines */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold relative z-10 text-[#64748B]">
              <div className="flex items-center gap-1">
                <span>New here?</span>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Cooperative registration is active through local Panchayat offices!"); }}
                  className="text-blue-600 hover:text-blue-500 transition relative group"
                >
                  Register
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full group-hover:left-0 duration-300" />
                </a>
              </div>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); onBackToHome(); }}
                className="text-[#0F172A] hover:text-blue-600 transition flex items-center gap-1 relative group"
              >
                <span>Back to Home</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#0F172A] hover:bg-blue-600 transition-all group-hover:w-full group-hover:left-0 duration-300" />
              </a>
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
