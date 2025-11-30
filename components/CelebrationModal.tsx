import React from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onReset: () => void;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onReset, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop border-8 border-yellow-400">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl">
          🏆
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-800 mt-6 mb-2">Card Complete!</h2>
        <p className="text-slate-600 mb-8">
          Amazing job! You've collected all your stamps. Time for a reward!
        </p>

        <div className="space-y-3">
          <button 
            onClick={onReset}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition active:scale-95 text-lg"
          >
            Start New Card
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-600 font-semibold py-3 px-6 rounded-xl hover:bg-slate-200 transition"
          >
            Keep Admiring
          </button>
        </div>
      </div>
    </div>
  );
};