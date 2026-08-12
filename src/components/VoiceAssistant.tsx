/**
 * VoiceAssistant — A floating, minimizable voice command widget.
 * Sits above the AIChatbot. Tamil-first with multi-language support.
 * Props:
 *   onCommand(text, lang) — called when the user speaks or types a command
 *   aiResponse — the response text from the parent (App.tsx)
 *   voiceStatus — current recognition status
 *   lang — current app language (passed for initial voice lang sync)
 *   onLangChange(lang) — callback when user selects a different language
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export type VoiceLang = "en" | "ta";

interface VoiceAssistantProps {
  onCommand: (text: string, voiceLang: VoiceLang) => void;
  aiResponse?: string;
  voiceStatus?: "idle" | "listening" | "processing";
  lang?: string;
  onLangChange?: (lang: VoiceLang) => void;
}

const LANG_OPTIONS: { value: VoiceLang; label: string; locale: string; flag: string }[] = [
  { value: "ta", label: "தமிழ்", locale: "ta-IN", flag: "🇮🇳" },
  { value: "en", label: "English", locale: "en-IN", flag: "🇬🇧" },
];

const EXAMPLE_COMMANDS: Record<VoiceLang, string[]> = {
  ta: [
    "நெல் சந்தை விலை",
    "என் மாவட்ட திட்டங்கள்",
    "மழை தகவல்",
    "பயிர் நோய் கண்டறி",
    "டிராக்டர் மானியம் காட்டு",
  ],
  en: [
    "Show mandi prices",
    "Open schemes page",
    "Weather update",
    "Detect crop disease",
    "Apply for Kisan Credit Card",
  ],
};

const TITLES: Record<VoiceLang, { title: string; idle: string; listening: string; processing: string; typeHint: string }> = {
  ta: {
    title: "AI குரல் உதவியாளர்",
    idle: "கட்டளை சொல்ல அழுத்தவும்",
    listening: "கேட்கிறேன்...",
    processing: "செயலாக்குகிறேன்...",
    typeHint: "கட்டளை தட்டச்சு செய்யவும்",
  },
  en: {
    title: "AI Voice Assistant",
    idle: "Tap mic to speak",
    listening: "Listening...",
    processing: "Processing...",
    typeHint: "Type a command",
  },
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  aiResponse = "",
  voiceStatus = "idle",
  lang = "ta",
  onLangChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>(() => {
    const appLang = lang as VoiceLang;
    return LANG_OPTIONS.some(o => o.value === appLang) ? appLang : "ta";
  });
  const [localStatus, setLocalStatus] = useState<"idle" | "listening" | "processing">(voiceStatus);
  const [transcript, setTranscript] = useState("");
  const [typedText, setTypedText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external status
  useEffect(() => {
    setLocalStatus(voiceStatus);
  }, [voiceStatus]);

  // Sync voiceLang when lang changes from parent
  useEffect(() => {
    if (lang && LANG_OPTIONS.some(o => o.value === lang)) {
      setVoiceLang(lang as VoiceLang);
    }
  }, [lang]);

  // Build/update speech recognition whenever voiceLang changes
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    // Stop any existing session
    recognitionRef.current?.abort();

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = LANG_OPTIONS.find(o => o.value === voiceLang)?.locale ?? "ta-IN";

    rec.onstart = () => {
      setLocalStatus("listening");
      setMicError(null);
      setTranscript("");
    };

    rec.onerror = (e: any) => {
      console.error("[VoiceAssistant] Recognition error:", e.error);
      setLocalStatus("idle");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError(
          voiceLang === "ta"
            ? "மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது.\n1. URL பட்டியில் பூட்டு ஐகானை கிளிக் செய்யவும்\n2. Microphone → Allow என்பதைத் தேர்ந்தெடுக்கவும்\n3. பக்கத்தை புதுப்பிக்கவும்"
            : "Microphone access denied.\n1. Click the lock icon in the URL bar\n2. Set Microphone → Allow\n3. Refresh the page"
        );
      } else if (e.error === "no-speech") {
        setMicError(voiceLang === "ta" ? "குரல் கண்டறியவில்லை. மீண்டும் முயற்சிக்கவும்." : "No speech detected. Please try again.");
      } else {
        setMicError(voiceLang === "ta" ? "குரல் அங்கீகாரம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : "Speech recognition failed. Please try again.");
      }
    };

    rec.onend = () => {
      setLocalStatus(prev => prev === "listening" ? "idle" : prev);
    };

    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setLocalStatus("processing");
      onCommand(text, voiceLang);
    };

    recognitionRef.current = rec;
  }, [voiceLang, onCommand]);

  const toggleMic = useCallback(() => {
    if (!speechSupported) {
      setMicError(
        voiceLang === "ta"
          ? "உங்கள் உலாவி குரல் அங்கீகாரத்தை ஆதரிக்கவில்லை. Chrome அல்லது Edge பயன்படுத்தவும்."
          : "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (localStatus === "listening") {
      recognitionRef.current?.stop();
    } else {
      setMicError(null);
      setTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("[VoiceAssistant] Start error:", err);
      }
    }
  }, [speechSupported, localStatus, voiceLang]);

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    setTranscript(typedText.trim());
    setLocalStatus("processing");
    onCommand(typedText.trim(), voiceLang);
    setTypedText("");
  };

  const titles = TITLES[voiceLang];

  const statusLabel =
    localStatus === "listening"
      ? titles.listening
      : localStatus === "processing"
      ? titles.processing
      : titles.idle;

  return (
    <div className="fixed bottom-40 right-4 md:right-8 z-50 flex flex-col items-end gap-3">
      {/* Floating Minimized Orb */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 30 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/30 relative"
            style={{
              background: "linear-gradient(135deg, #0F5238 0%, #1a7a52 100%)",
              boxShadow: "0 8px 25px -5px rgba(15, 82, 56, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            }}
            title={titles.title}
            aria-label="Open Voice Assistant"
          >
            <span className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-30 pointer-events-none" />
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {localStatus === "listening" ? "mic" : "mic_none"}
            </span>
            {localStatus === "listening" && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, height: isMinimized ? "56px" : "auto" }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-[310px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: "linear-gradient(160deg, #0a1a12 0%, #0f2c1e 100%)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(15,82,56,0.15)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-white/5 cursor-pointer select-none"
              onClick={() => setIsMinimized(m => !m)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0F5238]/60 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-teal-300 text-lg">mic</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{titles.title}</p>
                  <p className="text-[10px] text-teal-300/60 leading-none mt-0.5">
                    {localStatus === "listening" ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse inline-block" />
                        {titles.listening}
                      </span>
                    ) : localStatus === "processing" ? (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] animate-spin">progress_activity</span>
                        {titles.processing}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full inline-block" />
                        Tamil Nadu Farmers Portal
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setIsMinimized(m => !m)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition cursor-pointer"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isMinimized ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>
                <button
                  onClick={() => { setIsOpen(false); recognitionRef.current?.abort(); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition cursor-pointer"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <div className="p-4 space-y-4">
                {/* Voice Language Selector */}
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    {voiceLang === "ta" ? "குரல் மொழி" : "Voice Language"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {LANG_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setVoiceLang(opt.value);
                          if (onLangChange) {
                            onLangChange(opt.value);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition border cursor-pointer ${
                          voiceLang === opt.value
                            ? "bg-teal-500 text-white border-teal-400"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {opt.flag} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mic Button */}
                <div className="flex flex-col items-center gap-3 py-2">
                  <motion.button
                    onClick={toggleMic}
                    animate={localStatus === "listening" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/30 ${
                      localStatus === "listening"
                        ? "bg-red-500 shadow-red-500/40"
                        : localStatus === "processing"
                        ? "bg-amber-500 shadow-amber-500/30"
                        : "bg-[#0F5238] hover:bg-[#1a7a52] shadow-[#0F5238]/40"
                    }`}
                  >
                    {localStatus === "listening" ? (
                      <>
                        <span className="absolute w-20 h-20 rounded-full bg-red-500/30 animate-ping" />
                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                      </>
                    ) : localStatus === "processing" ? (
                      <span className="material-symbols-outlined text-white text-3xl animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-white text-3xl">mic_none</span>
                    )}
                  </motion.button>
                  <p className="text-xs text-slate-300 font-medium">{statusLabel}</p>
                </div>

                {/* Mic Error */}
                {micError && (
                  <div className="p-3 rounded-xl bg-red-900/30 border border-red-500/20 text-red-300 text-xs whitespace-pre-line">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm shrink-0">error</span>
                      <span>{micError}</span>
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {transcript && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      {voiceLang === "ta" ? "நீங்கள் சொன்னது" : "You said"}
                    </p>
                    <p className="text-sm text-white font-medium">"{transcript}"</p>
                  </div>
                )}

                {/* AI Response */}
                {aiResponse && (
                  <div className="p-3 rounded-xl bg-teal-900/30 border border-teal-500/20">
                    <p className="text-[10px] text-teal-300/70 font-bold uppercase tracking-wider mb-1">
                      {voiceLang === "ta" ? "AI பதில்" : "AI Response"}
                    </p>
                    <p className="text-xs text-teal-200 leading-relaxed">{aiResponse}</p>
                  </div>
                )}

                {/* Example Commands Toggle */}
                <button
                  onClick={() => setShowExamples(s => !s)}
                  className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 transition font-semibold uppercase tracking-wider cursor-pointer"
                >
                  <span>{voiceLang === "ta" ? "உதாரண கட்டளைகள்" : "Example Commands"}</span>
                  <span className="material-symbols-outlined text-sm">
                    {showExamples ? "expand_less" : "expand_more"}
                  </span>
                </button>

                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1.5 overflow-hidden"
                    >
                      {(EXAMPLE_COMMANDS[voiceLang] ?? EXAMPLE_COMMANDS.en).map((cmd, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setTranscript(cmd);
                            setLocalStatus("processing");
                            onCommand(cmd, voiceLang);
                          }}
                          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-teal-800/40 border border-white/10 hover:border-teal-500/30 text-slate-300 hover:text-teal-200 text-[10px] font-medium transition cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Typed Command Input */}
                <form onSubmit={handleTypedSubmit} className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedText}
                    onChange={e => setTypedText(e.target.value)}
                    placeholder={titles.typeHint}
                    className="flex-1 h-9 px-3 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!typedText.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer disabled:opacity-40 bg-teal-600 hover:bg-teal-500 text-white active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
