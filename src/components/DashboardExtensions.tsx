import React, { useState, useEffect } from "react";

export const DashboardExtensions: React.FC<{ lang: string; weatherData?: any }> = ({ lang, weatherData }) => {
  const [selectedVillage, setSelectedVillage] = useState("dindori");

  // Village profile data
  const villageProfiles: Record<string, {
    name: string;
    district: string;
    soilType: string;
    groundwater: string;
    popularCrops: string;
    nearbyMarkets: string;
    irrigationAccess: string;
  }> = {
    dindori: {
      name: "Dindori Block",
      district: "Nashik, Maharashtra",
      soilType: "Clay-Loam / Black Regur (Highly rich in iron & moisture)",
      groundwater: "Good (12 meters below surface, recharging actively)",
      popularCrops: "Wine Grapes, Onions, Soyabean, Wheat",
      nearbyMarkets: "Pimpalgaon APMC (9 km), Nashik APMC (18 km)",
      irrigationAccess: "High (Served by the Kadwa river irrigation canal system)"
    },
    niphad: {
      name: "Niphad Block",
      district: "Nashik, Maharashtra",
      soilType: "Deep Black Fertile Soil (Ideal for sugarcane & wheat)",
      groundwater: "Moderate (18 meters below surface)",
      popularCrops: "Sugarcane, Lasalgaon Red Onions, Grapes, Maize",
      nearbyMarkets: "Lasalgaon APMC (12 km), Niphad APMC (4 km)",
      irrigationAccess: "Very High (Served by the Godavari Left Bank canal)"
    },
    sinnar: {
      name: "Sinnar Block",
      district: "Nashik, Maharashtra",
      soilType: "Red Gravelly / Light Loam (Needs moderate organic manure)",
      groundwater: "Critical (28 meters below surface, water conservation advised)",
      popularCrops: "Pomegranate, Bajra, Maize, Pulses",
      nearbyMarkets: "Sinnar APMC (5 km), Ghoti APMC (24 km)",
      irrigationAccess: "Low (Mainly dependent on seasonal check-dams & rainfed)"
    }
  };

  const currentVillage = villageProfiles[selectedVillage] || villageProfiles.dindori;

  // Alerts list state
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      icon: "error",
      title: "Crop Insurance Deadline Approaching!",
      message: "The application deadline for PM Fasal Bima Yojana (Kharif Season) is July 31, 2026. Submit documents to avoid missing coverage.",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      type: "success",
      icon: "check_circle",
      title: "Solar Pump Allocation Approved",
      message: "Great news! The State DISCOM has allocated 200 new high-efficiency solar pumps with 80% tribal subsidy in Dindori. Check your status.",
      time: "1 day ago",
      unread: true
    },
    {
      id: 3,
      type: "info",
      icon: "info",
      title: "Seed Subsidy Disbursal",
      message: "A government seed subsidy of ₹1,500 per quintal has been directly disbursed to your registered co-op account for Rajesh Patel.",
      time: "3 days ago",
      unread: false
    }
  ]);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
  };

  const [forecastDays, setForecastDays] = useState([
    { day: "Mon", temp: "31°C / 22°C", humidity: "78%", condition: "Partly Cloudy", icon: "partly_cloudy_day", rainChance: "20%" },
    { day: "Tue", temp: "30°C / 21°C", humidity: "82%", condition: "Scattered Showers", icon: "rainy", rainChance: "60%" },
    { day: "Wed", temp: "29°C / 21°C", humidity: "88%", condition: "Thunderstorms Expected", icon: "thunderstorm", rainChance: "90%" },
    { day: "Thu", temp: "31°C / 22°C", humidity: "80%", condition: "Partly Cloudy", icon: "partly_cloudy_day", rainChance: "30%" },
    { day: "Fri", temp: "32°C / 23°C", humidity: "75%", condition: "Sunny & Clear Sky", icon: "wb_sunny", rainChance: "10%" }
  ]);

  const [advisory, setAdvisory] = useState(
    "Thunderstorms and scattered showers expected on Wednesday (Rain: 90%). Please defer any nitrogen-based urea spraying until Thursday to prevent fertilizer run-off. Apply prophylactic fungicides on grapes and tomatoes to prevent root rot."
  );

  useEffect(() => {
    if (weatherData && weatherData.forecast && weatherData.forecast.length > 0) {
      setForecastDays(weatherData.forecast.slice(0, 5));
      const rainyDay = weatherData.forecast.find((f: any) => {
        const chance = parseInt(f.rainChance || "0");
        return chance >= 60;
      });
      if (rainyDay) {
        setAdvisory(`Rain and showers expected on ${rainyDay.day} (${rainyDay.rainChance}). Please defer any nitrogen-based urea spraying to prevent fertilizer run-off. Apply prophylactic crop fungicides to prevent root rot.`);
      } else {
        setAdvisory("Clear skies and dry weather forecast for the week. Excellent conditions for fertilizer spraying, pesticide application, and harvesting. Keep irrigation channels clear.");
      }
    }
  }, [weatherData]);

  return (
    <div id="dashboard-extensions-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* 1. APMC / VILLAGE INFORMATION DASHBOARD (7 COLS) */}
      <div id="village-info-dashboard-card" className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
              Village Profile & Soil Dashboard
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Explore crop suitability, soil profiles, and water indices for your gram panchayat block.</p>
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none pr-8 cursor-pointer focus:outline-none"
            >
              <option value="dindori">Dindori Gram Panchayat</option>
              <option value="niphad">Niphad Gram Panchayat</option>
              <option value="sinnar">Sinnar Gram Panchayat</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
          </div>
        </div>

        {/* Village Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gram Panchayat Location</span>
            <p className="font-bold text-slate-800 text-xs">{currentVillage.name}</p>
            <p className="text-[11px] text-slate-500">{currentVillage.district}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Canal Irrigation & Water Index</span>
            <p className="font-bold text-slate-800 text-xs">{currentVillage.irrigationAccess}</p>
            <p className="text-[11px] text-slate-500">Water levels: {currentVillage.groundwater}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1 col-span-1 md:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predominant Soil Composition</span>
            <p className="font-bold text-emerald-800 text-xs">{currentVillage.soilType}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">High natural fertilizer retention, ideal for moisture-seeking cash crops.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Cultivated Crops (Local APMC)</span>
            <p className="font-bold text-slate-800 text-xs">{currentVillage.popularCrops}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearest Wholesale Mandi Links</span>
            <p className="font-bold text-slate-800 text-xs">{currentVillage.nearbyMarkets}</p>
          </div>
        </div>

        {/* 5-Day Weather Forecast */}
        <div className="space-y-3.5 pt-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">5-Day Agricultural Weather Forecast</h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">Humidity Sensor Live</span>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {forecastDays.map((f, idx) => (
              <div key={idx} className="bg-white border border-slate-200 hover:border-primary rounded-xl p-3 text-center space-y-1.5 transition">
                <p className="text-xs font-bold text-slate-800">{f.day}</p>
                <span className="material-symbols-outlined text-slate-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {f.icon}
                </span>
                <div>
                  <p className="text-[10px] font-bold text-slate-900">{f.temp}</p>
                  <p className="text-[9px] text-blue-600 font-semibold">🌧️ {f.rainChance}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expert Weather Advisory */}
          <div className="p-3.5 bg-[#EEF4FD] rounded-xl border border-slate-150 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#0056D2] text-sm mt-0.5">wb_cloudy</span>
            <p>
              <strong>Agricultural Weather Advisory:</strong> {advisory}
            </p>
          </div>
        </div>

      </div>

      {/* 2. SCHEME ALERT INBOX / NOTIFICATION PANEL (5 COLS) */}
      <div id="scheme-alerts-card" className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                Scheme Alerts Inbox
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Critical notifications, scheme deadlines, and direct-benefit alerts.</p>
            </div>

            {alerts.some(a => a.unread) && (
              <button 
                onClick={markAllRead}
                className="text-xs font-bold text-primary hover:text-emerald-800 border-none bg-transparent cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Alerts Feed List */}
          <div className="space-y-3.5 pt-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition relative text-left flex items-start gap-3.5 ${
                  alert.unread 
                    ? "border-amber-200 bg-amber-50/10 shadow-sm" 
                    : "border-slate-100 bg-slate-50/60"
                }`}
              >
                <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
                  alert.type === "warning" ? "text-rose-600" :
                  alert.type === "success" ? "text-emerald-600" : "text-[#0056D2]"
                }`}>
                  {alert.icon}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                    {alert.unread && (
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed pr-2">{alert.message}</p>
                  <span className="text-[9px] text-slate-400 font-semibold block">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call-to-action warning */}
        <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-rose-900 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-rose-600 text-sm mt-0.5">info_outline</span>
          <p>
            You have <span className="font-bold text-rose-800">1 urgent warning alert</span> regarding your crop insurance policy. Apply before the deadline to ensure your wheat fields remain fully insured.
          </p>
        </div>

      </div>

    </div>
  );
};
