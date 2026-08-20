import React from "react";
import { Scheme, LanguageCode } from "../types";
import { TRANSLATIONS } from "../translations";
import { X, ExternalLink, ShieldCheck, Building2, FileText, CheckCircle2, Calendar, MapPin, AlertCircle, Info } from "lucide-react";
import { motion } from "motion/react";

interface SchemeDetailModalProps {
  scheme: Scheme;
  lang: LanguageCode;
  onClose: () => void;
  onApply: (scheme: Scheme) => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  lang,
  onClose,
  onApply,
}) => {
  const isTa = lang === "ta";
  const t = TRANSLATIONS[lang];

  // Helper to format ISO date string to DD/MM/YYYY
  const formatVerifiedDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatVerifiedDate(scheme.last_verified_date);

  const handleApplyClick = () => {
    if (scheme.verification_status === "VERIFIED" && scheme.official_application_url) {
      onApply(scheme);
      return;
    }

    if (scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE" || !scheme.official_application_url) {
      if (scheme.official_info_url) {
        window.open(scheme.official_info_url, "_blank", "noopener,noreferrer");
        return;
      }
      alert(
        isTa
          ? "இந்த திட்டத்திற்கு ஆன்லைன் விண்ணப்ப வசதி இல்லை.\nவிண்ணப்பிக்க அருகிலுள்ள வேளாண்மை அலுவலகத்தை அணுகவும்."
          : "Online application is not available for this scheme.\nPlease contact your nearest Agriculture Department office."
      );
      return;
    }

    alert(
      isTa
        ? "அதிகாரப்பூர்வ விண்ணப்ப இணைப்பு தற்போது கிடைக்கவில்லை."
        : "Official application link is currently unavailable."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative text-left my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Government Level Badge */}
          <span className="px-3 py-1 text-[10px] uppercase font-extrabold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            {scheme.government_level === "TAMIL_NADU"
              ? (isTa ? "தமிழ்நாடு அரசு" : "Tamil Nadu Govt")
              : scheme.government_level === "CENTRAL"
              ? (isTa ? "மத்திய அரசு" : "Central Govt")
              : (isTa ? "மத்திய & மாநில அரசு" : "Central & State Govt")}
          </span>

          {/* Verification Badge */}
          {scheme.verification_status === "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isTa ? "🟢 அதிகாரப்பூர்வ அரசு இணையதளம்" : "🟢 Official Government Website"}</span>
            </span>
          )}

          {scheme.verification_status === "OFFLINE" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{isTa ? "நேரடி அலுவலக விண்ணப்பம்" : "Offline / In-Person Application"}</span>
            </span>
          )}
        </div>

        {/* Title & Tamil Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
          {scheme.title}
        </h2>
        {scheme.name_ta && (
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm md:text-base mt-1">
            {scheme.name_ta}
          </p>
        )}

        {/* Responsible Department */}
        {scheme.department && (
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{scheme.department}</span>
          </div>
        )}

        {/* Description */}
        <div className="my-5 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>{isTa && scheme.description_ta ? scheme.description_ta : scheme.description}</p>
        </div>

        {/* Details Grid: Eligibility & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* Eligibility Box */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.schemeEligibility || "Eligibility"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {isTa && scheme.eligibility_ta ? scheme.eligibility_ta : (scheme.eligibility_en || scheme.criteria)}
            </p>
          </div>

          {/* Benefits Box */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.schemeBenefits || "Benefits"}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {isTa && scheme.benefits_ta ? scheme.benefits_ta : (scheme.benefits_en || scheme.benefit)}
            </p>
          </div>
        </div>

        {/* Required Documents */}
        {((scheme.documents_ta && scheme.documents_ta.length > 0) || (scheme.documents && scheme.documents.length > 0)) && (
          <div className="my-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>{t.schemeDocuments || "Required Documents"}</span>
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {(isTa && scheme.documents_ta ? scheme.documents_ta : scheme.documents || []).map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* OFFLINE SCHEME NOTICE (Section 11) */}
        {scheme.application_type === "OFFLINE" && (
          <div className="my-5 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm space-y-1">
                <p className="font-bold">
                  {isTa
                    ? "இந்த திட்டத்திற்கு ஆன்லைன் விண்ணப்ப வசதி இல்லை."
                    : "Online application is not available for this scheme."}
                </p>
                <p className="opacity-90">
                  {isTa
                    ? "விண்ணப்பிக்க அருகிலுள்ள வேளாண்மை அலுவலகத்தை அணுகவும்."
                    : "Please contact your nearest Agriculture Department office."}
                </p>
              </div>
            </div>
            {scheme.official_info_url && (
              <div className="pt-2 flex justify-end">
                <a
                  href={scheme.official_info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-xl text-xs font-bold transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.findNearbyOffice || "Find Nearby Agriculture Office"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Verification Status & Date Footer Row */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            {scheme.verification_status === "VERIFIED" && (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isTa ? "🟢 அதிகாரப்பூர்வ அரசு இணையதளம்" : "🟢 Official Government Website"}</span>
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{isTa ? `கடைசியாக சரிபார்க்கப்பட்டது: ${formattedDate}` : `Last verified: ${formattedDate}`}</span>
              </span>
            )}
          </div>

          {/* Official Info Page Link */}
          {scheme.official_info_url && (
            <a
              href={scheme.official_info_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{isTa ? "அதிகாரப்பூர்வ தகவல் பக்கம் ↗" : "Read Official Scheme Info ↗"}</span>
            </a>
          )}
        </div>

        {/* Primary Action Button (Section 5 & 11) */}
        <div className="mt-6">
          <button
            onClick={handleApplyClick}
            className={`w-full py-4 rounded-2xl text-xs md:text-sm font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE"
                ? "bg-amber-700 hover:bg-amber-800 text-white"
                : "bg-[#0F5238] hover:bg-emerald-800 text-white"
            }`}
          >
            <span>
              {scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE"
                ? (isTa ? "அருகிலுள்ள வேளாண்மை அலுவலகத்தைக் கண்டறியவும் ↗" : "Find Nearby Agriculture Office ↗")
                : (isTa ? "அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பிக்கவும் ↗" : "Apply on Official Government Website ↗")}
            </span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
