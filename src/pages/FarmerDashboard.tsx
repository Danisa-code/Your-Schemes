import React, { useState, useEffect } from "react";
import { FarmerUser, authApi } from "../services/authApi";
import { User, Mail, Phone, MapPin, Globe, Shield, LogOut, Sprout, TrendingUp, Bookmark, Bell, Activity, Sun, FileText, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface FarmerDashboardProps {
  user: FarmerUser | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ user, onLogout, onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<FarmerUser | null>(user);

  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem("farmer_user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  const handleLogoutClick = async () => {
    await authApi.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Navigation Banner */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-teal-900/90 border border-emerald-700/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
              <User className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser?.role || "FARMER"}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  {currentUser?.preferredLanguage || "Tamil"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                வணக்கம், {currentUser?.name || "Farmer"}!
              </h1>
              <p className="text-emerald-200/80 text-sm mt-1">
                Welcome to your Tamil Nadu Farmer Portal Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={() => onNavigate("/profile")}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <User className="w-4 h-4 text-emerald-400" />
              Edit Profile
            </button>
            <button
              onClick={handleLogoutClick}
              className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              Logout / வெளியேறு
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-slate-400 text-xs font-medium">Eligible TN Schemes</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-700/50 flex items-center justify-center text-teal-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">₹ 2,450/q</div>
              <div className="text-slate-400 text-xs font-medium">Paddy Mandi Rate (Coimbatore)</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-slate-400 text-xs font-medium">Saved Schemes</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">31°C</div>
              <div className="text-slate-400 text-xs font-medium">Weather: Partly Cloudy</div>
            </div>
          </div>
        </div>

        {/* Profile Info Details & Quick Links Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registered Farmer Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Farmer Profile Details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 w-24">Name:</span>
                <span className="font-semibold text-slate-100">{currentUser?.name || "Not updated"}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 w-24">Email:</span>
                <span className="font-semibold text-slate-100">{currentUser?.email || "N/A"}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 w-24">Mobile:</span>
                <span className="font-semibold text-slate-100">{currentUser?.mobileNumber || "Not provided"}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 w-24">Location:</span>
                <span className="font-semibold text-slate-100">
                  {[currentUser?.village, currentUser?.taluk, currentUser?.district, currentUser?.state].filter(Boolean).join(", ") || "Tamil Nadu"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-500 w-24">Language:</span>
                <span className="font-semibold text-emerald-400">{currentUser?.preferredLanguage || "Tamil"}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("/profile")}
              className="w-full mt-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Update Registration Details
            </button>
          </div>

          {/* Feature Quick Navigation Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate("/schemes")}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <FileText className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition">
                Government Schemes / அரசு திட்டங்கள்
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Explore Kalaignarin All Village Integrated Agriculture Development Program, PM-KISAN, and Subsidy schemes.
              </p>
            </div>

            <div
              onClick={() => onNavigate("/mandi-prices")}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 cursor-pointer transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-700/50 flex items-center justify-center text-teal-400 group-hover:scale-110 transition">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 transition" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-300 transition">
                Live Mandi Prices / சந்தை விலை நிலவரம்
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Real-time crop arrival and daily market commodity price trends across Tamil Nadu mandis.
              </p>
            </div>

            <div
              onClick={() => onNavigate("/crops")}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 cursor-pointer transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Sprout className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition">
                Crop Health & Scanner / பயிர் நோய் பரிசோதனை
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                AI powered crop leaf diagnostics and fertilizer recommendations.
              </p>
            </div>

            <div
              onClick={() => onNavigate("/community")}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 cursor-pointer transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Activity className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                Farmer Community Forum / விவசாயிகள் சங்கம்
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect with local agriculture officers, share knowledge, and discuss crop management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
