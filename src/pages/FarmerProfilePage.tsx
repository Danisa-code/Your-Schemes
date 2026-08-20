import React, { useState, useEffect } from "react";
import { FarmerUser, FarmerProfileData, authApi } from "../services/authApi";
import { User, Mail, Phone, MapPin, Globe, Check, AlertCircle, RefreshCw, ArrowLeft, Shield } from "lucide-react";

interface FarmerProfilePageProps {
  user: FarmerUser | null;
  onProfileUpdated: (user: FarmerUser) => void;
  onBack: () => void;
}

export const FarmerProfilePage: React.FC<FarmerProfilePageProps> = ({ user, onProfileUpdated, onBack }) => {
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || "");
  const [stateName, setStateName] = useState(user?.state || "Tamil Nadu");
  const [district, setDistrict] = useState(user?.district || "Coimbatore");
  const [taluk, setTaluk] = useState(user?.taluk || "");
  const [village, setVillage] = useState(user?.village || "");
  const [preferredLanguage, setPreferredLanguage] = useState<"Tamil" | "English" | "Telugu" | "Kannada" | "Hindi">(
    (user?.preferredLanguage as any) || "Tamil"
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setMobileNumber(user.mobileNumber || "");
      setStateName(user.state || "Tamil Nadu");
      setDistrict(user.district || "Coimbatore");
      setTaluk(user.taluk || "");
      setVillage(user.village || "");
      if (user.preferredLanguage) {
        setPreferredLanguage(user.preferredLanguage as any);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("பெயரை உள்ளிடவும். / Please enter your name.");
      return;
    }
    if (!district.trim()) {
      setErrorMessage("மாவட்டத்தை தேர்வு செய்யவும்.");
      return;
    }
    if (!taluk.trim()) {
      setErrorMessage("வட்டத்தை உள்ளிடவும்.");
      return;
    }
    if (!village.trim()) {
      setErrorMessage("கிராமத்தை உள்ளிடவும்.");
      return;
    }

    setLoading(true);
    try {
      const data: FarmerProfileData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber.trim(),
        state: stateName,
        district: district.trim(),
        taluk: taluk.trim(),
        village: village.trim(),
        preferredLanguage,
      };

      const updated = await authApi.saveProfile(data);
      setSuccessMessage("சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது! / Profile updated successfully!");
      onProfileUpdated(updated);
    } catch (err: any) {
      setErrorMessage(err.message || "சுயவிவரத்தை புதுப்பிக்க முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Dashboard
        </button>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Farmer Profile Management</h1>
              <p className="text-slate-400 text-xs mt-0.5">
                தமிழ்நாடு விவசாயிகள் விவரங்கள் மற்றும் மொழி விருப்பத்தேர்வுகள்
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-600/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Name / பெயர் *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address / மின்னஞ்சல்
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 rounded-xl py-2.5 pl-9 pr-3 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mobile Number (Optional) / தொலைபேசி எண்
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  State / மாநிலம்
                </label>
                <input
                  type="text"
                  readOnly
                  value={stateName}
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 rounded-xl py-2.5 px-3 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  District / மாவட்டம் *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {["Coimbatore", "Erode", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli", "Tirunelveli", "Vellore"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Taluk / வட்டம் *
                </label>
                <input
                  type="text"
                  required
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Village / கிராமம் *
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Preferred Language / விருப்பமான மொழி *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tamil">Tamil (தமிழ்) - Default</option>
                  <option value="English">English</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Kannada">Kannada (கன்னடம் / ಕನ್ನಡ)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-6"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes / மாற்றங்களைச் சேமி</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
