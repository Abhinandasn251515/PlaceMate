import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getEvents, 
  createEvent, 
  deleteEvent, 
  getJobs 
} from '../api/backend';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PlacementCalendar = () => {
  const { user } = useContext(AuthContext);
  
  // Date States
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  // Data States
  const [drives, setDrives] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Modal States
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('Mock Interview');

  // Load calendar drives and custom events
  const loadCalendarData = async () => {
    try {
      // 1. Load custom user events
      const events = await getEvents();
      setCustomEvents(events);

      // 2. Load jobs to display as drives
      const jobsList = await getJobs();
      // Map job post dates to drive dates
      const jobsMappedAsDrives = jobsList.map((job, idx) => {
        // Fallback drive dates scattered sequentially if createdAt is recent
        const baseDate = new Date(job.createdAt || Date.now());
        baseDate.setDate(baseDate.getDate() + (idx * 2) + 1); // Mock different days
        return {
          _id: job._id,
          company: job.company,
          date: baseDate.toISOString().split('T')[0]
        };
      });
      setDrives(jobsMappedAsDrives);
    } catch (err) {
      console.error('Failed to load calendar events:', err.message);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // Date Math helpers
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  // Array representing days in grid (includes pre-padding)
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  // Find events matching a specific date (day)
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    const formattedDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Match drives
    const matchedDrives = drives.filter(d => d.date === formattedDateStr).map(d => ({
      _id: d._id,
      title: `${d.company} Recruitment Drive`,
      type: 'drive',
      color: 'bg-indigo-500 text-white border-indigo-650'
    }));

    // Match user custom events
    const matchedCustom = customEvents.filter(e => e.date === formattedDateStr).map(e => ({
      _id: e._id,
      title: e.title,
      type: e.type,
      color: e.type === 'Mock Interview' 
        ? 'bg-emerald-500 text-white border-emerald-650' 
        : 'bg-red-500 text-white border-red-650'
    }));

    return [...matchedDrives, ...matchedCustom];
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setIsAddEventOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDay) return;

    const formattedDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    try {
      await createEvent({
        title: newEventTitle.trim(),
        type: newEventType,
        date: formattedDateStr
      });

      setNewEventTitle('');
      setIsAddEventOpen(false);
      
      toast.success('Event scheduled! +10 XP earned!');
      loadCalendarData(); // Refresh calendar to display new event and sync XP
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully.');
      loadCalendarData(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event.');
    }
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="text-indigo-500" size={32} />
            Placement Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Schedule mock exams, track company drive registrations, and organize your studies.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid Wrapper (Left) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Header controllers */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750 pb-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              {MONTHS[monthIndex]} {year}
            </h3>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1">
              {DAYS_OF_WEEK.map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Monthly grid cells */}
            <div className="grid grid-cols-7 gap-2 select-none">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = day && 
                  day === new Date().getDate() && 
                  monthIndex === new Date().getMonth() && 
                  year === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    className={`min-h-[72px] p-2 border rounded-2xl flex flex-col justify-between transition-all relative group ${
                      day 
                        ? 'border-slate-150 dark:border-slate-750/70 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm bg-white dark:bg-slate-800 cursor-pointer' 
                        : 'border-transparent bg-transparent pointer-events-none'
                    } ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800' : ''}`}
                  >
                    {/* Day Number */}
                    {day && (
                      <span className={`text-xs font-black h-5.5 w-5.5 rounded-md flex items-center justify-center ${
                        isToday 
                          ? 'bg-indigo-600 text-white font-extrabold shadow-sm shadow-indigo-600/30' 
                          : 'text-slate-800 dark:text-slate-300'
                      }`}>
                        {day}
                      </span>
                    )}

                    {/* Event Dots/Badges */}
                    {dayEvents.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {dayEvents.slice(0, 2).map((ev, eIdx) => (
                          <div
                            key={eIdx}
                            className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded-md border truncate ${ev.color}`}
                            title={ev.title}
                          >
                            {ev.type === 'drive' ? 'Drive' : ev.type === 'Mock Interview' ? 'Mock' : 'Test'}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[7px] font-black text-slate-400 text-right opacity-80">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Info & Legend (Right) */}
        <div className="space-y-6">
          {/* Calendar Legend */}
          <div className="bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Calendar Legend</h3>
            <div className="space-y-2.5 text-xs font-bold text-slate-650 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded bg-indigo-500" />
                <span>Placement Drives</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span>Custom Mock Interviews</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span>Custom Mock Tests</span>
              </div>
            </div>
          </div>

          {/* Gamification calendar card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-755 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-300" size={18} />
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-200 text-left">Calendar Boost</h4>
            </div>
            <h3 className="text-lg font-black leading-tight text-left">Schedule Practice to Earn +10 XP</h3>
            <p className="text-[11px] text-indigo-100 font-semibold leading-relaxed text-left">
              Scheduling custom mock test practice slots or mock interview check-ins keeps your calendar organized and awards you **+10 XP** on first schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Add Custom Event Modal Overlay */}
      <AnimatePresence>
        {isAddEventOpen && selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEventOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750 pb-3">
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  Schedule Event ({MONTHS[monthIndex]} {selectedDay}, {year})
                </h3>
                <button 
                  onClick={() => setIsAddEventOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Day's Events List if any exist */}
              {selectedDayEvents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide block">Scheduled for this day</span>
                  <div className="space-y-1.5">
                    {selectedDayEvents.map((ev, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-750 rounded-xl text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-350">{ev.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md border ${ev.color}`}>
                            {ev.type}
                          </span>
                          {ev.type !== 'drive' && (
                            <button
                              onClick={() => handleDeleteEvent(ev._id)}
                              className="text-red-500 hover:text-red-650 text-[10px] font-black uppercase bg-transparent border-none cursor-pointer p-1"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form to create new event */}
              <form onSubmit={handleCreateEvent} className="space-y-4 pt-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide block">Add New Event</span>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-455">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Practice Microsoft system design..."
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-455">Event Category</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Mock Test Prep">Mock Test Prep</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-xl text-xs tracking-wide transition-all shadow-md shadow-indigo-600/10 cursor-pointer border-none"
                  >
                    Schedule Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacementCalendar;
