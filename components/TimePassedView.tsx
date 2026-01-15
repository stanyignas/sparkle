import React, { useState, useEffect } from 'react';
import { intervalToDuration, format, Duration } from 'date-fns';
import { ArrowLeft, Clock, Plus, Trash2, X } from 'lucide-react';
import { TimePassedEntry } from '../types';
import { COLORS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  entries: TimePassedEntry[];
  onAdd: (title: string, date: string, time: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const TimeCard: React.FC<{ entry: TimePassedEntry; onDelete: () => void }> = ({ entry, onDelete }) => {
  const [duration, setDuration] = useState<Duration>({});

  useEffect(() => {
    const tick = () => {
      const start = new Date(entry.dateTime);
      const end = new Date();
      if (start > end) {
        setDuration({}); // Future date handling if needed
        return;
      }
      setDuration(intervalToDuration({ start, end }));
    };
    
    tick(); // Initial
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [entry.dateTime]);

  const pad = (n: number | undefined) => (n || 0).toString().padStart(2, '0');

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Native confirm is okay here for single item deletion speed, 
    // or we could lift state up. For now, we ensure the button works.
    if (window.confirm("Delete this memory?")) {
      onDelete();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white p-5 rounded-2xl shadow-sm border border-pink-50 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Since</h3>
          <h2 className="text-lg font-bold text-textPrimary">{entry.title}</h2>
        </div>
        {/* Increased touch target with p-3 -m-2 */}
        <button 
          onClick={handleDeleteClick}
          className="text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors p-3 -m-2 rounded-full"
          aria-label="Delete entry"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {/* Date Row */}
        <div className="flex flex-wrap items-center gap-2 text-primary font-medium">
           <span className="bg-pink-50 px-2 py-1 rounded-lg">
             {duration.years || 0} yr
           </span>
           <span className="text-pink-200">•</span>
           <span className="bg-pink-50 px-2 py-1 rounded-lg">
             {duration.months || 0} mos
           </span>
           <span className="text-pink-200">•</span>
           <span className="bg-pink-50 px-2 py-1 rounded-lg">
             {duration.days || 0} days
           </span>
        </div>

        {/* Time Row */}
        <div className="flex items-center gap-2 text-textPrimary font-mono text-lg tracking-widest bg-gray-50 p-2 rounded-xl justify-center">
           <span>{pad(duration.hours)}</span>
           <span className="text-textMuted text-xs">:</span>
           <span>{pad(duration.minutes)}</span>
           <span className="text-textMuted text-xs">:</span>
           <span className="text-primary">{pad(duration.seconds)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const TimePassedView: React.FC<Props> = ({ entries, onAdd, onDelete, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (!title || !date || !time) return;
    onAdd(title, date, time);
    setTitle('');
    setDate('');
    setTime('');
    setShowForm(false);
  };

  return (
    <div className="p-6 pt-8 pb-24 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-textMuted hover:text-textPrimary">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Moments</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="p-2 -mr-2 text-primary hover:bg-pink-50 rounded-full"
        >
          <Plus />
        </button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 && !showForm && (
          <div className="text-center py-10 text-textMuted opacity-60">
            <Clock size={48} className="mx-auto mb-4" />
            <p>No memories saved yet.</p>
          </div>
        )}

        <AnimatePresence>
          {entries.map(entry => (
            <TimeCard key={entry.id} entry={entry} onDelete={() => onDelete(entry.id)} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Add Moment</h3>
                <button onClick={() => setShowForm(false)}><X className="text-textMuted" /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-textMuted uppercase ml-1">Title</label>
                  <input
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. First Kiss"
                    className="w-full p-3 bg-gray-50 rounded-xl mt-1 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-textMuted uppercase ml-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-3 bg-gray-50 rounded-xl mt-1 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textMuted uppercase ml-1">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full p-3 bg-gray-50 rounded-xl mt-1 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!title || !date || !time}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 mt-2 disabled:opacity-50 disabled:shadow-none"
                >
                  Start Tracking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimePassedView;