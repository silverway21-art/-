import React from 'react';

interface CyberDividerProps {
  className?: string;
}

export const CyberDivider: React.FC<CyberDividerProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center my-10 sm:my-16 max-w-4xl mx-auto px-4 ${className}`} aria-hidden="true">
      {/* Left glowing dot */}
      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0 animate-pulse" />
      
      {/* Horizontal glowing line */}
      <div className="h-[1.5px] flex-1 mx-1 bg-gradient-to-r from-cyan-500/80 via-cyan-400 to-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
      
      {/* Right glowing dot */}
      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0 animate-pulse" />
    </div>
  );
};
