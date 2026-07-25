// AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { marketApi } from "../services/marketApi";

interface ScraperLog {
  id: string;
  run_time: string;
  rows_inserted: number;
  rows_updated: number;
  rows_failed: number;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  errors: string | null;
  next_run: string | null;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeErrorLog, setActiveErrorLog] = useState<ScraperLog | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await marketApi.getScraperStats();
      setLogs(data);
    } catch (err: any) {
      console.error("Failed to fetch scraper logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerScrapeNow = async () => {
    try {
      setIsTriggering(true);
      setStatusMessage("Triggering Tamil Nadu Mandi scraper in the background...");
      const result = await marketApi.triggerScrape();
      setStatusMessage(result.message || "Scraper triggered successfully. Logs will update shortly.");
      
      // Wait 5 seconds and poll logs to see if it finished or started
      setTimeout(async () => {
        const data = await marketApi.getScraperStats();
        setLogs(data);
        setIsTriggering(false);
      }, 5000);
    } catch (err: any) {
      console.error("Failed to trigger scraper:", err);
      setStatusMessage("Failed to start scraper. Please try again.");
      setIsTriggering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Success
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Failed
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const latestLog = logs[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-scale-in text-left px-4 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-2 bg-transparent border-none cursor-pointer p-0"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Profile
          </button>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-[#0F5238]">admin_panel_settings</span>
            Scraper Settings & Control Panel
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor background cron jobs, inspect execution logs, and manually refresh live mandi rates.
          </p>
        </div>

        <button
          onClick={triggerScrapeNow}
          disabled={isTriggering || isLoading}
          className={`flex items-center gap-2 bg-[#0F5238] hover:bg-[#1B4332] disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-sm ${
            isTriggering ? "animate-pulse" : ""
          }`}
        >
          <span className={`material-symbols-outlined ${isTriggering ? "animate-spin" : ""}`}>
            {isTriggering ? "sync" : "play_circle"}
          </span>
          <span>{isTriggering ? "Running Scraper..." : "Run Scraper Now"}</span>
        </button>
      </div>

      {/* Notifications bar */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">info</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{statusMessage}</p>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 bg-transparent border-none cursor-pointer p-0"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-[#0F5238] rounded-xl">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Scraper Status</p>
            <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">
              {latestLog ? getStatusBadge(latestLog.status) : "No runs yet"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-xl">
            <span className="material-symbols-outlined text-2xl">add_shopping_cart</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Latest Rows Processed</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {latestLog ? latestLog.rows_inserted + latestLog.rows_updated : 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
            <span className="material-symbols-outlined text-2xl">update</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Run Time</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
              {latestLog ? formatDate(latestLog.run_time) : "Never"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
            <span className="material-symbols-outlined text-2xl">alarm</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Next Scheduled Run</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
              {latestLog && latestLog.next_run ? formatDate(latestLog.next_run) : "7:00 AM / 11:00 AM / 3:00 PM"}
            </p>
          </div>
        </div>
      </div>

      {/* Scraper Run History List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">Execution Logs</h3>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1 text-xs font-semibold text-[#0F5238] hover:text-[#1B4332] bg-transparent border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Logs
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#beead1] border-t-[#0F5238] rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading log history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 flex flex-col justify-center items-center gap-2">
            <span className="material-symbols-outlined text-4xl">database_off</span>
            <p className="text-sm font-semibold">No scraper logs found in the database.</p>
            <p className="text-xs">Run the scraper manually or connect Supabase credentials to save logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Run Date/Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Inserted</th>
                  <th className="px-6 py-4 text-center">Updated</th>
                  <th className="px-6 py-4 text-center">Failed</th>
                  <th className="px-6 py-4">Errors / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(log.run_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {log.rows_inserted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-blue-600 dark:text-blue-400">
                      {log.rows_updated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-rose-600 dark:text-rose-400">
                      {log.rows_failed}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {log.errors ? (
                        <button
                          onClick={() => setActiveErrorLog(log)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline bg-transparent border-none cursor-pointer p-0"
                        >
                          View {log.errors.split("\n").length} Error(s)
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">No errors</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error Details Modal */}
      {activeErrorLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                <h4 className="font-bold text-lg font-display">Scraper Error Report</h4>
              </div>
              <button
                onClick={() => setActiveErrorLog(null)}
                className="text-white hover:text-rose-100 bg-transparent border-none cursor-pointer p-0"
              >
                <span className="material-symbols-outlined text-2xl font-bold">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-semibold text-xs">Run Date</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatDate(activeErrorLog.run_time)}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-xs">Failed Rows</span>
                  <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">{activeErrorLog.rows_failed} items</p>
                </div>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Error Messages Log</span>
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono overflow-auto max-h-[300px] border border-slate-900 leading-relaxed">
                  {activeErrorLog.errors}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveErrorLog(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-5 rounded-xl text-sm border-none cursor-pointer transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
