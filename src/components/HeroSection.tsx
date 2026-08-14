import React from 'react';
import { Sparkles, Target, Cpu, Activity } from 'lucide-react';
import { PORTFOLIO_INFO } from '../data/portfolioData';

export const HeroSection: React.FC = () => {
  return (
    <section id="about" className="pt-6 sm:pt-12 pb-4 text-center max-w-4xl mx-auto px-4">
      {/* System Init Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 font-mono-tech text-xs tracking-widest uppercase mb-6 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>SYS.INIT // USER_ZION</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-3">
        Zion’s robot and <br className="sm:hidden" />
        <span className="text-cyan-400 drop-shadow-[0_0_16px_rgba(6,182,212,0.6)]">code portfolio</span>
      </h1>

      {/* Korean Subtitle / Tagline */}
      <p className="text-base sm:text-lg text-slate-300 font-medium mb-2">
        {PORTFOLIO_INFO.headlineKorean}
      </p>
      <p className="text-xs sm:text-sm text-slate-400 font-mono-tech max-w-xl mx-auto mb-8">
        {PORTFOLIO_INFO.subheadline}
      </p>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-3xl mx-auto text-left">
        
        {/* Primary Directive Card (Left heavy or full width) */}
        <div className="md:col-span-12 relative bg-[#060e1a]/90 rounded-xl border border-cyan-900/60 p-5 sm:p-6 shadow-[0_0_20px_rgba(6,182,212,0.08)] overflow-hidden">
          {/* Left glowing cyan accent bar matching screenshot */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-cyan-300 to-cyan-500 shadow-[0_0_10px_#22d3ee]" />
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono-tech text-[11px] sm:text-xs text-cyan-400 tracking-wider font-semibold">
              PRIMARY_DIRECTIVE
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-400">
              <Activity size={12} className="text-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed pl-2 font-normal">
            {PORTFOLIO_INFO.primaryDirective}
          </p>
        </div>

        {/* Goal & Quote Box */}
        <div className="md:col-span-12 bg-[#040913]/90 rounded-xl border border-cyan-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <span className="text-cyan-400 font-cyber font-bold text-base">&quot;</span>
            <span>{PORTFOLIO_INFO.headlineKorean}</span>
            <span className="text-cyan-400 font-cyber font-bold text-base">&quot;</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono-tech text-cyan-300">
            <Target size={14} className="text-cyan-400 flex-shrink-0" />
            <span><strong className="text-cyan-200">Goal:</strong> {PORTFOLIO_INFO.goal}</span>
          </div>
        </div>

      </div>

      {/* Cyber System Status Ticker */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono-tech text-slate-400">
        <div className="flex items-center gap-1.5">
          <Cpu size={12} className="text-cyan-400" />
          <span>CORE: <span className="text-slate-200">ARM Cortex-M4 & ESP32</span></span>
        </div>
        <span className="text-cyan-900">•</span>
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          <span>FOCUS: <span className="text-slate-200">PID Control & Autonomous Robotics</span></span>
        </div>
      </div>
    </section>
  );
};
