import React, { useState } from "react";
import { Scheme } from "../types";
import { SCHEMES } from "../data";

interface CalendarWidgetProps {
  onSelectScheme: (scheme: Scheme) => void;
  lang: string;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onSelectScheme, lang }) => {
  // Calendar defaults to July 2026 (current context)
  const [currentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // List of deadlines for July/August 2026
  const schemeDeadlines = SCHEMES.map(s => {
    const parts = s.lastDate ? s.lastDate.split("-") : [];
    return {
      scheme: s,
      year: parts[0] ? parseInt(parts[0]) : 2026,
      month: parts[1] ? parseInt(parts[1]) - 1 : 0, // 0-indexed
      day: parts[2] ? parseInt(parts[2]) : 1,
    };
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Blank days before the 1st
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      // Keep it inside July/August for our demo deadlines
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if day has a deadline
  const getDeadlinesForDay = (day: number) => {
    return schemeDeadlines.filter(d => d.year === currentYear && d.month === currentMonth && d.day === day);
  };

  // Document checklist state
  const [checklistSchemeId, setChecklistSchemeId] = useState(SCHEMES[0].id);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, Record<string, boolean>>>({
    kisan_credit_card: {
      "Aadhaar Card (Identity & Address Proof)": true,
      "Pattadar Passbook / Land Holding Record Copy": false,
      "No-Due Certificate from local financial institutions": false,
      "Passport-sized photograph of applicant": true
    },
    pm_fasal_bima: {
      "Land Patta / Land Registry / Possession Certificate": true,
      "Sowing Certificate issued by Patwari/Agricultural Officer": false,
      "Bank Account details (with cancelled cheque/passbook copy)": true,
      "Aadhaar Card": true
    }
  });

  const selectedChecklistScheme = SCHEMES.find(s => s.id === checklistSchemeId) || SCHEMES[0];
  const schemeDocs = selectedChecklistScheme.documents || [];

  const handleDocToggle = (schemeId: string, doc: string) => {
    setCheckedDocs(prev => {
      const schemeChecked = prev[schemeId] || {};
      return {
        ...prev,
        [schemeId]: {
          ...schemeChecked,
          [doc]: !schemeChecked[doc]
        }
      };
    });
  };

  const calculateProgress = (schemeId: string, docs: string[]) => {
    if (!docs.length) return 0;
    const schemeChecked = checkedDocs[schemeId] || {};
    const checkedCount = docs.filter(d => schemeChecked[d]).length;
    return Math.round((checkedCount / docs.length) * 100);
  };

  const progress = calculateProgress(checklistSchemeId, schemeDocs);

  // Active deadline card selected on calendar click
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const activeDayDeadlines = selectedCalendarDay ? getDeadlinesForDay(selectedCalendarDay) : [];

  return (
    <div id="calendar-doc-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* 1. EXPIRING SCHEMES CALENDAR (7 COLS) */}
      <div id="expiring-calendar-card" className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              Expiring Schemes Calendar
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Track application deadlines to secure benefits before they expire.</p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-[85px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {totalSlots.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/40 rounded-xl border border-transparent"></div>;
              }

              const dayDeadlines = getDeadlinesForDay(day);
              const isToday = day === 8 && currentMonth === 6; // Mock July 8th, 2026 today
              const hasDeadlines = dayDeadlines.length > 0;
              const isSelected = selectedCalendarDay === day;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                  className={`aspect-square rounded-xl border relative flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-950 scale-[1.03]"
                      : isToday
                      ? "bg-emerald-50 border-emerald-400 text-[#0F5238] font-black"
                      : hasDeadlines
                      ? "bg-rose-50 border-rose-200 hover:border-rose-400 text-rose-800 font-bold"
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  
                  {isToday && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  )}

                  {hasDeadlines && (
                    <div className="flex gap-0.5 mt-0.5 justify-center">
                      {dayDeadlines.map((_, dIdx) => (
                        <span key={dIdx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-rose-500 animate-pulse"}`}></span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Deadlines Info */}
        <div className="mt-4">
          {selectedCalendarDay ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 animate-scale-in">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Deadlines on {monthNames[currentMonth]} {selectedCalendarDay}, 2026
                </span>
                <button 
                  onClick={() => setSelectedCalendarDay(null)}
                  className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {activeDayDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {activeDayDeadlines.map((dl, idx) => (
                    <div key={idx} className="flex items-start justify-between bg-white border border-rose-100 rounded-xl p-3 shadow-sm hover:border-rose-300 transition">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded-full uppercase">
                          Last Date to Apply
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{dl.scheme.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{dl.scheme.criteria} • {dl.scheme.benefit}</p>
                      </div>
                      <button
                        onClick={() => onSelectScheme(dl.scheme)}
                        className="px-3 py-1.5 bg-primary hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition border-none cursor-pointer shrink-0 self-center"
                      >
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No scheme deadlines on this date. Feel free to prepare your applications early.</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600">info</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold block text-slate-800 mb-0.5">Quick Guide:</span>
                Click on the <span className="text-rose-700 font-bold">highlighted reddish dates</span> on the calendar above to instantly view which central schemes expire on those days.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 2. DYNAMIC DOCUMENT CHECKLIST (5 COLS) */}
      <div id="document-checklist-card" className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
              Document Checklist
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Prepare and tick off documents before starting the application.</p>
          </div>

          {/* Scheme selector dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Scheme</label>
            <div className="relative">
              <select
                value={checklistSchemeId}
                onChange={(e) => setChecklistSchemeId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold appearance-none focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {SCHEMES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Checklist Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Preparation Progress</span>
              <span className="font-mono font-bold text-[#0F5238]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-2.5 pt-2">
            {schemeDocs.length > 0 ? (
              schemeDocs.map((doc, idx) => {
                const isChecked = checkedDocs[checklistSchemeId]?.[doc] || false;
                return (
                  <label 
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked 
                        ? "border-emerald-200 bg-emerald-50/30 text-emerald-900" 
                        : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDocToggle(checklistSchemeId, doc)}
                      className="mt-0.5 w-4.5 h-4.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs font-medium leading-relaxed">{doc}</span>
                  </label>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No specific documents specified for this scheme.</p>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900/90 leading-relaxed flex items-start gap-2.5">
          <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">lightbulb</span>
          <p>
            Keep digital copies of checked documents under <span className="font-bold">5MB</span> in <span className="font-bold">PDF or JPEG</span> format. You can upload them directly during the multi-step form!
          </p>
        </div>

      </div>

    </div>
  );
};
