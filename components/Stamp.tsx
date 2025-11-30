import React from 'react';
import { StampData } from '../types';

interface StampProps {
  index: number;
  data?: StampData;
  isLocked?: boolean;
}

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yellow-400 drop-shadow-md">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

export const Stamp: React.FC<StampProps> = ({ index, data }) => {
  const isFilled = !!data;

  return (
    <div className="relative group perspective-500">
      <div 
        className={`
          aspect-square rounded-full flex items-center justify-center 
          text-3xl sm:text-4xl transition-all duration-300
          ${isFilled 
            ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400 shadow-lg scale-100 animate-pop cursor-pointer hover:scale-105' 
            : 'bg-white border-4 border-dashed border-slate-200 shadow-inner'
          }
        `}
      >
        {isFilled ? (
          <div className="w-3/4 h-3/4 flex items-center justify-center relative">
             <div className="absolute inset-0 animate-float delay-100"><StarIcon /></div>
             <div className="absolute -bottom-1 -right-1 text-xl drop-shadow-sm">{data.emoji}</div>
          </div>
        ) : (
          <span className="text-slate-300 font-bold text-lg sm:text-2xl">{index + 1}</span>
        )}
      </div>
      
      {/* Tooltip for filled stamps */}
      {isFilled && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl relative text-center">
            <p className="font-bold text-yellow-300 mb-1">{data.emoji} {data.behavior}</p>
            <p className="italic text-slate-300">"{data.praise}"</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};