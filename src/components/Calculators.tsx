import React, { useState } from "react";
import { Scheme } from "../types";
import { SCHEMES } from "../data";

interface CalculatorsProps {
  onSelectScheme: (scheme: Scheme) => void;
  lang: string;
}

export const Calculators: React.FC<CalculatorsProps> = ({ onSelectScheme, lang }) => {
  const [activeTab, setActiveTab] = useState<"profit" | "land" | "subsidy" | "recommend">("profit");

  // ==================== 1. CROP PROFIT CALCULATOR STATE ====================
  const [profitCrop, setProfitCrop] = useState("wheat");
  const [profitArea, setProfitArea] = useState(3.5);
  const [expSeeds, setExpSeeds] = useState(4000);
  const [expFertilizer, setExpFertilizer] = useState(5500);
  const [expIrrigation, setExpIrrigation] = useState(2500);
  const [expLabor, setExpLabor] = useState(6000);
  const [expHarvest, setExpHarvest] = useState(3000);
  
  // Crop specific defaults (Yield in Quintals per acre & Market Selling Price per Quintal)
  const cropDefaults: Record<string, { yield: number; price: number; name: string }> = {
    wheat: { yield: 20, price: 2425, name: "Wheat (Kanak)" }, // Wheat MSP 2025/26 is ₹2,425/quintal
    rice: { yield: 22, price: 2300, name: "Rice (Paddy)" },   // Paddy MSP is ₹2,300/quintal
    cotton: { yield: 8, price: 7121, name: "Cotton" },       // Cotton MSP is ₹7,121/quintal
    sugarcane: { yield: 350, price: 340, name: "Sugarcane" }, // Sugarcane FRP is ₹340/quintal
    maize: { yield: 25, price: 2225, name: "Maize" }         // Maize MSP is ₹2,225/quintal
  };

  const currentDefaults = cropDefaults[profitCrop] || cropDefaults.wheat;
  const [expectedYield, setExpectedYield] = useState(currentDefaults.yield);
  const [sellingPrice, setSellingPrice] = useState(currentDefaults.price);

  const handleProfitCropChange = (e: string) => {
    setProfitCrop(e);
    const defaults = cropDefaults[e];
    if (defaults) {
      setExpectedYield(defaults.yield);
      setSellingPrice(defaults.price);
    }
  };

  // Calculations
  const totalCostPerAcre = expSeeds + expFertilizer + expIrrigation + expLabor + expHarvest;
  const totalExpenses = totalCostPerAcre * profitArea;
  
  const totalYieldQuintals = expectedYield * profitArea;
  const totalRevenue = totalYieldQuintals * sellingPrice;
  const netProfit = totalRevenue - totalExpenses;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

  // ==================== 2. LAND VALUE CALCULATOR STATE ====================
  const [landSize, setLandSize] = useState(4.0);
  const [soilType, setSoilType] = useState("alluvial"); // alluvial, black, red, sandy
  const [waterAccess, setWaterAccess] = useState("highly_irrigated"); // highly_irrigated, partially, rainfed
  const [locationDistrict, setLocationDistrict] = useState("premium_highway"); // premium_highway, mid_town, remote
  const [roadFacing, setRoadFacing] = useState(true);

  const calculateLandValue = () => {
    // Base value per acre based on district
    let baseValuePerAcre = 800000; // 8 Lakhs base

    // Soil type multipliers
    if (soilType === "alluvial") baseValuePerAcre *= 1.4; // Very fertile
    else if (soilType === "black") baseValuePerAcre *= 1.35; // Great for cotton/wheat
    else if (soilType === "red") baseValuePerAcre *= 1.1;
    else if (soilType === "sandy") baseValuePerAcre *= 0.7; // Dry, low value

    // Water multipliers
    if (waterAccess === "highly_irrigated") baseValuePerAcre *= 1.3;
    else if (waterAccess === "partially") baseValuePerAcre *= 1.1;
    else if (waterAccess === "rainfed") baseValuePerAcre *= 0.8;

    // Location multipliers
    if (locationDistrict === "premium_highway") baseValuePerAcre *= 1.5;
    else if (locationDistrict === "mid_town") baseValuePerAcre *= 1.15;
    else if (locationDistrict === "remote") baseValuePerAcre *= 0.75;

    // Road facing bonus
    if (roadFacing) baseValuePerAcre *= 1.15;

    const totalValue = baseValuePerAcre * landSize;
    return {
      perAcre: Math.round(baseValuePerAcre),
      total: Math.round(totalValue)
    };
  };

  const landEst = calculateLandValue();

  // ==================== 3. SUBSIDY CALCULATOR STATE ====================
  const [machineryType, setMachineryType] = useState("solar_pump");
  const [farmerSocialCategory, setFarmerSocialCategory] = useState("general"); // general, sc_st, woman
  const [machineryCost, setMachineryCost] = useState(250000);

  const machineryDefaults: Record<string, { cost: number; rate: number; name: string }> = {
    solar_pump: { cost: 280000, rate: 60, name: "Solar Irrigation Pump (5HP)" },
    tractor: { cost: 750000, rate: 40, name: "High Power Tractor (45HP)" },
    drip_irrigation: { cost: 120000, rate: 80, name: "Drip Irrigation Pipeline System" },
    power_tiller: { cost: 180000, rate: 50, name: "Rotary Power Tiller" },
    sprayer: { cost: 25000, rate: 50, name: "Battery Powered Boom Sprayer" }
  };

  const handleMachineryChange = (e: string) => {
    setMachineryType(e);
    const defaults = machineryDefaults[e];
    if (defaults) {
      setMachineryCost(defaults.cost);
    }
  };

  const calculateSubsidy = () => {
    const defaults = machineryDefaults[machineryType] || machineryDefaults.solar_pump;
    let rate = defaults.rate;

    // Special category enhancements
    if (farmerSocialCategory === "sc_st") {
      rate = Math.min(90, rate + 10); // SC/ST farmers get 10% more, max 90%
    } else if (farmerSocialCategory === "woman") {
      rate = Math.min(90, rate + 15); // Women farmers get 15% more, max 90%
    }

    const subsidyAmount = machineryCost * (rate / 100);
    const farmerShare = machineryCost - subsidyAmount;

    return {
      rate,
      subsidy: Math.round(subsidyAmount),
      farmerShare: Math.round(farmerShare)
    };
  };

  const subsidyEst = calculateSubsidy();

  // ==================== 4. RECOMMENDATION SYSTEM STATE ====================
  const [recLandSize, setRecLandSize] = useState("medium"); // marginal (<1.5 ac), small (1.5-5 ac), medium (5-10 ac), large (>10 ac)
  const [recCrop, setRecCrop] = useState("wheat");
  const [recIrrigation, setRecIrrigation] = useState(true);
  const [recCategory, setRecCategory] = useState("general");
  const [recIncome, setRecIncome] = useState("below_3l");
  const [showRecResults, setShowRecResults] = useState(true);

  const getRecommendations = (): Scheme[] => {
    return SCHEMES.filter(s => {
      // 1. Kisan Credit Card — for marginal, small & medium farmers with moderate income
      if (s.id === "kisan_credit_card") {
        const sizeMatch = recLandSize === "marginal" || recLandSize === "small" || recLandSize === "medium";
        const incomeMatch = recIncome === "below_3l" || recIncome === "3l_6l";
        return sizeMatch && incomeMatch;
      }
      
      // 2. PM Fasal Bima — all crops except maize (which has limited coverage)
      if (s.id === "pm_fasal_bima") {
        const cropMatch = ["wheat", "rice", "cotton", "sugarcane", "maize", "horticulture"].includes(recCrop);
        return cropMatch;
      }
      
      // 3. PM-KUSUM Solar Pump — recommend when farmer has NO irrigation (need it most) OR
      //    has irrigation with medium/large land to reduce electricity costs
      if (s.id === "pm_kusum") {
        const needsIrrigation = !recIrrigation; // no current source → needs solar pump
        const scalesWell = recIrrigation && (recLandSize === "medium" || recLandSize === "large");
        return recLandSize !== "marginal" && (needsIrrigation || scalesWell);
      }
      
      // 4. Tractor Loan — medium & large farmers; also small farmers with moderate income
      if (s.id === "tractor_loan") {
        const largeFarmer = recLandSize === "medium" || recLandSize === "large";
        const smallFarmerWithIncome = recLandSize === "small" && recIncome !== "below_3l";
        return largeFarmer || smallFarmerWithIncome;
      }
      
      // 5. PKVY Organic Farming — non-marginal farmers with crops suited to organic practices
      if (s.id === "pkvy_organic") {
        const sizeMatch = recLandSize !== "marginal";
        const cropMatch = ["wheat", "rice", "cotton", "horticulture", "sugarcane"].includes(recCrop);
        return sizeMatch && cropMatch;
      }
      
      // 6. Agri Gold Loan — smaller income farmers who need quick liquidity
      if (s.id === "agri_gold_loan") {
        const incomeMatch = recIncome === "below_3l" || recIncome === "3l_6l";
        return incomeMatch;
      }
      
      return false;
    });
  };

  const recommendedSchemes = showRecResults ? getRecommendations() : [];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
            Smart Tools & Calculators
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Perform instant financial planning and check government matching benefits.</p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: "profit", label: "Crop Profit", icon: "payments" },
            { id: "land", label: "Land Value", icon: "explore" },
            { id: "subsidy", label: "Subsidy Cal.", icon: "local_mall" },
            { id: "recommend", label: "Match Schemes", icon: "auto_awesome" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border-none cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== SCREEN 1: CROP PROFIT CALCULATOR ==================== */}
      {activeTab === "profit" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-scale-in">
          {/* Inputs */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Crop Details</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Select Target Crop</label>
              <div className="relative">
                <select
                  value={profitCrop}
                  onChange={(e) => handleProfitCropChange(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="wheat">Wheat (Kanak)</option>
                  <option value="rice">Rice (Paddy)</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="maize">Maize</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Land Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={profitArea}
                onChange={(e) => setProfitArea(parseFloat(e.target.value) || 0)}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider pt-2">Expenses per Acre (₹)</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Seeds cost</label>
                <input type="number" value={expSeeds} onChange={(e) => setExpSeeds(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Fertilizers & Pesticides</label>
                <input type="number" value={expFertilizer} onChange={(e) => setExpFertilizer(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Irrigation/Water pumps</label>
                <input type="number" value={expIrrigation} onChange={(e) => setExpIrrigation(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Labor expenses</label>
                <input type="number" value={expLabor} onChange={(e) => setExpLabor(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] text-slate-500 font-semibold">Harvesting & Transportation</label>
                <input type="number" value={expHarvest} onChange={(e) => setExpHarvest(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider pt-2">Yield & Sell Estimate</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Yield (Quintals/Ac)</label>
                <input type="number" value={expectedYield} onChange={(e) => setExpectedYield(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold">Price per Quintal (₹)</label>
                <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(parseInt(e.target.value) || 0)} className="h-10 px-3 bg-slate-50 border border-[#E9ECEF] rounded-xl text-xs font-bold" />
              </div>
            </div>
          </div>

          {/* Report */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-[#EEF4FD] text-[#0056D2] text-[10px] font-bold uppercase rounded-full">
                Profit & Loss Ledger Analysis
              </span>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-left bg-white p-3 rounded-xl border border-slate-150 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Expenses</p>
                  <p className="text-lg font-black text-slate-800 mt-1">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="text-left bg-white p-3 rounded-xl border border-slate-150 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</p>
                  <p className="text-lg font-black text-slate-800 mt-1">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-left bg-white p-3 rounded-xl border border-slate-150 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Return (ROI)</p>
                  <p className={`text-lg font-black mt-1 ${roi >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {roi.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Huge profit amount display */}
              <div className={`p-6 rounded-2xl border text-center space-y-1 ${
                netProfit >= 0 ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
              }`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Net profit</p>
                <p className={`text-4xl font-extrabold font-display ${netProfit >= 0 ? "text-emerald-800" : "text-rose-700"}`}>
                  {netProfit >= 0 ? "+" : ""}₹{netProfit.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">For {profitArea} Acres of {currentDefaults.name} cultivation</p>
              </div>

              {/* Dynamic Advisory Bullet Points */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Agronomy Advisory Advice</h5>
                <ul className="text-xs text-slate-600 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">verified</span>
                    <span>Your selling price is aligned with the government <strong>Minimum Support Price (MSP)</strong> of ₹{currentDefaults.price}/quintal. Selling at state procurement centers is advised.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0056D2] text-sm mt-0.5">info</span>
                    <span>Total farming cost per acre: <strong>₹{totalCostPerAcre.toLocaleString()}</strong>. Cooperative bulk buying of seeds and urea can save up to 12% in input costs.</span>
                  </li>
                  {expIrrigation > 3000 && (
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">warning</span>
                      <span>Irrigation pump electricity costs are elevated. Applying for the <strong>PM-KUSUM Solar Pump subsidy</strong> can reduce water costs to zero!</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Quick action button to trigger pump application */}
            {expIrrigation > 3000 && (
              <button 
                onClick={() => {
                  const kusum = SCHEMES.find(s => s.id === "pm_kusum");
                  if (kusum) onSelectScheme(kusum);
                }}
                className="w-full h-11 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-4 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined">sunny</span>
                <span>Apply for Solar Pump Subsidy (Save ₹{expIrrigation * 3} p.a.)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN 2: LAND VALUE CALCULATOR ==================== */}
      {activeTab === "land" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-scale-in">
          {/* Inputs */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Land Details</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Total Land Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={landSize}
                onChange={(e) => setLandSize(parseFloat(e.target.value) || 0)}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Soil Composition Class</label>
              <div className="relative">
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="alluvial">Alluvial Soil (Highly fertile, river plains)</option>
                  <option value="black">Black Soil (Regur, moisture retentive)</option>
                  <option value="red">Red Soil (Light loam, needs fertilizer)</option>
                  <option value="sandy">Sandy / Desert Soil (Dry, low retention)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Irrigation & Water Access</label>
              <div className="relative">
                <select
                  value={waterAccess}
                  onChange={(e) => setWaterAccess(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="highly_irrigated">Perennial irrigation (Canal/Tubewell source)</option>
                  <option value="partially">Seasonal Irrigation (Groundwater dependent)</option>
                  <option value="rainfed">Rainfed / Dry Land farming (Monsoon dependent)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">District & Road Accessibility</label>
              <div className="relative">
                <select
                  value={locationDistrict}
                  onChange={(e) => setLocationDistrict(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="premium_highway">Near Highway/APMC Market link (0-5 km)</option>
                  <option value="mid_town">Village Peripheral plain (5-15 km)</option>
                  <option value="remote">Interior forest/remote land (15+ km)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={roadFacing}
                onChange={(e) => setRoadFacing(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">Direct Metal Road Facing (Substantial premium)</span>
            </label>
          </div>

          {/* Output */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold uppercase rounded-full">
                Valuation Certificate Appraisal
              </span>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs text-slate-500 font-semibold">Estimated Land Value per Acre:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">₹{landEst.perAcre.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs text-slate-500 font-semibold">Asset Size multiplier:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{landSize} Acres</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs text-slate-500 font-semibold">Soil texture quality credit:</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {soilType === "alluvial" || soilType === "black" ? "+ Excellent rating (+35%)" : "Standard rating"}
                  </span>
                </div>
              </div>

              {/* Massive Land Value amount display */}
              <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 text-center space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated land portfolio worth</p>
                <p className="text-4xl font-extrabold font-display text-primary">
                  ₹{landEst.total.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Based on prevailing Circle rates & market benchmarks for 2026</p>
              </div>

              {/* Informative advice */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-slate-600 leading-relaxed space-y-1.5">
                <span className="font-bold text-slate-800 block">Why this matters:</span>
                <p>This appraisal is a tentative benchmark. Government registrars evaluate Circle Rates (minimum registration prices) which are critical for securing agricultural mortgages or seeking high-quantum credit like <strong>Agri Gold Loans</strong> or tractor financing.</p>
              </div>
            </div>

            <button 
              onClick={() => alert("Redirecting to state registration registry to download official 7/12 land ledger...")}
              className="w-full h-11 border border-primary text-primary hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              <span>Download Digital 7/12 Land Registry Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 3: SUBSIDY CALCULATOR ==================== */}
      {activeTab === "subsidy" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-scale-in">
          {/* Inputs */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Subsidized Asset Details</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Select Equipment Class</label>
              <div className="relative">
                <select
                  value={machineryType}
                  onChange={(e) => handleMachineryChange(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="solar_pump">Solar Irrigation Pump (PM-KUSUM)</option>
                  <option value="tractor">Agricultural Tractor (Custom Hiring Scheme)</option>
                  <option value="drip_irrigation">Drip / Micro-Irrigation Pipe System</option>
                  <option value="power_tiller">Rotary Power Tiller / Weeder</option>
                  <option value="sprayer">Battery Powered Hand Sprayers</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Equipment Cost Price (₹)</label>
              <input
                type="number"
                value={machineryCost}
                onChange={(e) => setMachineryCost(parseInt(e.target.value) || 0)}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Farmer Profile / Social Category</label>
              <div className="relative">
                <select
                  value={farmerSocialCategory}
                  onChange={(e) => setFarmerSocialCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="general">General Farmer (Standard support)</option>
                  <option value="sc_st">SC / ST Farmer (Enhanced 10% sub-quota support)</option>
                  <option value="woman">Woman Farmer (Enhanced 15% incentive benefit)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase rounded-full">
                Subsidy Ledger breakdown
              </span>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-150 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Government Subsidy Rate</p>
                  <p className="text-2xl font-black text-[#0F5238] mt-1">{subsidyEst.rate}%</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Funded by Central & State departments</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-150 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subsidy Benefit amount</p>
                  <p className="text-2xl font-black text-emerald-800 mt-1">₹{subsidyEst.subsidy.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Transferred directly to approved dealer</p>
                </div>
              </div>

              {/* Farmer's Out of Pocket Share */}
              <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/20 text-center space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Farmer out-of-pocket share</p>
                <p className="text-4xl font-extrabold font-display text-slate-900">
                  ₹{subsidyEst.farmerShare.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Remaining share can be financed via KCC or Agri bank loans</p>
              </div>

              {/* Informative advice */}
              <div className="p-4 bg-[#EEF4FD] rounded-2xl text-xs text-slate-600 leading-relaxed border border-slate-150">
                <span className="font-bold text-slate-800 block mb-1">How to Claim:</span>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Get a certified proforma invoice from an authorized machinery dealer.</li>
                  <li>Register on the state agricultural engineering subsidy portal.</li>
                  <li>Once approved, pay only the <strong>Farmer Share (₹{subsidyEst.farmerShare.toLocaleString()})</strong> to the dealer.</li>
                </ol>
              </div>
            </div>

            <button 
              onClick={() => {
                const tractor = SCHEMES.find(s => s.id === "tractor_loan");
                if (tractor) onSelectScheme(tractor);
              }}
              className="w-full h-11 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-4 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              <span>Finance remaining share with Tractor Loan scheme</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 4: SCHEME RECOMMENDATION SYSTEM ==================== */}
      {activeTab === "recommend" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-scale-in">
          {/* Inputs */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Farmer Profile Setup</h4>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Total Landholding size</label>
              <div className="relative">
                <select
                  value={recLandSize}
                  onChange={(e) => setRecLandSize(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="marginal">Marginal Farmer (Less than 1.5 Acres)</option>
                  <option value="small">Small Farmer (1.5 to 5 Acres)</option>
                  <option value="medium">Medium Farmer (5 to 10 Acres)</option>
                  <option value="large">Large Farmer (More than 10 Acres)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Primary Cultivated Crop</label>
              <div className="relative">
                <select
                  value={recCrop}
                  onChange={(e) => setRecCrop(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="wheat">Wheat / Barley</option>
                  <option value="rice">Rice / Paddy</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="cotton">Cotton / Jute</option>
                  <option value="maize">Maize / Corn</option>
                  <option value="horticulture">Horticulture (Grapes, Onions, Pomegranate)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Active Water Source / Irrigation</label>
              <div className="relative">
                <select
                  value={recIrrigation ? "yes" : "no"}
                  onChange={(e) => setRecIrrigation(e.target.value === "yes")}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="yes">Yes, have active pump/canal irrigation</option>
                  <option value="no">No, entirely dependent on rain/monsoons</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-semibold">Annual Agricultural Household Income</label>
              <div className="relative">
                <select
                  value={recIncome}
                  onChange={(e) => setRecIncome(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="below_3l">Below ₹3,00,000 (Qualifies for smallholder credits)</option>
                  <option value="3l_6l">₹3,00,000 to ₹6,00,000</option>
                  <option value="above_6l">Above ₹6,00,000</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Apply / Find Schemes Button */}
            <button
              onClick={() => setShowRecResults(true)}
              className="w-full h-12 bg-primary hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition active:scale-95 shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span>Find Matching Schemes</span>
            </button>
          </div>

          {/* Output Recommendations */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                  {showRecResults
                    ? `Recommended Eligible Schemes (${recommendedSchemes.length})`
                    : "Set your profile and click Find Matching Schemes"}
                </span>
                {showRecResults && recommendedSchemes.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold">{recommendedSchemes.length} match{recommendedSchemes.length !== 1 ? "es" : ""} found</span>
                )}
              </div>

              <div className="space-y-3 pt-2 max-h-96 overflow-y-auto scrollbar-hide">
                {recommendedSchemes.map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-sm hover:border-primary transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-[#0F5238] text-[9px] font-bold uppercase rounded border border-emerald-100">
                          100% Eligible
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.category}</span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mt-1">{s.title}</h5>
                      <p className="text-slate-500 text-[11px] leading-normal">{s.criteria} • {s.benefit}</p>
                    </div>
                    <button
                      onClick={() => onSelectScheme(s)}
                      className="px-3 py-1.5 bg-primary hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg transition shrink-0 self-center border-none cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/60 text-[11px] text-slate-600 leading-normal flex items-start gap-2.5 mt-4">
              <span className="material-symbols-outlined text-emerald-700 text-sm">auto_awesome</span>
              <p>Our recommendation engine analyzed your landholdings, water security profile, and annual credit requirements to filter government schemes with immediate direct transfer capabilities.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
