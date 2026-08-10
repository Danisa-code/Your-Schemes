import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { api, MandiPrice, HistoricalPrice } from "../services/api";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SortConfig {
  key: keyof MandiPrice | null;
  direction: "asc" | "desc";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};

function downloadCSV(data: MandiPrice[]) {
  const headers = ["Commodity", "Market", "District", "State", "Arrival Date", "Price (Approx)", "Unit"];
  const rows = data.map(r => [r.commodity, r.market, r.district, r.state, r.arrivalDate, r.modalPrice, r.unit]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mandi-prices-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-900"></div>
      <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
    </div>
  </div>
);

const ErrorCard = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-red-500">error_outline</span>
    </div>
    <p className="text-center text-slate-600 dark:text-slate-400 max-w-sm font-medium">{message}</p>
    {onRetry && (
      <button onClick={onRetry}
        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition">
        Try Again
      </button>
    )}
  </div>
);

const EmptyState = ({ district, commodity }: { district?: string; commodity?: string }) => {
  const details = [district, commodity].filter(Boolean).join(" and ");
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-slate-400">find_in_page</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
        {details 
          ? `No mandi prices available for the selected ${details.toLowerCase()}.`
          : "No mandi prices available for the selected district and commodity."}
      </p>
    </div>
  );
};

// ─── History Modal ─────────────────────────────────────────────────────────────

