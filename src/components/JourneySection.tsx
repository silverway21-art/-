import React, { useState } from 'react';
import { Rocket, Zap, AlertTriangle, ChevronDown, ChevronUp, Flag, Trophy } from 'lucide-react';
import { JOURNEY_ITEMS as DEFAULT_JOURNEY_ITEMS } from '../data/portfolioData';
import { JourneyItem } from '../types';

interface JourneySectionProps {
  journeyItems?: JourneyItem[];
}

export const JourneySection: React.FC<JourneySectionProps> = ({ journeyItems }) => {
  const items = journeyItems && journeyItems.length > 0 ? journeyItems : DEFAULT_JOURNEY_ITEMS;
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <section id="journey" className="max-w-4xl mx-auto px-4 py-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Rocket size={22} className="transform -rotate-45" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Competition Journey
            <span className="text-xs font-mono-tech font-normal text-cyan-500 border border-cyan-900/60 px-2 py-0.5 rounded">
              TIMELINE // 2024-2026
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono-tech">
            대회 참가 기록 및 실전 로봇 제어 문제 해결 로그
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 border-l border-cyan-900/60 space-y-6">
        {items.map((item, index) => {
          const isLatest = index === 0;
          const isExpanded = expandedId === item.id;


          return (
            <div key={item.id} className="relative group">
              
              {/* Node dot on timeline */}
              <div 
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  isLatest
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_#22d3ee]'
                    : 'bg-[#030712] border-cyan-500/60 group-hover:border-cyan-400'
                }`}
              >
                {isLatest && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
              </div>

              {/* Timeline Card */}
              <div 
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'bg-[#060e1b]/95 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'bg-[#050b16]/80 border-cyan-900/40 hover:border-cyan-800/80'
                }`}
              >
                {/* Header click to toggle */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                        {item.year}
                      </span>
                      {item.rank && (
                        <span className="text-[11px] font-mono-tech text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                          <Trophy size={11} /> {item.rank}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono-tech">
                      {item.team && <span className="text-cyan-300 font-semibold">{item.team}</span>}
                      {item.subtitle && <span>{item.subtitle}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono-tech rounded bg-cyan-950/50 text-cyan-400 border border-cyan-900/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details matching Screenshot */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 space-y-3 border-t border-cyan-950/80 animate-in fade-in duration-200">
                    
                    {/* Roles if any */}
                    {item.roles && (
                      <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
                        <Flag size={12} className="text-cyan-400" />
                        <span>Assigned Roles: <strong className="text-slate-200">{item.roles.join(', ')}</strong></span>
                      </div>
                    )}

                    {/* Strength Box */}
                    {item.strength && (
                      <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs">
                        <div className="flex items-center gap-1.5 font-mono-tech font-bold text-cyan-300 mb-1">
                          <Zap size={13} className="text-cyan-400" />
                          <span>Strength</span>
                        </div>
                        <p className="text-slate-200 pl-4">{item.strength}</p>
                      </div>
                    )}

                    {/* Weakness Box */}
                    {item.weakness && (
                      <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-xs">
                        <div className="flex items-center gap-1.5 font-mono-tech font-bold text-rose-300 mb-1">
                          <AlertTriangle size={13} className="text-rose-400" />
                          <span>Weakness / Challenge</span>
                        </div>
                        <p className="text-slate-200 pl-4">{item.weakness}</p>
                      </div>
                    )}

                    {/* Review quote */}
                    {item.review && (
                      <div className="pt-2 text-xs font-mono-tech text-slate-400 pl-2 border-l-2 border-cyan-700/60">
                        <span className="text-cyan-400 font-bold">REVIEW: </span>
                        <span>{item.review}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
