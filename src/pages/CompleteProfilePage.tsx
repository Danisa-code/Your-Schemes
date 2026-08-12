import React, { useState, useEffect } from "react";
import { authService, FarmerProfile } from "../services/authService";
import { User, MapPin, Globe, Check, AlertCircle, Loader2, Sprout, ArrowRight } from "lucide-react";

interface CompleteProfilePageProps {
  authUserId: string;
  userPhone: string;
  onProfileComplete: (profile: FarmerProfile) => void;
}

export const CompleteProfilePage: React.FC<CompleteProfilePageProps> = ({
  authUserId,
  userPhone,
  onProfileComplete,
}) => {
  const [lang, setLang] = useState<"ta" | "en">("ta");

  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Coimbatore");
  const [taluk, setTaluk] = useState("");
  const [village, setVillage] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<
    "Tamil" | "English" | "Telugu" | "Kannada" | "Hindi"
  >("Tamil");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tamil Nadu Districts list for easy selection
  const tnDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
    "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
    "Viluppuram", "Virudhunagar"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(
        lang === "ta"
          ? "உங்கள் பெயரை உள்ளிடவும்."
          : "Please enter your name."
      );
      return;
    }
    if (!district.trim()) {
      setErrorMessage(
        lang === "ta"
          ? "மாவட்டத்தை தேர்வு செய்யவும்."
          : "Please select a district."
      );
      return;
    }
    if (!taluk.trim()) {
      setErrorMessage(
        lang === "ta"
          ? "வட்டத்தை உள்ளிடவும்."
          : "Please enter your taluk."
      );
      return;
    }
    if (!village.trim()) {
      setErrorMessage(
        lang === "ta"
          ? "கிராமத்தை உள்ளிடவும்."
          : "Please enter your village."
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.saveFarmerProfile({
        auth_user_id: authUserId,
        name: name.trim(),
        phone: userPhone,
        district: district.trim(),
        taluk: taluk.trim(),
        village: village.trim(),
        preferred_language: preferredLanguage,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        onProfileComplete(data);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === "ta"
            ? "சுயவிவரத்தை சேமிக்க முடியவில்லை."
            : "Could not save profile. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/40 border border-white/10 rounded-full p-0.5">
            <button
              onClick={() => setLang("ta")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                lang === "ta" ? "bg-emerald-500 text-white" : "text-emerald-300 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                lang === "en" ? "bg-emerald-500 text-white" : "text-emerald-300 hover:text-white"
              }`}
            >
              English
            </button>
          </div>

          <div className="w-14 h-14 mx-auto mb-3 bg-slate-950/40 rounded-full flex items-center justify-center border border-emerald-400/30">
            <Sprout className="w-8 h-8 text-emerald-300 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {lang === "ta" ? "விவசாயி சுயவிவரப் பதிவு" : "Complete Farmer Profile"}
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            {lang === "ta"
              ? "உங்கள் விவரங்களை பூர்த்தி செய்து டேஷ்போர்டை அணுகவும்"
              : "Please complete your details to proceed to the Farmer Dashboard"}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {errorMessage && (
            <div className="p-4 bg-rose-950/80 border border-rose-600/50 rounded-2xl text-rose-200 text-xs md:text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Farmer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === "ta" ? "விவசாயி பெயர் *" : "Farmer Name *"}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "ta" ? "உதாரணம்: முருகன்" : "e.g. Rajesh Kumar"}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* District & Taluk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === "ta" ? "மாவட்டம் *" : "District *"}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {tnDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === "ta" ? "வட்டம் *" : "Taluk *"}
              </label>
              <input
                type="text"
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                placeholder={lang === "ta" ? "உதாரணம்: பொள்ளாச்சி" : "e.g. Pollachi"}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Village */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === "ta" ? "கிராமம் *" : "Village *"}
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={lang === "ta" ? "உதாரணம்: சூலூர்" : "e.g. Sulur"}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === "ta" ? "விருப்பமான மொழி *" : "Preferred Language *"}
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {(["Tamil", "English", "Telugu", "Kannada", "Hindi"] as const).map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setPreferredLanguage(l)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition ${
                    preferredLanguage === l
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {l === "Tamil" ? "தமிழ்" : l}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{lang === "ta" ? "சுயவிவரத்தை சேமி" : "Save Profile & Continue"}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