const HistoryModal = ({
  row, onClose,
}: { row: MandiPrice; onClose: () => void }) => {
  const [history, setHistory] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.getHistory(row.commodity, row.market)
      .then(d => { if (!cancelled) { setHistory(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [row.commodity, row.market]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1a1f2e] rounded-3xl p-6 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{row.commodity} — {row.market}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Historical Prices (₹/Quintal)</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 transition">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {loading ? <Spinner /> : error ? <ErrorCard message={error} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v as number / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(v) => [`₹${v}`, "Price (Approx)"]}
                labelFormatter={l => `Date: ${l}`}
                contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="modalPrice"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0d9488" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

// ─── Summary Cards ────────────────────────────────────────────────────────────

const SummaryCards = ({ data, lastUpdated }: { data: MandiPrice[]; lastUpdated: string }) => {
  const modalPrices = data.map(d => d.modalPrice);
  const highest = Math.max(...modalPrices);
  const lowest = Math.min(...modalPrices);
  const avg = Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length);

  const cards = [
    { icon: "store", label: "Total Markets", value: data.length.toString(), color: "teal" },
    { icon: "trending_up", label: "Highest Price", value: formatCurrency(highest), color: "green" },
    { icon: "trending_down", label: "Lowest Price", value: formatCurrency(lowest), color: "orange" },
    { icon: "analytics", label: "Average Price", value: formatCurrency(avg), color: "blue" },
  ];

  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${colorMap[c.color]}`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{c.label}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{c.value}</p>
        </div>
      ))}
      <div className="col-span-2 lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-2.5 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last Updated: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(lastUpdated)}</span>
        </p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const LiveMandiPrices: React.FC = () => {
  // Filter state
  const [commodities, setCommodities] = useState<{ id: string; name: string }[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);

  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Results state
  const [results, setResults] = useState<MandiPrice[]>([]);
  const [isCached, setIsCached] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // History modal
  const [selectedRow, setSelectedRow] = useState<MandiPrice | null>(null);

  // Auto-refresh
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSearchParamsRef = useRef<{ commodity: string; state: string; district: string; market: string; date: string } | null>(null);


  useEffect(() => {
    setSelectedDistrict("");
    setSelectedMarket("");
    setDistricts([]);
    setMarkets([]);
    if (selectedState) {
      api.getDistricts(selectedState).then(setDistricts).catch(console.error);
    }
  }, [selectedState]);

  useEffect(() => {
    setSelectedMarket("");
    setMarkets([]);
    if (selectedDistrict) {
      api.getMarkets(selectedDistrict).then(setMarkets).catch(console.error);
    }
  }, [selectedDistrict]);

  const fetchPrices = useCallback(async (params?: { commodity: string; state: string; district: string; market: string; date: string }) => {
    const p = params ?? lastSearchParamsRef.current;
    if (!p) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.getLiveMandiPrices({
        commodity: p.commodity || undefined,
        district: p.district || undefined,
        market: p.market || undefined,
        date: p.date || undefined,
      });
      console.log("API Response:", res);
      setResults(res.data);
      setIsCached(res.isCached);
      setLastUpdated(res.lastUpdated);
      setHasSearched(true);
      setCurrentPage(1);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to fetch mandi prices.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial dropdown data
  useEffect(() => {
    Promise.all([api.getCommodities(), api.getStates()])
      .then(([comms, sts]) => {
        setCommodities(comms);
        setStates(sts);
        setSelectedState("Tamil Nadu");
      })
      .catch(console.error);
  }, []);

  // Auto trigger fetch when filters change
  useEffect(() => {
    if (!selectedState && !selectedDistrict && !selectedCommodity) return;

    console.log("District:", selectedDistrict);
    console.log("Commodity:", selectedCommodity);

    const params = {
      commodity: selectedCommodity,
      state: selectedState,
      district: selectedDistrict,
      market: selectedMarket,
      date: selectedDate,
    };
    lastSearchParamsRef.current = params;

    // Set up 15-minute auto refresh
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => fetchPrices(params), 15 * 60 * 1000);

    fetchPrices(params);
  }, [selectedDistrict, selectedCommodity, selectedMarket, selectedDate, selectedState, fetchPrices]);

  const handleSearch = () => {
    const params = {
      commodity: selectedCommodity,
      state: selectedState,
      district: selectedDistrict,
      market: selectedMarket,
      date: selectedDate,
    };
    lastSearchParamsRef.current = params;
    fetchPrices(params);
  };

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  // Table processing
  const filtered = results.filter(r =>
    searchQuery === "" ||
    Object.values(r).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const cmp = typeof aVal === "number" ? (aVal as number) - (bVal as number) : String(aVal).localeCompare(String(bVal));
    return sortConfig.direction === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key: keyof MandiPrice) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ col }: { col: keyof MandiPrice }) => (
    <span className="material-symbols-outlined text-sm ml-1 opacity-60">
      {sortConfig.key === col ? (sortConfig.direction === "asc" ? "expand_less" : "expand_more") : "unfold_more"}
    </span>
  );

  return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Live Mandi Prices</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time agricultural market prices from AGMARKNET</p>
          </div>
        </div>
      </motion.div>

      {/* Filter Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-[#1a1f2e] rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-5"
      >
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">filter_alt</span>
          Filter Prices
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Commodity */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Commodity</label>
            <div className="relative">
              <select
                aria-label="Select Commodity"
                value={selectedCommodity}
                onChange={e => setSelectedCommodity(e.target.value)}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Commodities</option>
                {commodities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">State</label>
            <div className="relative">
              <select
                aria-label="Select State"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                disabled={true}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-not-allowed opacity-75"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">lock</span>
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">District</label>
            <div className="relative">
              <select
                aria-label="Select District"
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                disabled={!selectedState || districts.length === 0}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
            </div>
          </div>

          {/* Market */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Market (Mandi)</label>
            <div className="relative">
              <select
                aria-label="Select Market"
                value={selectedMarket}
                onChange={e => setSelectedMarket(e.target.value)}
                disabled={!selectedDistrict || markets.length === 0}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Markets</option>
                {markets.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Date</label>
            <input
              type="date"
              aria-label="Select Date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            id="get-prices-btn"
            onClick={handleSearch}
            disabled={loading}
            aria-label="Get Prices"
            className="flex-1 sm:flex-none h-12 px-8 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20 active:scale-[0.98]"
          >
            {loading
              ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> Fetching...</>
              : <><span className="material-symbols-outlined">search</span> Get Prices</>}
          </button>

          {hasSearched && (
            <button
              onClick={() => fetchPrices()}
              aria-label="Refresh Prices"
              className="h-12 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center gap-2 transition"
            >
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          )}
        </div>
      </motion.div>

      {/* Cached data notice */}
      <AnimatePresence>
        {isCached && hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Showing the latest available cached market prices. Live data is temporarily unavailable.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Spinner /></motion.div>}

        {!loading && error && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorCard message={error} onRetry={handleSearch} />
          </motion.div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState district={selectedDistrict} commodity={selectedCommodity} />
          </motion.div>
        )}

        {!loading && !error && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary Cards */}
            <SummaryCards data={results} lastUpdated={lastUpdated} />

            {/* Results Table */}
            <div className="bg-white dark:bg-[#1a1f2e] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Table toolbar */}
              <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    aria-label="Search table"
                    placeholder="Search in results..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <button
                  aria-label="Download CSV"
                  onClick={() => downloadCSV(results)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden sm:inline">Download CSV</span>
                </button>
                <button
                  aria-label="Print Table"
                  onClick={() => window.print()}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span className="hidden sm:inline">Print</span>
                </button>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto whitespace-nowrap">
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Scrollable table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Mandi Prices Table">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-left">
                      {(["commodity", "market", "district", "state", "arrivalDate", "modalPrice"] as const).map(col => (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          role="columnheader"
                          aria-sort={sortConfig.key === col ? (sortConfig.direction === "asc" ? "ascending" : "descending") : "none"}
                          className="px-4 py-3.5 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition whitespace-nowrap sticky top-0 bg-slate-50 dark:bg-slate-800/80 z-10"
                        >
                          {{
                            commodity: "Commodity", market: "Market", district: "District", state: "State",
                            arrivalDate: "Arrival Date", modalPrice: "Price (Approx)",
                          }[col]}
                          <SortIcon col={col} />
                        </th>
                      ))}
                      <th className="px-4 py-3.5 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50 dark:bg-slate-800/80 z-10">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginated.map((row, i) => (
                      <tr
                        key={i}
                        onClick={() => setSelectedRow(row)}
                        tabIndex={0}
                        role="row"
                        aria-label={`${row.commodity} at ${row.market}. Click for price history`}
                        onKeyDown={e => { if (e.key === "Enter") setSelectedRow(row); }}
                        className="hover:bg-teal-50/50 dark:hover:bg-teal-900/10 cursor-pointer transition group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                      >
                        <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{row.commodity}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.market}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.district}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.state}</td>
                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(row.arrivalDate)}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg font-bold text-sm">
                            {formatCurrency(row.modalPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      aria-label="Previous page"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                      const pg = idx + 1;
                      return (
                        <button
                          key={pg}
                          aria-label={`Page ${pg}`}
                          aria-current={currentPage === pg ? "page" : undefined}
                          onClick={() => setCurrentPage(pg)}
                          className={`h-9 w-9 rounded-xl text-sm font-bold transition ${currentPage === pg ? "bg-teal-600 text-white shadow-sm" : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      aria-label="Next page"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">touch_app</span>
              Click any row to view historical price trend
            </p>
          </motion.div>
        )}

        {!hasSearched && !loading && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-teal-500" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Check Today's Mandi Prices</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-xs">
              Select your commodity and location, then click <strong>Get Prices</strong> to view live market rates.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {selectedRow && (
          <HistoryModal row={selectedRow} onClose={() => setSelectedRow(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
