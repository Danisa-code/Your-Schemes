import React, { useState } from "react";
import { Scheme, VerificationStatus, ApplicationType, GovernmentLevel } from "../types";
import { SCHEMES } from "../data";
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Edit2, Lock, FileSpreadsheet, Search, Check, X } from "lucide-react";

export const SchemeUrlAdminPanel: React.FC = () => {
  const [schemesList, setSchemesList] = useState<Scheme[]>(() => {
    const saved = localStorage.getItem("your_schemes_admin_schemes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SCHEMES;
      }
    }
    return SCHEMES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showAuditReport, setShowAuditReport] = useState(false);

  // Form edit states
  const [editInfoUrl, setEditInfoUrl] = useState("");
  const [editAppUrl, setEditAppUrl] = useState("");
  const [editStatus, setEditStatus] = useState<VerificationStatus>("VERIFIED");
  const [editAppType, setEditAppType] = useState<ApplicationType>("ONLINE");
  const [editGovLevel, setEditGovLevel] = useState<GovernmentLevel>("CENTRAL");

  // Save modified list to local storage
  const saveSchemesList = (newList: Scheme[]) => {
    setSchemesList(newList);
    localStorage.setItem("your_schemes_admin_schemes", JSON.stringify(newList));
  };

  // Open edit modal for a scheme
  const handleOpenEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setEditInfoUrl(scheme.official_info_url || "");
    setEditAppUrl(scheme.official_application_url || "");
    setEditStatus(scheme.verification_status || "VERIFICATION_REQUIRED");
    setEditAppType(scheme.application_type || "ONLINE");
    setEditGovLevel(scheme.government_level || "CENTRAL");
    setValidationError(null);
  };

  // URL Security Validator (Section 9)
  const validateUrl = (urlStr: string): string | null => {
    if (!urlStr.trim()) return null; // Null/Empty is allowed for OFFLINE/Unavailable links

    const trimmed = urlStr.trim().toLowerCase();

    // Block unsafe protocols
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("file:") ||
      trimmed.startsWith("http://") ||
      trimmed.includes("localhost") ||
      trimmed.includes("127.0.0.1")
    ) {
      return "SECURITY ERROR: Only secure HTTPS URLs (https://) are permitted. Unsafe schemes (javascript:, data:, file:, localhost:, http:) are forbidden.";
    }

    if (!trimmed.startsWith("https://")) {
      return "VALIDATION ERROR: URL must begin with https://";
    }

    try {
      new URL(trimmed);
    } catch (e) {
      return "INVALID URL: Please enter a valid URL structure.";
    }

    return null;
  };

  // Save edits
  const handleSaveEdit = () => {
    if (!editingScheme) return;

    // Validate Info URL
    if (editInfoUrl) {
      const err = validateUrl(editInfoUrl);
      if (err) {
        setValidationError(err);
        return;
      }
    }

    // Validate Application URL
    if (editAppUrl) {
      const err = validateUrl(editAppUrl);
      if (err) {
        setValidationError(err);
        return;
      }
    }

    // Extract domain from Application URL or Info URL
    let domain: string | null = null;
    if (editAppUrl) {
      try {
        domain = new URL(editAppUrl).hostname;
      } catch (e) {
        domain = null;
      }
    } else if (editInfoUrl) {
      try {
        domain = new URL(editInfoUrl).hostname;
      } catch (e) {
        domain = null;
      }
    }

    const updatedDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const updatedList = schemesList.map((s) => {
      if (s.id === editingScheme.id) {
        return {
          ...s,
          official_info_url: editInfoUrl.trim() || null,
          official_application_url: editAppUrl.trim() || null,
          official_source_domain: domain,
          verification_status: editStatus,
          application_type: editAppType,
          government_level: editGovLevel,
          last_verified_date: updatedDate,
        };
      }
      return s;
    });

    saveSchemesList(updatedList);
    setEditingScheme(null);
    setStatusMsg(`Successfully updated official URLs for ${editingScheme.title}`);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Verify Reachability simulation (Section 8 & 14)
  const handleVerifyUrlReachability = (scheme: Scheme) => {
    if (!scheme.official_application_url && !scheme.official_info_url) {
      alert("No URL configured for this scheme to verify.");
      return;
    }

    const targetUrl = scheme.official_application_url || scheme.official_info_url || "";
    let domain = "";
    try {
      domain = new URL(targetUrl).hostname;
    } catch (e) {}

    const isOfficialDomain =
      domain.endsWith(".gov.in") ||
      domain.endsWith(".nic.in") ||
      domain.includes("tn.gov.in") ||
      domain.includes("teda.in");

    if (!isOfficialDomain) {
      alert(
        `WARNING: Target domain (${domain}) is not a verified government domain (.gov.in / .nic.in / official state portal). Verification set to VERIFICATION_REQUIRED.`
      );
    } else {
      alert(
        `SUCCESS: Official domain (${domain}) verified successfully! Status marked as VERIFIED.`
      );
    }

    const updatedList = schemesList.map((s) => {
      if (s.id === scheme.id) {
        return {
          ...s,
          verification_status: isOfficialDomain ? ("VERIFIED" as const) : ("VERIFICATION_REQUIRED" as const),
          last_verified_date: new Date().toISOString().split("T")[0],
        };
      }
      return s;
    });

    saveSchemesList(updatedList);
  };

  const filteredSchemes = schemesList.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.name_ta && s.name_ta.includes(searchQuery)) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Security Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold font-display">Scheme Official Link Management</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Manage scheme-specific official government application URLs. Enforce HTTPS security rules and audit verification statuses for Tamil Nadu & Central government schemes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuditReport(!showAuditReport)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{showAuditReport ? "Hide Audit Report" : "Generate Audit Report"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {statusMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter schemes by name or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* AUDIT REPORT VIEW (Section 17) */}
      {showAuditReport && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Full Government Scheme Link Audit Report</span>
            </h3>
            <span className="text-xs text-slate-500">Total Schemes: {schemesList.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Scheme Name</th>
                  <th className="p-3">Dept / Level</th>
                  <th className="p-3">Info URL</th>
                  <th className="p-3">Application URL</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schemesList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.title}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{s.government_level}</span>
                      <br />
                      <span className="text-[10px] text-slate-400">{s.department?.slice(0, 30)}...</span>
                    </td>
                    <td className="p-3 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                      {s.official_info_url ? (
                        <a href={s.official_info_url} target="_blank" rel="noreferrer" className="hover:underline">
                          Link ↗
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      {s.official_application_url ? (
                        <a href={s.official_application_url} target="_blank" rel="noreferrer" className="hover:underline">
                          Portal ↗
                        </a>
                      ) : (
                        <span className="text-slate-400">NULL</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                      {s.official_source_domain || "N/A"}
                    </td>
                    <td className="p-3 font-bold text-[10px]">{s.application_type || "ONLINE"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.verification_status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : s.verification_status === "OFFLINE"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {s.verification_status || "VERIFICATION_REQUIRED"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[10px]">
                      {s.last_verified_date || "Not Verified"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEMES MANAGEMENT TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Scheme Details</th>
                <th className="p-4">Official Application Portal</th>
                <th className="p-4">Type</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4">Last Verified</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchemes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{s.title}</p>
                    {s.name_ta && <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">{s.name_ta}</p>}
                    <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1 block">
                      {s.government_level} • {s.department?.slice(0, 35)}...
                    </span>
                  </td>

                  <td className="p-4 font-mono text-xs">
                    {s.official_application_url ? (
                      <a
                        href={s.official_application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{s.official_source_domain || "Official Link"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No online portal (NULL)</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-700 dark:text-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px]">
                      {s.application_type || "ONLINE"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.verification_status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : s.verification_status === "OFFLINE"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{s.verification_status || "VERIFICATION_REQUIRED"}</span>
                    </span>
                  </td>

                  <td className="p-4 font-mono text-slate-500 text-[11px]">
                    {s.last_verified_date || "—"}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleVerifyUrlReachability(s)}
                      className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl font-bold text-[11px] transition cursor-pointer"
                      title="Verify domain reachability and SSL"
                    >
                      Verify URL
                    </button>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 rounded-xl font-bold text-[11px] transition flex-inline items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 inline mr-1" />
                      <span>Edit Links</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SCHEME URLS MODAL */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setEditingScheme(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lock className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Official Government Links
                </h3>
                <p className="text-slate-500 text-xs">{editingScheme.title}</p>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-950/80 border border-rose-600/50 rounded-xl text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Official Information URL (HTTPS)
                </label>
                <input
                  type="text"
                  value={editInfoUrl}
                  onChange={(e) => setEditInfoUrl(e.target.value)}
                  placeholder="https://pmkisan.gov.in/"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Official Application URL (HTTPS)
                </label>
                <input
                  type="text"
                  value={editAppUrl}
                  onChange={(e) => setEditAppUrl(e.target.value)}
                  placeholder="https://pmkisan.gov.in/NewFarmerRegistration.aspx (or leave blank for OFFLINE)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Application Type
                  </label>
                  <select
                    value={editAppType}
                    onChange={(e) => setEditAppType(e.target.value as ApplicationType)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="BOTH">BOTH</option>
                    <option value="INFORMATION_ONLY">INFORMATION_ONLY</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Verification Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as VerificationStatus)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="VERIFICATION_REQUIRED">VERIFICATION_REQUIRED</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="LINK_UNAVAILABLE">LINK_UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Government Level
                </label>
                <select
                  value={editGovLevel}
                  onChange={(e) => setEditGovLevel(e.target.value as GovernmentLevel)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="CENTRAL">CENTRAL (Central Govt Portal)</option>
                  <option value="TAMIL_NADU">TAMIL_NADU (Tamil Nadu Dept Portal)</option>
                  <option value="CENTRAL_AND_STATE">CENTRAL_AND_STATE (Joint Route)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setEditingScheme(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-[#0F5238] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Save Official Links
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
