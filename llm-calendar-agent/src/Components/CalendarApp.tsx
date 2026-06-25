/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DEFAULT_EVENTS, getDaysInMonth, formatDateLong, getWeekDays } from './calendarData';
import { CalendarEvent, CalendarView } from '../types';
import { io } from 'socket.io-client';


const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; 

export default function CalendarApp() {
  // View states
  const [view, setView] = useState<CalendarView>('Month');
  
  // Storage & state for events
//   const [events, setEvents] = useState<CalendarEvent[]>(() => {
//     const saved = localStorage.getItem('calendar_dashboard_events');
//     return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
//   });

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  

// Points natively to window.location.origin (e.g. http://localhost:3000)
const socket = io('http://localhost:3006');

socket.on('db_sync_update', (data) => {
  console.log("Database file updated over middleware mode!", data);
});


useEffect(() => {
    async function loadInitialEvents() {
      try {
    

        const res = await fetch(`${baseUrl}/api/calendar/events`);
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const initialData = await res.json();
        console.log(initialData.data)
        setEvents(initialData.data);
      } catch (error) {
        console.error("Failed loading baseline matrix events:", error);
      } finally {
 
      }
    }

    loadInitialEvents();
  }, []); // Empty dependency array ensures this runs exactly once on mount [4]

  // 3. Real-time WebSocket synchronization channel
  useEffect(() => {
    socket.on('db_sync_update', (data: { calendarEvents?: CalendarEvent[] }) => {
      console.log('⚡ Catching backend real-time broadcast payload:', data);
      if (data.calendarEvents) {
        setEvents(data.calendarEvents);
      }
    });

    return () => {
      socket.off('db_sync_update');
    };
  }, []);

  // Current year & month for calendar navigation (default: June 2026)
  const [navYear, setNavYear] = useState(2026);
  const [navMonth, setNavMonth] = useState(5); // June (0-indexed)

  // Primary selected date (default: June 18, 2026 string)
  const [selectedDate, setSelectedDate] = useState('2026-06-18');
  
  // Custom header date: Starts at exactly "13 Jun 2026" as specified
  const [headerDate, setHeaderDate] = useState('13 Jun 2026');

  // Interactive Form drawer state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('9.00 AM – 10.30 PM');
  const [newColor, setNewColor] = useState<'blue' | 'green' | 'beige'>('blue');
  const [toastMessage, setToastMessage] = useState<string | null>(null);



    // Sync state with server backend and localStorage
  const syncWithServer = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/calendar/events`);
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setEvents(json.data);
       // localStorage.setItem('calendar_dashboard_events', JSON.stringify(json.data));
      }
    } catch (err) {
      console.error('Failed to sync events with server:', err);
    }
  };

    // Sync state when local storage is seeded or modified by AI Agent custom tools
//   useEffect(() => {
//     const handleSync = () => {
//       const saved = localStorage.getItem('calendar_dashboard_events');
//       if (saved) {
//         setEvents(JSON.parse(saved));
//       }
//       syncWithServer();
//     };
//     window.addEventListener('storage', handleSync);
//     window.addEventListener('agent-tools-update', handleSync);
//     return () => {
//       window.removeEventListener('storage', handleSync);
//       window.removeEventListener('agent-tools-update', handleSync);
//     };
//   }, []);

//   // Sync state with localStorage
//   useEffect(() => {
//     localStorage.setItem('calendar_dashboard_events', JSON.stringify(events));
//   }, [events]);

//   // Sync state when local storage is seeded or modified by AI Agent custom tools
//   useEffect(() => {
//     const handleSync = () => {
//       const saved = localStorage.getItem('calendar_dashboard_events');
//       if (saved) {
//         setEvents(JSON.parse(saved));
//       }
//     };
//     window.addEventListener('storage', handleSync);
//     window.addEventListener('agent-tools-update', handleSync);
//     return () => {
//       window.removeEventListener('storage', handleSync);
//       window.removeEventListener('agent-tools-update', handleSync);
//     };
//   }, []);

  // Format header display dynamically after user starts selecting
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setHeaderDate(formatDateLong(dateStr));
    
    // Also change nav elements to that month if navigated from week
    const [y, m] = dateStr.split('-').map(Number);
    setNavYear(y);
    setNavMonth(m - 1);
  };

  // Toast notifier helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to default state helper
  const handleReset = () => {
    setEvents(DEFAULT_EVENTS);
    setSelectedDate('2026-06-18');
    setHeaderDate('13 Jun 2026');
    setNavYear(2026);
    setNavMonth(5);
    setView('Month');
    triggerToast('Dashboard reset to defaults');
  };

   // Add event action
  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${baseUrl}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          time: newTime.trim(),
          date: selectedDate,
          color: newColor
        })
      });
      const json = await res.json();
      if (json && json.success) {
        setNewTitle('');
        setNewTime('9.00 AM – 10.30 PM');
        setShowAddForm(false);
        triggerToast(`"${newTitle.trim()}" scheduled!`);
        syncWithServer();
      }
    } catch (err) {
      console.error('Failed to schedule event on server:', err);
    }
  };

  // Delete event action
  const handleDeleteEvent = async (id: string, name: string) => {
    try {
      await fetch(`${baseUrl}/api/calendar/events/${id}`, {
        method: 'DELETE'
      });
      triggerToast(`Removed "${name}"`);
      syncWithServer();
    } catch (err) {
      console.error('Failed to delete event on server:', err);
    }
  };


  // Pre-calculate month name and calendar grid
  const monthName = useMemo(() => {
    return new Date(navYear, navMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [navYear, navMonth]);

  const daysGrid = useMemo(() => {
    return getDaysInMonth(navYear, navMonth);
  }, [navYear, navMonth]);

  // Handle month traversal
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(prev => prev - 1);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  // Handle next month traversal
  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(prev => prev + 1);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  // Extract matching events for current selected date or general month
  const selectedDayEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDate);
  }, [events, selectedDate]);

  // Set visual color templates
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-[#dfe7f5]',
          border: 'border-[#1e3a8a]/10 hover:border-[#1e3a8a]/30',
          text: 'text-[#1e3a8a]',
          pill: 'bg-[#1d3766]/10'
        };
      case 'green':
        return {
          bg: 'bg-[#dcebcf]',
          border: 'border-[#166534]/10 hover:border-[#166534]/30',
          text: 'text-[#166534]',
          pill: 'bg-[#166534]/10'
        };
      case 'beige':
        return {
          bg: 'bg-[#efe0d3]',
          border: 'border-[#7c2d12]/10 hover:border-[#7c2d12]/30',
          text: 'text-[#7c2d12]',
          pill: 'bg-[#7c2d12]/10'
        };
      default:
        return {
          bg: 'bg-[#f3f4f6]',
          border: 'border-slate-200 hover:border-slate-300',
          text: 'text-slate-800',
          pill: 'bg-slate-200'
        };
    }
  };

  // Determine if a specific day string contains any events (for dots)
  const daysWithEvents = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => set.add(e.date));
    return set;
  }, [events]);

  return (
    <div className="w-full max-w-[430px] flex flex-col  font-sans antialiased text-[#222222]">

      {/* Main Calendar Card Grid */}
      <div 
        className="w-full max-w-[360px] h-[540px] bg-[#ffffff] border-[1.5px] border-[#1d3766] rounded-lg shadow-[0_12px_40px_rgba(29,55,102,0.08)] flex flex-col justify-between overflow-hidden relative"
        id="calendar-main-card"
      >
        {/* Toast Notifier */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#1d3766] text-white px-3 py-1.5 rounded-full text-[11px] font-medium shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#9bd08a]" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Container so adding tasks never overflows the strict layout */}
        <div className="flex-1 flex flex-col p-[12px] overflow-y-auto no-scrollbar">
          
          {/* Top Header - Date display */}
          <div className="mb-2 mt-1">
            <motion.h1 
              key={headerDate}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[22px] font-semibold text-[#222222] tracking-tight leading-none"
              id="header-date-title"
            >
              {headerDate}
            </motion.h1>
          </div>

          {/* View Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mb-3" id="view-selector-tabs">
            {(['Month', 'Week', 'Day'] as CalendarView[]).map((v) => {
              const isSelected = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`h-8 rounded-[6px] text-xs font-semibold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isSelected 
                      ? 'bg-[#373535] text-white shadow-xs' 
                      : 'bg-white border-[1.5px] border-[#1d3766] text-[#222222] hover:bg-[#1d3766]/5'
                  }`}
                  id={`tab-${v.toLowerCase()}`}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Main Visual Display based on View Selector */}
          <div className="flex-1 flex flex-col justify-between">
            {view === 'Month' && (
              <div className="flex-1 flex flex-col justify-start animate-fade-in">
                {/* Calendar Banner / Navigate Month */}
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    {monthName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handlePrevMonth}
                      className="p-0.5 hover:bg-slate-100 rounded-full text-[#1d3766] transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="p-0.5 hover:bg-slate-100 rounded-full text-[#1d3766] transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Weekday indicator row */}
                <div className="grid grid-cols-7 text-center mb-1 select-none">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-7 gap-y-0.5 justify-items-center mb-2">
                  {daysGrid.map((dayObj, index) => {
                    const isSelected = dayObj.dateString === selectedDate;
                    const hasEvent = daysWithEvents.has(dayObj.dateString);
                    const isCurrent = dayObj.isCurrentMonth;
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => handleDateSelect(dayObj.dateString)}
                        className="flex flex-col items-center justify-center relative w-full"
                      >
                        {isSelected ? (
                          /* Capsule style selection pill from original reference */
                          <motion.div 
                            layoutId="selectedDayCapsule"
                            className="bg-[#9bd08a] w-[26px] h-[26px] rounded-full flex flex-col justify-center items-center shadow-xs cursor-pointer select-none"
                          >
                            <span className="text-xs font-bold text-[#222222] leading-none">
                              {dayObj.dayNumber}
                            </span>
                            {hasEvent && (
                              <span className="w-0.5 h-0.5 rounded-full bg-[#1d3766] absolute bottom-1"></span>
                            )}
                          </motion.div>
                        ) : (
                          /* Standard calendar view */
                          <div 
                            className={`w-[26px] h-[26px] flex flex-col justify-center items-center rounded-full cursor-pointer transition-all hover:bg-slate-100 ${
                              isCurrent ? 'text-[#222222] font-semibold' : 'text-slate-300 font-medium'
                            }`}
                          >
                            <span className="text-xs leading-none">
                              {dayObj.dayNumber}
                            </span>
                            {hasEvent && (
                              <span className="w-0.5 h-0.5 rounded-full bg-slate-400 absolute bottom-1"></span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'Week' && (
              <div className="flex-1 flex flex-col justify-start mb-2 animate-fade-in">
                <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1.5 px-1">
                  Week of {formatDateLong(getWeekDays(selectedDate)[0].dateString)}
                </div>
                
                {/* Weekly horizontal cards */}
                <div className="space-y-1.5 mb-2 max-h-[150px] overflow-y-auto no-scrollbar py-0.5">
                  {getWeekDays(selectedDate).map((dayObj, idx) => {
                    const isSelected = dayObj.dateString === selectedDate;
                    const dayEvents = events.filter(e => e.date === dayObj.dateString);
                    const hasEvents = dayEvents.length > 0;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => handleDateSelect(dayObj.dateString)}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#dcebcf] border-[#166534]/20 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-[10px] font-bold leading-tight ${
                            isSelected ? 'bg-[#9bd08a] text-[#222222]' : 'bg-slate-200/60 text-[#1d3766]'
                          }`}>
                            <span className="text-[8px] uppercase">{dayObj.name}</span>
                            <span>{dayObj.dayNumber}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{dayObj.fullName}</p>
                            <p className="text-[10px] text-slate-400">
                              {hasEvents ? `${dayEvents.length} scheduled item(s)` : 'No plans scheduled'}
                            </p>
                          </div>
                        </div>

                        {hasEvents && (
                          <div className="flex -space-x-1">
                            {dayEvents.map((evt, eIdx) => (
                              <span 
                                key={evt.id}
                                className={`w-2 h-2 rounded-full border border-white ${
                                  evt.color === 'blue' ? 'bg-[#93c5fd]' : evt.color === 'green' ? 'bg-[#a3e635]' : 'bg-[#fcd34d]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'Day' && (
              <div className="flex-1 flex flex-col justify-start mb-2 animate-fade-in">
                <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1.5 px-1">
                  Daily Schedule Timeline
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar pr-1 py-0.5">
                  {/* Empty state daily list */}
                  {selectedDayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                      <CalendarIcon className="w-6 h-6 text-slate-300 mb-1" />
                      <p className="text-xs font-semibold text-slate-500">No scheduled activities</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tap the plus icon to add one!</p>
                    </div>
                  ) : (
                    /* Timeline mock grid */
                    <div className="relative pl-6 border-l border-slate-100 space-y-2.5 ml-1.5">
                      {selectedDayEvents.map((evt) => {
                        const styleMap = getColorClasses(evt.color);
                        return (
                          <div key={evt.id} className="relative">
                            {/* Dot on timeline */}
                            <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                              evt.color === 'blue' ? 'bg-[#1d3766]' : evt.color === 'green' ? 'bg-[#166534]' : 'bg-[#7c2d12]'
                            }`} />
                            
                            <div className={`p-2 rounded-lg border ${styleMap.bg} ${styleMap.border} shadow-xs`}>
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-slate-800">{evt.title}</h4>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(evt.id, evt.title);
                                  }}
                                  className="text-slate-400 hover:text-red-500 hover:bg-white/50 p-1 rounded transition-colors"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                                <Clock className="w-2.5 h-2.5 opacity-70" />
                                {evt.time}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thin divider line below the calendar */}
            <div className="border-t border-slate-150 mt-1 mb-3"></div>

            {/* Schedule cards - only show when in 'Month' or 'Week' view as details, or customized */}
            <div className="space-y-1.5" id="schedule-cards-list">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <CalendarIcon className="w-6 h-6 text-slate-300 mb-1" />
                  <p className="text-xs font-semibold text-slate-500">No events today</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Add activities using the button below</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {selectedDayEvents.map((evt) => {
                    const colorSet = getColorClasses(evt.color);
                    return (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-[10px] border-[1.2px] border-[#1d3766]/10 ${colorSet.bg} p-2.5 shadow-xs relative group flex flex-col justify-between overflow-hidden transition-all duration-350 hover:shadow-md hover:border-[#1d3766]/30`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-[#222222] text-[15px] tracking-tight leading-tight">
                            {evt.title}
                          </h3>
                          
                          {/* Elegant delete button visible on hover/touch */}
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-red-50 hover:text-red-600 p-1 rounded-full cursor-pointer absolute right-2.5 top-2"
                            title="Remove task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="text-[10px] font-normal text-gray-400 mt-0.5">
                          {evt.time}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

          </div>

        </div>

        {/* Footer actions for the card - Elegant Trigger to Add Task */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-slate-400 font-mono">
            {events.length} schedule items active
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-[#1d3766] text-white hover:bg-[#1a315b] transition-all cursor-pointer font-semibold shadow-sm text-xs active:scale-95"
            id="btn-add-activity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
        </div>

        {/* Drawer slide-up form inside the exact card dimensions! (Super smooth) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-white z-40 flex flex-col justify-between border-t border-[#1d3766]/10"
            >
              {/* Drawer Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#222222]">Add New Activity</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Scheduling for {formatDateLong(selectedDate)}</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Form */}
              <form onSubmit={handleAddEvent} className="flex-grow p-3.5 space-y-2.5 overflow-y-auto no-scrollbar">
                
                {/* Title Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Client sync / Stand up"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 h-8 rounded-md border border-slate-200 focus:outline-hidden focus:border-[#1d3766] font-medium text-xs transition-colors text-slate-800"
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      className="w-full px-3 h-8 rounded-md border border-slate-200 focus:outline-hidden focus:border-[#1d3766] font-medium text-xs transition-colors text-slate-800"
                    />
                  </div>
                </div>

                {/* Time Slot Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Frame</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    placeholder="e.g., 9.00 AM – 10.30 PM"
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 h-8 rounded-md border border-slate-200 focus:outline-hidden focus:border-[#1d3766] font-mono text-xs transition-colors text-slate-800"
                  />
                </div>

                {/* Color Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visual Highlight Accent</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'blue', label: 'Light Blue', colorBg: 'bg-[#dfe7f5]' },
                      { key: 'green', label: 'Soft Green', colorBg: 'bg-[#dcebcf]' },
                      { key: 'beige', label: 'Warm Beige', colorBg: 'bg-[#efe0d3]' }
                    ].map((accent) => {
                      const active = newColor === accent.key;
                      return (
                        <button
                          key={accent.key}
                          type="button"
                          onClick={() => setNewColor(accent.key as any)}
                          className={`h-9 rounded-md flex flex-row items-center justify-center gap-1 cursor-pointer relative border transition-all duration-200 ${accent.colorBg} ${
                            active 
                              ? 'border-[#1d3766] scale-[1.02] ring-1 ring-[#1d3766]/10' 
                              : 'border-slate-200/50 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-slate-700">{accent.label}</span>
                          {active && (
                            <Check className="w-2.5 h-2.5 text-slate-700 bg-white rounded-full p-0.5 shadow-xs" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button inside drawer */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-8 bg-[#1d3766] text-white hover:bg-[#152749] rounded-md cursor-pointer font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Lock Schedule Item
                  </button>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
