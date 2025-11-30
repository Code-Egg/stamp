import React, { useState, useEffect } from 'react';
import { evaluateBehavior } from './services/geminiService';
import { Stamp } from './components/Stamp';
import { CelebrationModal } from './components/CelebrationModal';
import { ProfileSelector } from './components/ProfileSelector';
import { KidProfile, StampData } from './types';

// Storage keys
const STORAGE_KEY_V1 = 'kid_reward_data_v1';
const STORAGE_KEY_V2 = 'kid_reward_data_v2';
const INITIAL_TARGET = 10;

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // State for multiple profiles
  const [profiles, setProfiles] = useState<KidProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);

  // UI State
  const [behaviorInput, setBehaviorInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Initialize & Migrate Data
  useEffect(() => {
    const savedV2 = localStorage.getItem(STORAGE_KEY_V2);
    
    if (savedV2) {
      try {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
          setActiveProfileId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse V2 data", e);
      }
    }

    // Fallback: Check for V1 data migration
    const savedV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (savedV1) {
      try {
        const oldProfile = JSON.parse(savedV1);
        const newProfile: KidProfile = {
          ...oldProfile,
          id: generateId(), // Add missing ID
        };
        setProfiles([newProfile]);
        setActiveProfileId(newProfile.id);
        // Clear old key to prevent re-migration issues in future (optional, but good hygiene)
        // localStorage.removeItem(STORAGE_KEY_V1); 
        return;
      } catch (e) {
        console.error("Failed to migrate V1 data", e);
      }
    }

    // Default initialization if no data
    const defaultProfile: KidProfile = {
      id: generateId(),
      name: "Super Kid",
      totalStamps: 0,
      targetStamps: INITIAL_TARGET,
      history: []
    };
    setProfiles([defaultProfile]);
    setActiveProfileId(defaultProfile.id);

  }, []);

  // 2. Persist Data
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(profiles));
    }
  }, [profiles]);

  // Derived active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Watch for completion
  useEffect(() => {
    if (activeProfile && activeProfile.totalStamps >= activeProfile.targetStamps && activeProfile.targetStamps > 0) {
      // Small timeout to allow the stamp animation to finish before modal pops
      const timer = setTimeout(() => setShowCelebration(true), 600);
      return () => clearTimeout(timer);
    }
  }, [activeProfile?.totalStamps, activeProfile?.targetStamps]);

  // Handlers
  const handleAddStamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    if (activeProfile.totalStamps >= activeProfile.targetStamps) {
      setErrorMsg("Card is full! Reset to start a new one.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      let newStamp: StampData;
      
      // If input is empty -> Quick Stamp (Manual)
      if (!behaviorInput.trim()) {
        newStamp = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          behavior: "Good Behavior!",
          praise: "Great job!",
          emoji: "⭐"
        };
      } else {
        // If input has text -> AI Judge
        const aiResult = await evaluateBehavior(behaviorInput, activeProfile.name);
        if (!aiResult.approved) {
           setErrorMsg("That behavior didn't quite earn a stamp, but keep trying!");
           setIsProcessing(false);
           return;
        }
        newStamp = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          behavior: behaviorInput,
          praise: aiResult.praise,
          emoji: aiResult.emoji
        };
      }

      // Update State
      setProfiles(prev => prev.map(p => {
        if (p.id === activeProfile.id) {
          return {
            ...p,
            totalStamps: p.totalStamps + 1,
            history: [...p.history, newStamp]
          };
        }
        return p;
      }));
      
      setBehaviorInput('');

    } catch (err) {
      setErrorMsg("Something went wrong processing the stamp.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          totalStamps: 0,
          history: [] // Alternatively, keep history for a log and only reset totalStamps
        };
      }
      return p;
    }));
    setShowCelebration(false);
  };

  // Profile Management
  const handleAddProfile = (name: string) => {
    const newProfile: KidProfile = {
      id: generateId(),
      name,
      totalStamps: 0,
      targetStamps: INITIAL_TARGET,
      history: []
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    setIsProfileSelectorOpen(false);
  };

  const handleDeleteProfile = (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) {
      setActiveProfileId(newProfiles[0]?.id || '');
    }
  };

  if (!activeProfile) return <div className="p-10 text-center">Loading...</div>;

  const filledStamps = activeProfile.history.slice(activeProfile.history.length - activeProfile.totalStamps);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-yellow-200">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        
        {/* Navigation / Header */}
        <header className="mb-6 flex items-center justify-between">
           <div className="flex-1">
             <button 
               onClick={() => setIsProfileSelectorOpen(true)}
               className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 hover:border-indigo-300 transition-all active:scale-95"
             >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {activeProfile.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-700 group-hover:text-indigo-600">{activeProfile.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 group-hover:text-indigo-500">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
             </button>
           </div>
           
           <h1 className="hidden sm:block text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
             Rewards
           </h1>
           
           <div className="flex-1 text-right">
             <span className="text-slate-400 text-xs font-medium bg-slate-100 px-3 py-1 rounded-full">
               {profiles.length} Card{profiles.length !== 1 ? 's' : ''}
             </span>
           </div>
        </header>

        {/* Main Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden">
           
           {/* Decorative Background Elements */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
           <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

           {/* Progress Bar */}
           <div className="relative mb-10 z-10">
              <div className="flex justify-between items-end mb-2 px-2">
                <span className="font-bold text-slate-700 text-lg">Goal Progress</span>
                <span className="font-bold text-indigo-600 text-2xl">{activeProfile.totalStamps} / {activeProfile.targetStamps}</span>
              </div>
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end px-2"
                  style={{ width: `${Math.min(100, (activeProfile.totalStamps / activeProfile.targetStamps) * 100)}%` }}
                >
                  {activeProfile.totalStamps > 0 && (
                    <div className="w-1.5 h-full bg-white/30 skew-x-12 animate-pulse"></div>
                  )}
                </div>
              </div>
           </div>

           {/* Stamps Grid */}
           <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 sm:gap-6 mb-12 relative z-10">
             {Array.from({ length: activeProfile.targetStamps }).map((_, i) => (
               <Stamp 
                 key={i} 
                 index={i} 
                 data={i < activeProfile.totalStamps ? filledStamps[i] : undefined} 
               />
             ))}
           </div>

           {/* Input Action Area */}
           <div className="relative z-20 bg-slate-50 rounded-2xl p-1 sm:p-2 border border-slate-200 shadow-sm">
             <form onSubmit={handleAddStamp} className="relative flex flex-col sm:flex-row gap-2">
               <input 
                 type="text" 
                 value={behaviorInput}
                 onChange={(e) => setBehaviorInput(e.target.value)}
                 disabled={isProcessing}
                 placeholder="Type behavior OR just tap add..."
                 className="flex-1 bg-white text-slate-800 placeholder:text-slate-400 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg transition shadow-sm disabled:opacity-70"
               />
               <button 
                 type="submit"
                 disabled={isProcessing}
                 className={`
                   px-6 py-4 rounded-xl font-bold text-white shadow-md text-lg transition-all
                   ${isProcessing ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
                   flex items-center justify-center gap-2 min-w-[140px]
                 `}
               >
                 {isProcessing ? (
                   <>
                     <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   </>
                 ) : (
                   <>
                     {behaviorInput.trim() ? (
                        <>
                          <span>Judge It</span>
                          <span className="text-xl">⚖️</span>
                        </>
                     ) : (
                        <>
                          <span>Add Stamp</span>
                          <span className="text-xl">✨</span>
                        </>
                     )}
                   </>
                 )}
               </button>
             </form>
             
             {/* Error / Feedback Message */}
             {errorMsg && (
                <div className="absolute top-full mt-2 left-0 right-0 text-center">
                  <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                    {errorMsg}
                  </span>
                </div>
             )}
           </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-400 text-sm">
           <p>Switch cards using the name button at the top.</p>
        </div>

      </div>

      <CelebrationModal 
        isOpen={showCelebration} 
        onReset={handleReset} 
        onClose={() => setShowCelebration(false)} 
      />

      <ProfileSelector
        isOpen={isProfileSelectorOpen}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelect={(id) => setActiveProfileId(id)}
        onAdd={handleAddProfile}
        onDelete={handleDeleteProfile}
        onClose={() => setIsProfileSelectorOpen(false)}
      />
    </div>
  );
};

export default App;