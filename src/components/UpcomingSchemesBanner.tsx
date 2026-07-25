import React, { useState, useEffect } from "react";

interface BannerItem {
  id: string;
  icon: string;
  launchDate: string;
  bgGradient: string;
  accentColor: string;
  translations: Record<string, {
    title: string;
    status: string;
    benefit: string;
    desc: string;
    cta: string;
    ctaActive: string;
  }>;
}

const UPCOMING_BANNERS: BannerItem[] = [
  {
    id: "drone_subsidy_2026",
    icon: "flight_takeoff",
    launchDate: "2026-08-15",
    bgGradient: "from-[#0F5238] via-[#1E5F46] to-[#0A3D29]",
    accentColor: "bg-[#beead1] text-[#0F5238]",
    translations: {
      en: {
        title: "PM Krishi Smart Drone Subsidy 2026",
        status: "Launching Aug 15",
        benefit: "50% Govt Subsidy (Up to ₹5,00,000)",
        desc: "Get high-tech intelligent drones for precision liquid pesticide spraying, soil moisture diagnostics, and real-time yield health monitoring.",
        cta: "Notify Me & Set Reminder",
        ctaActive: "Reminder Set ✓ (We'll SMS you)"
      },
      hi: {
        title: "पीएम कृषि स्मार्ट ड्रोन सब्सिडी 2026",
        status: "15 अगस्त को लॉन्च",
        benefit: "50% सरकारी सब्सिडी (₹5,00,000 तक)",
        desc: "परिशुद्धता तरल कीटनाशक छिड़काव, मिट्टी की नमी निदान, और वास्तविक समय फसल स्वास्थ्य निगरानी के लिए हाई-टेक इंटेलिजेंट ड्रोन प्राप्त करें।",
        cta: "मुझे सूचित करें और अनुस्मारक सेट करें",
        ctaActive: "अनुस्मारक सेट है ✓ (हम आपको एसएमएस करेंगे)"
      },
      mr: {
        title: "पीएम कृषी स्मार्ट ड्रोन सबसिडी २०२६",
        status: "१५ ऑगस्ट रोजी सुरू",
        benefit: "५०% सरकारी सबसिडी (₹५,००,००० पर्यंत)",
        desc: "द्रवरूप कीटकनाशक फवारणी, मातीची आर्द्रता तपासणी आणि पीक आरोग्य निरीक्षणासाठी हाय-टेक इंटेलिजेंट ड्रोन सबसिडीवर मिळवा.",
        cta: "मला सूचित करा आणि स्मरणपत्र सेट करा",
        ctaActive: "स्मरणपत्र सेट केले ✓ (आम्ही SMS करू)"
      },
      te: {
        title: "పీఎం కృషి స్మార్ట్ డ్రోన్ సబ్సిడీ 2026",
        status: "ఆగస్టు 15న ప్రారంభం",
        benefit: "50% ప్రభుత్వ సబ్సిడీ (₹5,00,000 వరకు)",
        desc: "ద్రవ పురుగుమందుల పిచికారీ, నేల తేమ నిర్ధారణ మరియు రియల్ టైమ్ పంట ఆరోగ్య పర్యవేక్షణ కోసం హై-టెక్ ఇంటెలిజెంట్ డ్రోన్‌లను పొందండి.",
        cta: "నాకు తెలియజేయి & రిమైండర్ పెట్టు",
        ctaActive: "రిమైండర్ సెట్ అయింది ✓ (మేము SMS చేస్తాము)"
      },
      pa: {
        title: "ਪੀਐਮ ਕ੍ਰਿਸ਼ੀ ਸਮਾਰਟ ਡਰੋਨ ਸਬਸਿਡੀ 2026",
        status: "15 ਅਗਸਤ ਨੂੰ ਲਾਂਚ",
        benefit: "50% ਸਰਕਾਰੀ ਸਬਸਿਡੀ (₹5,00,000 ਤੱਕ)",
        desc: "ਤਰਲ ਕੀਟਨਾਸ਼ਕ ਛਿੜਕਾਅ, ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਜਾਂਚ ਅਤੇ ਅਸਲ-ਸਮੇਂ ਦੀ ਫਸਲ ਦੀ ਸਿਹਤ ਨਿਗਰਾਨੀ ਲਈ ਹਾਈ-ਟੈਕ ਸਮਾਰਟ ਡਰੋਨ ਪ੍ਰਾਪਤ ਕਰੋ।",
        cta: "ਮੈਨੂੰ ਸੂਚਿਤ ਕਰੋ ਅਤੇ ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਕਰੋ",
        ctaActive: "ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਹੋ ਗਿਆ ✓ (ਅਸੀਂ SMS ਕਰਾਂਗੇ)"
      }
    }
  },
  {
    id: "micro_irrigation_2026",
    icon: "water_drop",
    launchDate: "2026-09-01",
    bgGradient: "from-[#0056D2] via-[#1E73E8] to-[#003B95]",
    accentColor: "bg-[#EEF4FD] text-[#0056D2]",
    translations: {
      en: {
        title: "National Micro-Irrigation Drip Fund",
        status: "Launching Sept 1",
        benefit: "80% Subsidy for Water-Scarce Blocks",
        desc: "Maximize crop yields with solar-integrated smart drip & sprinkler systems, complete with automatic soil moisture sensors and pipe networks.",
        cta: "Notify Me & Set Reminder",
        ctaActive: "Reminder Set ✓ (We'll SMS you)"
      },
      hi: {
        title: "राष्ट्रीय सूक्ष्म सिंचाई ड्रिप कोष",
        status: "1 सितंबर को लॉन्च",
        benefit: "सूखे क्षेत्रों के लिए 80% सब्सिडी",
        desc: "स्वचालित मिट्टी नमी सेंसर और पाइप नेटवर्क से सुसज्जित, सौर-एकीकृत स्मार्ट ड्रिप और स्प्रिंकलर सिस्टम के साथ फसल की उपज को अधिकतम करें।",
        cta: "मुझे सूचित करें और अनुस्मारक सेट करें",
        ctaActive: "अनुस्मारक सेट है ✓ (हम आपको एसएमएस करेंगे)"
      },
      mr: {
        title: "राष्ट्रीय सूक्ष्म सिंचन ठिबक निधी",
        status: "१ सप्टेंबर रोजी सुरू",
        benefit: "पाणीटंचाई असलेल्या क्षेत्रांसाठी ८०% सबसिडी",
        desc: "स्वयंचलित जमिनीची आर्द्रता सेन्सर आणि पाईप नेटवर्कसह सौर-एकीकृत स्मार्ट ठिबक आणि तुषार सिंचन पद्धतींसह पिकाचे उत्पन्न वाढवा.",
        cta: "मला सूचित करा आणि स्मरणपत्र सेट करा",
        ctaActive: "स्मरणपत्र सेट केले ✓ (आम्ही SMS करू)"
      },
      te: {
        title: "జాతీయ సూక్ష్మ నీటిపారుదల డ్రిప్ నిధి",
        status: "సెప్టెంబర్ 1న ప్రారంభం",
        benefit: "నీటి కొరత ఉన్న బ్లాకులకు 80% సబ్సిడీ",
        desc: "ఆటోమేటిక్ నేల తేమ సెన్సార్లు మరియు పైప్ నెట్‌వర్క్‌లతో కూడిన సోలార్-ఇంటిగ్రేటెడ్ స్మార్ట్ డ్రిప్ & స్ప్రింక్లర్ సిస్టమ్‌లతో పంట దిగుబడిని పెంచుకోండి.",
        cta: "నాకు తెలియజేయి & రిమైండర్ పెట్టు",
        ctaActive: "రిమైండర్ సెట్ అయింది ✓ (మేము SMS చేస్తాము)"
      },
      pa: {
        title: "ਰਾਸ਼ਟਰੀ ਸੂਖਮ ਸਿੰਚਾਈ ਡ੍ਰਿਪ ਫੰਡ",
        status: "1 ਸਤੰਬਰ ਨੂੰ ਲਾਂਚ",
        benefit: "ਪਾਣੀ ਦੀ ਘਾਟ ਵਾਲੇ ਬਲਾਕਾਂ ਲਈ 80% ਸਬਸਿਡੀ",
        desc: "ਆਟੋਮੈਟਿਕ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੇ ਸੈਂਸਰ ਅਤੇ ਪਾਈਪ ਨੈਟਵਰਕ ਨਾਲ ਲੈਸ, ਸੋਲਰ-ਏਕੀਕ੍ਰਿਤ ਸਮਾਰਟ ਡ੍ਰਿਪ ਅਤੇ ਸਪ੍ਰਿੰਕਲਰ ਪ੍ਰਣਾਲੀਆਂ ਨਾਲ ਫਸਲਾਂ ਦੀ ਪੈਦਾਵਾਰ ਵਧਾਓ।",
        cta: "ਮੈਨੂੰ ਸੂਚਿਤ ਕਰੋ ਅਤੇ ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਕਰੋ",
        ctaActive: "ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਹੋ ਗਿਆ ✓ (ਅਸੀਂ SMS ਕਰਾਂਗੇ)"
      }
    }
  },
  {
    id: "solar_dryers_2026",
    icon: "sunny",
    launchDate: "2026-10-10",
    bgGradient: "from-[#B25E00] via-[#D97706] to-[#78350F]",
    accentColor: "bg-[#FEF3C7] text-[#B25E00]",
    translations: {
      en: {
        title: "Sustainable Solar Food Dryers Initiative",
        status: "Launching Oct 10",
        benefit: "₹35,000 Direct DBT Bank Subsidy",
        desc: "Prevent post-harvest damage and preserve key perishables like tomatoes, onions, chilies, and grapes with modular hybrid solar dryer units.",
        cta: "Notify Me & Set Reminder",
        ctaActive: "Reminder Set ✓ (We'll SMS you)"
      },
      hi: {
        title: "सतत सौर खाद्य ड्रायर पहल",
        status: "10 अक्टूबर को लॉन्च",
        benefit: "₹35,000 प्रत्यक्ष डीबीटी बैंक सहायता",
        desc: "मॉड्यूलर हाइब्रिड सौर ड्रायर इकाइयों के साथ टमाटर, प्याज, मिर्च और अंगूर जैसी प्रमुख खराब होने वाली फसलों की कटाई के बाद के नुकसान को रोकें।",
        cta: "मुझे सूचित करें और अनुस्मारक सेट करें",
        ctaActive: "अनुस्मारक सेट है ✓ (हम आपको एसएमएस करेंगे)"
      },
      mr: {
        title: "शाश्वत सौर अन्न ड्रायर उपक्रम",
        status: "१० ऑक्टोबर रोजी सुरू",
        benefit: "₹३५,००० थेट बँक खात्यात सबसिडी",
        desc: "मॉड्यूलर हायब्रिड सोलर ड्रायर युनिट्सच्या सहाय्याने टोमॅटो, कांदा, मिरची आणि द्राक्षे यांसारखी नाशवंत पिके खराब होण्यापासून वाचवा.",
        cta: "मला सूचित करा आणि स्मरणपत्र सेट करा",
        ctaActive: "स्मरणपत्र सेट केले ✓ (आम्ही SMS करू)"
      },
      te: {
        title: "స్థిరమైన సోలార్ ఆహార డ్రైయర్స్ పథకం",
        status: "అక్టోబర్ 10న ప్రారంభం",
        benefit: "₹35,000 ప్రత్యక్ష డీబీటీ బ్యాంక్ సబ్సిడీ",
        desc: "మాడ్యులర్ హైబ్రిడ్ సోలార్ డ్రైయర్ యూనిట్లతో టమోటాలు, ఉల్లిపాయలు, మిరపకాయలు మరియు ద్రాక్ష వంటి త్వరగా పాడైపోయే పంటల నష్టాన్ని నివారించండి.",
        cta: "నాకు తెలియజేయి & రిమైండర్ పెట్టు",
        ctaActive: "రిమైండర్ సెట్ అయింది ✓ (మేము SMS చేస్తాము)"
      },
      pa: {
        title: "ਟਿਕਾਊ ਸੋਲਰ ਫੂਡ ਡਰਾਇਰ ਯੋਜਨਾ",
        status: "10 ਅਕਤੂਬਰ ਨੂੰ ਲਾਂਚ",
        benefit: "₹35,000 ਸਿੱਧੀ ਡੀਬੀਟੀ ਬੈਂਕ ਸਬਸਿਡੀ",
        desc: "ਮਾਡਿਊਲਰ ਹਾਈਬ੍ਰਿਡ ਸੋਲਰ ਡਰਾਇਰ ਯੂਨਿਟਾਂ ਨਾਲ ਟਮਾਟਰ, ਪਿਆਜ਼, ਮਿਰਚਾਂ ਅਤੇ ਅੰਗੂਰ ਵਰਗੀਆਂ ਜਲਦੀ ਖਰਾਬ ਹੋਣ ਵਾਲੀਆਂ ਫਸਲਾਂ ਦੇ ਨੁਕਸਾਨ ਨੂੰ ਰੋਕੋ।",
        cta: "ਮੈਨੂੰ ਸੂਚਿਤ ਕਰੋ ਅਤੇ ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਕਰੋ",
        ctaActive: "ਰਿਮਾਈਂਡਰ ਸੈੱਟ ਹੋ ਗਿਆ ✓ (ਅਸੀਂ SMS ਕਰਾਂਗੇ)"
      }
    }
  }
];

