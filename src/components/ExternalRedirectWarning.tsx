import React from "react";
import { LanguageCode } from "../types";
import { ExternalLink, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { motion } from "motion/react";

interface ExternalRedirectWarningProps {
  url: string;
  schemeTitle: string;
  schemeTitleTa?: string;
  lang: LanguageCode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExternalRedirectWarning: React.FC<ExternalRedirectWarningProps> = ({
  url,
  schemeTitle,
  schemeTitleTa,
  lang,
  onConfirm,
  onCancel,
}) => {
  const isTa = lang === "ta";

  // Extract hostname from URL cleanly
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = url;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              {isTa ? "அதிகாரப்பூர்வ அரசு இணைப்பு" : "Official Government Link"}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mt-0.5">
              {isTa && schemeTitleTa ? schemeTitleTa : schemeTitle}
            </h3>
          </div>
        </div>

        {/* Mandatory Warning Messages */}
        <div className="space-y-3 my-5 p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs md:text-sm leading-relaxed">
              <p className="font-bold">
                {isTa
                  ? "நீங்கள் இப்போது அதிகாரப்பூர்வ அரசு இணையதளத்திற்கு அனுப்பப்பட உள்ளீர்கள்."
                  : "You are being redirected to the official government website."}
              </p>
              <p className="opacity-90">
                {isTa
                  ? "இந்த இணையதளம் YourScheme-ஆல் நிர்வகிக்கப்படவில்லை."
                  : "This website is not operated by YourScheme."}
              </p>
            </div>
          </div>
        </div>

        {/* Verified Target Domain Box */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs mb-6">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isTa ? "இலக்கு இணையதளம்:" : "Target Domain:"}
          </span>
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span>{domain}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            {isTa ? "ரத்து" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 px-4 bg-[#0F5238] hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isTa ? "தொடரவும்" : "Continue"}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
