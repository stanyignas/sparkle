import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { Home, Calendar, BookHeart, Settings as SettingsIcon, Plus, Droplet, Heart, Clock } from 'lucide-react';

import { UserData, AppState, CycleStats, LoveLog, TimePassedEntry } from './types';
import { getUser, saveUser, clearData } from './services/storage';
import { calculateCycleStats, getDayStatus } from './services/prediction';
import { DEFAULT_PREFERENCES, MICROCOPY, COLORS } from './constants';

import FloatingHearts from './components/FloatingHearts';
import LoveMeter from './components/LoveMeter';
import CalendarView from './components/CalendarView';
import TimePassedView from './components/TimePassedView';
import ConfirmationModal from './components/ConfirmationModal';

// --- COMPONENTS ---

// 1. ONBOARDING
const Onboarding = ({ onComplete }: { onComplete: (name: string, lastPeriod: string, cycleLen: number) => void }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [lastPeriod, setLastPeriod] = useState('');
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-pink-50 relative overflow-hidden">
      <FloatingHearts />
      <div className="z-10 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl">
        {step === 1 && (
          <div className="text-center animate-float">
            <Heart size={64} className="text-primary mx-auto mb-6 fill-primary" />
            <h1 className="text-3xl font-bold text-textPrimary mb-4">{MICROCOPY.onboarding.welcome}</h1>
            <p className="text-textMuted mb-8">A private space for you.</p>
            <button onClick={() => setStep(2)} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200">Start</button>
          </div>
        )}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-textPrimary mb-6">{MICROCOPY.onboarding.privacy}</h2>
            <p className="text-sm text-textMuted mb-8 text-left">We store your data locally on your device. No trackers, no ads, just you.</p>
            <button onClick={() => setStep(3)} className="w-full bg-secondary text-white py-4 rounded-xl font-bold">Understood</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-6">{MICROCOPY.onboarding.setup}</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full p-4 bg-gray-50 rounded-xl"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div>
                <label className="text-xs text-textMuted ml-1">Last Period Start</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-gray-50 rounded-xl"
                  value={lastPeriod}
                  onChange={e => setLastPeriod(e.target.value)}
                />
              </div>
              <button 
                onClick={() => {
                  if(name && lastPeriod) onComplete(name, lastPeriod, 28);
                }} 
                className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-4"
              >
                All Set!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. DASHBOARD
const Dashboard = ({ user, onOpenLoveMeter, onOpenTimePassed }: { user: UserData, onOpenLoveMeter: () => void, onOpenTimePassed: () => void }) => {
  const today = new Date();
  const nextPeriod = parseISO(user.cycleStats.computed.predictedNextStart);
  const daysLeft = differenceInDays(nextPeriod, today);
  const status = getDayStatus(today, user.cycleStats);

  // Love Average
  const recentLove = user.loveMeter.slice(-7);
  const avgLove = recentLove.length > 0 
    ? (recentLove.reduce((acc, curr) => acc + curr.rating, 0) / recentLove.length).toFixed(1)
    : '-';

  return (
    <div className="p-6 space-y-6 pb-28">
      <header>
        <h1 className="text-2xl font-bold text-textPrimary">{MICROCOPY.greeting(user.name)}</h1>
        <p className="text-textMuted text-sm">{format(today, 'EEEE, MMMM do')}</p>
      </header>

      {/* Cycle Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm shadow-pink-100 border border-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Droplet size={120} className="text-primary fill-current" />
        </div>
        <div className="relative z-10">
          <h2 className="text-textMuted uppercase text-xs font-bold tracking-wider mb-2">Cycle Prediction</h2>
          {status === 'period' ? (
             <div className="text-3xl font-bold text-primary mb-1">Period Day</div>
          ) : (
             <div className="text-4xl font-bold text-primary mb-1">{Math.max(0, daysLeft)} Days</div>
          )}
          <p className="text-textMuted text-sm mb-4">
            {status === 'period' ? 'Take care of yourself ❤️' : `until your next cycle (${format(nextPeriod, 'MMM d')})`}
          </p>
          
          <div className="flex gap-2 mt-4">
             {status === 'fertile' && (
               <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-xs font-bold">High Fertility</span>
             )}
             {status === 'period' && (
                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold">Flowing</span>
             )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onOpenLoveMeter}
          className="bg-gradient-to-br from-pink-400 to-pink-500 text-white p-4 rounded-2xl shadow-lg shadow-pink-200 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Heart className="fill-white" size={24} />
          <span className="font-bold">Log Mood</span>
        </button>
        <div className="grid grid-rows-2 gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between px-4">
            <div>
              <span className="block text-xl font-bold text-textPrimary">{avgLove}</span>
              <span className="text-[10px] text-textMuted uppercase font-bold">Avg Mood</span>
            </div>
            <Heart size={20} className="text-pink-300" />
          </div>
          <button 
            onClick={onOpenTimePassed}
            className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between px-4 hover:bg-blue-50 transition-colors"
          >
            <div className="text-left">
              <span className="block text-xl font-bold text-secondary">{user.timePassedEntries?.length || 0}</span>
              <span className="text-[10px] text-textMuted uppercase font-bold">Moments</span>
            </div>
            <Clock size={20} className="text-secondary" />
          </button>
        </div>
      </div>

      {/* Special Dates Teaser */}
      {user.specialDates.length > 0 && (
         <div className="bg-white p-5 rounded-2xl border border-gray-100">
           <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-sm">Upcoming</h3>
             <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">Special</span>
           </div>
           {user.specialDates.slice(0, 2).map(d => (
             <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <div className="flex-1">
                 <div className="text-sm font-medium">{d.title}</div>
                 <div className="text-xs text-textMuted">{format(parseISO(d.date), 'MMMM do')}</div>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

// 3. SETTINGS
const Settings = ({ user, onDeleteRequest }: { user: UserData, onDeleteRequest: () => void }) => {
  return (
    <div className="p-6 pb-28 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold mb-4 text-sm uppercase text-textMuted">Cycle</h3>
        <div className="flex justify-between py-2 border-b border-gray-50">
           <span>Avg Cycle Length</span>
           <span className="font-mono">{user.cycleStats.avgCycleLength} Days</span>
        </div>
        <div className="flex justify-between py-2">
           <span>Avg Period Length</span>
           <span className="font-mono">{user.cycleStats.avgPeriodLength} Days</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold mb-4 text-sm uppercase text-textMuted">Data</h3>
        <button 
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "pocketlove_backup.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          className="w-full text-left py-3 text-blue-500 font-medium"
        >
          Export Backup (JSON)
        </button>
        <button 
          onClick={onDeleteRequest}
          className="w-full text-left py-3 text-red-500 font-medium border-t border-gray-50"
        >
          Delete All Data
        </button>
      </div>
    </div>
  );
};


// --- MAIN APP ---

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    isLoading: true,
    view: 'onboarding'
  });

  const [showLoveMeter, setShowLoveMeter] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadedUser = getUser();
    if (loadedUser) {
      // Migration check: ensure timePassedEntries exists
      if (!loadedUser.timePassedEntries) {
        loadedUser.timePassedEntries = [];
      }

      // Recalculate predictions on load to ensure fresh dates
      const freshStats = calculateCycleStats(loadedUser.cycleStats.periodHistory);
      const updatedUser = { ...loadedUser, cycleStats: freshStats };
      
      setState({
        user: updatedUser,
        isLoading: false,
        view: 'home'
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false, view: 'onboarding' }));
    }
  }, []);

  const handleOnboardingComplete = (name: string, lastPeriod: string, cycleLen: number) => {
    const periodEntry = { startDate: lastPeriod, lengthDays: 5, notes: 'Initial entry' };
    const stats = calculateCycleStats([periodEntry]);
    
    const newUser: UserData = {
      id: uuidv4(),
      name,
      preferences: DEFAULT_PREFERENCES,
      cycleStats: stats,
      loveMeter: [],
      specialDates: [],
      journal: [],
      timePassedEntries: []
    };

    saveUser(newUser);
    setState({ user: newUser, isLoading: false, view: 'home' });
  };

  const handleLoveLog = (rating: number, note: string) => {
    if (!state.user) return;
    
    const newLog: LoveLog = {
      date: format(new Date(), 'yyyy-MM-dd'),
      rating,
      note
    };

    const updatedUser = {
      ...state.user,
      loveMeter: [...state.user.loveMeter, newLog]
    };

    saveUser(updatedUser);
    setState(prev => ({ ...prev, user: updatedUser }));
    setShowLoveMeter(false);
  };

  const handleAddPeriod = () => {
    if (!state.user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const exists = state.user.cycleStats.periodHistory.find(p => p.startDate === today);
    
    if (exists) {
        alert("Period already logged for today.");
        return;
    }

    const newEntry = { startDate: today, lengthDays: 5, notes: '' };
    const newHistory = [...state.user.cycleStats.periodHistory, newEntry];
    const newStats = calculateCycleStats(newHistory);

    const updatedUser = { ...state.user, cycleStats: newStats };
    saveUser(updatedUser);
    setState(prev => ({ ...prev, user: updatedUser }));
    alert("Period started today!");
  };

  const handleAddTimePassed = (title: string, date: string, time: string) => {
    if (!state.user) return;
    const newEntry: TimePassedEntry = {
      id: uuidv4(),
      title,
      dateTime: `${date}T${time}`
    };
    
    // Add to beginning of array (newest first)
    const updatedEntries = [newEntry, ...(state.user.timePassedEntries || [])];
    const updatedUser = { ...state.user, timePassedEntries: updatedEntries };
    
    saveUser(updatedUser);
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const handleDeleteTimePassed = (id: string) => {
    if (!state.user) return;
    const updatedEntries = state.user.timePassedEntries.filter(e => e.id !== id);
    const updatedUser = { ...state.user, timePassedEntries: updatedEntries };
    
    saveUser(updatedUser);
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const confirmDeleteData = () => {
    clearData();
    setState({ user: null, isLoading: false, view: 'onboarding' });
    setShowDeleteConfirm(false);
  };

  if (state.isLoading) return <div className="flex items-center justify-center h-screen bg-pink-50">Loading...</div>;

  if (state.view === 'onboarding') return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    // Fixed layout container: h-screen prevents overall scrolling, flex-col organizes content
    <div className="max-w-md mx-auto h-screen flex flex-col bg-[#FFFDFD] relative shadow-2xl overflow-hidden">
      <FloatingHearts />
      
      {/* Scrollable Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        {state.view === 'home' && state.user && (
          <Dashboard 
            user={state.user} 
            onOpenLoveMeter={() => setShowLoveMeter(true)} 
            onOpenTimePassed={() => setState(prev => ({ ...prev, view: 'time-passed' }))}
          />
        )}
        
        {state.view === 'time-passed' && state.user && (
          <TimePassedView 
            entries={state.user.timePassedEntries || []} 
            onAdd={handleAddTimePassed}
            onDelete={handleDeleteTimePassed}
            onBack={() => setState(prev => ({ ...prev, view: 'home' }))}
          />
        )}
        
        {state.view === 'calendar' && state.user && (
          <div className="p-4 pt-8 pb-28">
             <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold">Calendar</h1>
                 <button onClick={handleAddPeriod} className="text-xs bg-primary text-white px-3 py-2 rounded-lg font-bold">
                    + Log Period
                 </button>
             </div>
             <div className="bg-white rounded-3xl shadow-sm p-4">
               <CalendarView 
                  cycleStats={state.user.cycleStats} 
                  specialDates={state.user.specialDates} 
                  onDayClick={(d) => alert(`Selected: ${format(d, 'yyyy-MM-dd')}`)}
               />
             </div>
             <div className="mt-6">
                <h3 className="font-bold mb-2">History</h3>
                <div className="space-y-2">
                   {state.user.cycleStats.periodHistory.slice(0, 5).map((p, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl text-sm border border-gray-50 flex justify-between">
                         <span>{format(parseISO(p.startDate), 'MMM do, yyyy')}</span>
                         <span className="text-textMuted">{p.lengthDays} days</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {state.view === 'journal' && (
           <div className="p-6 pt-8 pb-28">
              <h1 className="text-2xl font-bold mb-4">Journal</h1>
              <div className="text-center text-textMuted mt-10">
                 <BookHeart size={48} className="mx-auto mb-4 opacity-50" />
                 <p>Your private thoughts are safe here.</p>
                 <div className="mt-4 space-y-3">
                    {state.user?.loveMeter.slice().reverse().map((log, idx) => (
                       <div key={idx} className="bg-white p-4 rounded-xl text-left shadow-sm">
                          <div className="flex justify-between mb-2">
                             <span className="font-bold text-sm">{log.date}</span>
                             <div className="flex">{Array(log.rating).fill('❤️').join('')}</div>
                          </div>
                          <p className="text-sm text-textMuted">{log.note || "No note added."}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {state.view === 'settings' && state.user && (
           <Settings user={state.user} onDeleteRequest={() => setShowDeleteConfirm(true)} />
        )}
      </main>

      {/* Love Meter Modal */}
      {showLoveMeter && (
        <LoveMeter onSave={handleLoveLog} onClose={() => setShowLoveMeter(false)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        title="Delete Everything?"
        message="This will completely reset your app. All your cycles, predictions, and journal entries will be lost forever."
        confirmText="Yes, Delete It"
        isDanger={true}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteData}
      />

      {/* Bottom Nav - Absolute positioned at bottom of container */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-2 pb-6 z-40">
        <div className="flex justify-around items-center">
          <button 
             onClick={() => setState(prev => ({ ...prev, view: 'home' }))}
             className={`p-2 rounded-xl transition-all ${state.view === 'home' || state.view === 'time-passed' ? 'text-primary bg-pink-50' : 'text-gray-400'}`}
          >
            <Home size={24} strokeWidth={state.view === 'home' || state.view === 'time-passed' ? 3 : 2} />
          </button>
          
          <button 
             onClick={() => setState(prev => ({ ...prev, view: 'calendar' }))}
             className={`p-2 rounded-xl transition-all ${state.view === 'calendar' ? 'text-primary bg-pink-50' : 'text-gray-400'}`}
          >
            <Calendar size={24} strokeWidth={state.view === 'calendar' ? 3 : 2} />
          </button>

          <button 
             onClick={() => setShowLoveMeter(true)}
             className="bg-primary text-white p-4 rounded-full -mt-8 shadow-lg shadow-pink-200 hover:scale-105 transition-transform"
          >
            <Plus size={28} />
          </button>

          <button 
             onClick={() => setState(prev => ({ ...prev, view: 'journal' }))}
             className={`p-2 rounded-xl transition-all ${state.view === 'journal' ? 'text-primary bg-pink-50' : 'text-gray-400'}`}
          >
            <BookHeart size={24} strokeWidth={state.view === 'journal' ? 3 : 2} />
          </button>

          <button 
             onClick={() => setState(prev => ({ ...prev, view: 'settings' }))}
             className={`p-2 rounded-xl transition-all ${state.view === 'settings' ? 'text-primary bg-pink-50' : 'text-gray-400'}`}
          >
            <SettingsIcon size={24} strokeWidth={state.view === 'settings' ? 3 : 2} />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;