export const UpcomingSchemesBanner: React.FC<{ lang: string }> = ({ lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Auto-cycle banners every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % UPCOMING_BANNERS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const getDaysRemaining = (targetDateStr: string) => {
    // Current system clock shows 2026-07-08 as the reference date
    const today = new Date("2026-07-08");
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const toggleReminder = (id: string, title: string) => {
    const isRegistered = !reminders[id];
    setReminders((prev) => ({ ...prev, [id]: isRegistered }));

    if (isRegistered) {
      let toastText = `Notification reminder registered for "${title}". We'll alert you via SMS & Voice.`;
      if (lang === "hi") {
        toastText = `"${title}" के लिए अनुस्मारक पंजीकृत किया गया है। हम आपको एसएमएस और वॉयस द्वारा सूचित करेंगे।`;
      } else if (lang === "mr") {
        toastText = `"${title}" साठी स्मरणपत्र नोंदणीकृत झाले आहे. आम्ही तुम्हाला SMS आणि व्हॉइसद्वारे कळवू.`;
      } else if (lang === "te") {
        toastText = `"${title}" కోసం రిమైండర్ నమోదైంది. మేము మీకు SMS మరియు వాయిస్ ద్వారా తెలియజేస్తాము.`;
      } else if (lang === "pa") {
        toastText = `"${title}" ਲਈ ਰਿਮਾਈਂਡਰ ਰਜਿਸਟਰ ਹੋ ਗਿਆ ਹੈ। ਅਸੀਂ ਤੁਹਾਨੂੰ SMS ਅਤੇ ਵਾਇਸ ਰਾਹੀਂ ਸੂਚਿਤ ਕਰਾਂਗੇ।`;
      }
      setToastMsg(toastText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }
  };

  const activeLang = lang in UPCOMING_BANNERS[0].translations ? lang : "en";
  const currentBanner = UPCOMING_BANNERS[currentIndex];
  const t = currentBanner.translations[activeLang] || currentBanner.translations.en;
  const daysLeft = getDaysRemaining(currentBanner.launchDate);

  // Localization for common strings
  const commonT: Record<string, Record<string, string>> = {
    upcomingBadge: {
      en: "Upcoming Scheme",
      hi: "आगामी योजना",
      mr: "आगामी योजना",
      te: "రాబోయే పథకం",
      pa: "ਆਉਣ ਵਾਲੀ ਯੋਜਨਾ"
    },
    daysLeftText: {
      en: "Days Until Launch",
      hi: "लॉन्च होने में दिन",
      mr: "लाँच होण्यासाठी दिवस",
      te: "ప్రారంభానికి రోజుల వ్యవధి",
      pa: "ਲਾਂਚ ਹੋਣ ਵਿੱਚ ਦਿਨ"
    }
  };

  const badgeText = commonT.upcomingBadge[activeLang] || commonT.upcomingBadge.en;
  const daysText = commonT.daysLeftText[activeLang] || commonT.daysLeftText.en;

  return (
    <div className="relative w-full">
      {/* Toast Feedback */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900/95 text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/30 animate-scale-in max-w-sm md:max-w-md">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span className="text-left">{toastMsg}</span>
        </div>
      )}

      {/* Main Banner Card */}
      <div 
        id="upcoming-schemes-banner-container"
        className={`w-full rounded-2xl p-4 md:p-5 text-white relative overflow-hidden shadow-md transition-all duration-700 bg-gradient-to-r ${currentBanner.bgGradient} text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
      >
        {/* Background decorative vector details */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -mr-16 -mt-16 blur-lg"></div>
        <div className="absolute left-1/3 bottom-0 w-36 h-36 bg-black/10 rounded-full pointer-events-none -ml-16 -mb-16 blur-md"></div>

        {/* Content Side */}
        <div className="space-y-3 relative z-10 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${currentBanner.accentColor}`}>
              <span className="material-symbols-outlined text-[10px] animate-bounce">upcoming</span>
              {badgeText}
            </span>
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
              🕒 {t.status}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-extrabold tracking-tight font-display text-white leading-tight">
              {t.title}
            </h3>
            <p className="text-emerald-100 text-[11px] md:text-xs font-bold uppercase tracking-wider">
              🎁 {t.benefit}
            </p>
            <p className="text-slate-100 text-[11px] md:text-xs max-w-xl font-medium leading-relaxed">
              {t.desc}
            </p>
          </div>

          <div>
            <button
              onClick={() => toggleReminder(currentBanner.id, t.title)}
              className={`h-8 md:h-9 px-4 md:px-5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm ${
                reminders[currentBanner.id]
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {reminders[currentBanner.id] ? "notifications_active" : "notifications"}
              </span>
              {reminders[currentBanner.id] ? t.ctaActive : t.cta}
            </button>
          </div>
        </div>

        {/* Countdown / Metrics Side */}
        <div className="shrink-0 relative z-10 w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 md:p-4 flex md:flex-col items-center justify-between md:justify-center gap-2 md:gap-3 text-center md:min-w-[110px]">
          <div className="flex flex-col items-start md:items-center">
            <span className="material-symbols-outlined text-2xl text-amber-300 animate-pulse mb-0.5">
              {currentBanner.icon}
            </span>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-200">
              {daysText}
            </p>
          </div>
          <div className="flex md:flex-col items-baseline md:items-center gap-1">
            <span className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
              {daysLeft}
            </span>
            <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest">
              {lang === "hi" ? "दिन शेष" : lang === "mr" ? "दिवस शिल्लक" : lang === "te" ? "రోజులు" : lang === "pa" ? "ਦਿਨ ਬਾਕੀ" : "Days"}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Sliding Carousel Controls */}
      <div className="flex justify-center items-center gap-1.5 mt-2 relative z-20">
        {UPCOMING_BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to scheme slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-350 cursor-pointer ${
              index === currentIndex ? "w-5 bg-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};
