import React, { useState } from 'react';
import { KidProfile } from '../types';

interface ProfileSelectorProps {
  isOpen: boolean;
  profiles: KidProfile[];
  activeProfileId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  isOpen,
  profiles,
  activeProfileId,
  onSelect,
  onAdd,
  onDelete,
  onClose,
}) => {
  const [newKidName, setNewKidName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKidName.trim()) {
      onAdd(newKidName.trim());
      setNewKidName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-pop">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Select Reward Card</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
          {profiles.map((profile) => (
            <div 
              key={profile.id}
              onClick={() => {
                onSelect(profile.id);
                onClose();
              }}
              className={`
                group flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all
                ${profile.id === activeProfileId 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                  ${profile.id === activeProfileId ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}
                `}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className={`font-bold ${profile.id === activeProfileId ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {profile.name}
                </span>
              </div>
              
              {profiles.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(`Delete ${profile.name}'s card?`)) onDelete(profile.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
                  title="Delete Card"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Kid's Name"
              value={newKidName}
              onChange={(e) => setNewKidName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              disabled={!newKidName.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-slate-500 px-2 hover:text-slate-700"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Card
          </button>
        )}
      </div>
    </div>
  );
};