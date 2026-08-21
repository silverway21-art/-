import React, { useState } from 'react';
import { Trophy, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { AWARDS_DATA as DEFAULT_AWARDS, PORTFOLIO_INFO as DEFAULT_INFO } from '../data/portfolioData';
import { AwardItem, PortfolioInfo } from '../types';

interface AwardsSectionProps {
  awardsData?: AwardItem[];
  portfolioInfo?: PortfolioInfo;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({ awardsData, portfolioInfo }) => {
  const [showGoalPlanner, setShowGoalPlanner] = useState(false);
  const awards = awardsData && awardsData.length > 0 ? awardsData : DEFAULT_AWARDS;
  const info = portfolioInfo || (DEFAULT_INFO as PortfolioInfo);

  return (
    <section id="awards" className="max-w-4xl mx-auto px-4 py-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Trophy size={22} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Certifications & Awards
            <span className="text-xs font-mono-tech font-normal text-cyan-500 border border-cyan-900/60 px-2 py-0.5 rounded">
              HONORS_DB
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono-tech">
            공식 대회 수상 이력 및 챌린지 인증서 데이터베이스
          </p>
        </div>
      </div>

      {/* Dashed Cyber Scanner Box */}
      <div className="relative rounded-2xl border-2 border-dashed border-cyan-900/70 hover:border-cyan-500/60 bg-[#050b16]/70 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        
        {/* Subtle Cyber Radar Wave */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Trophy size={32} className="stroke-[1.5]" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Text */}
        <h3 className="font-mono-tech text-sm sm:text-base font-bold text-slate-200 tracking-widest uppercase mb-1">
          {info.noAwardsTitle || 'NO AWARDS YET'}
        </h3>
        <p className="font-mono-tech text-xs sm:text-sm text-cyan-500/80 tracking-wide mb-4">
          {info.noAwardsDesc || 'Database scanning... 0 records found.'}
        </p>

        <p className="text-xs text-slate-400 max-w-md font-mono-tech mb-6 leading-relaxed">
          &quot;{info.noAwardsQuote || info.quote || '최대한 열심히 경기에 임했고 조별 경기 3연승의 성과를 거두었습니다. 현재 다음 시즌 트로피 획득을 위해 알고리즘 고도화 훈련 중입니다.'}&quot;
        </p>

        {/* Target Goal Roadmap Toggle */}
        <button
          onClick={() => setShowGoalPlanner(!showGoalPlanner)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 text-xs font-mono-tech transition-colors shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        >
          <Target size={14} className="text-cyan-400" />
          <span>{showGoalPlanner ? 'Hide Target Goals' : 'View Target Goals & Milestones'}</span>
        </button>

        {/* Goal Planner Details */}
        {showGoalPlanner && (
          <div className="w-full max-w-md mt-6 p-4 rounded-xl bg-[#030813] border border-cyan-900 text-left space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-cyan-400 font-bold">
              <Sparkles size={14} />
              <span>UPCOMING TOURNAMENT TARGETS</span>
            </div>
            {awards.map((target) => (
              <div key={target.id} className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-950 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white mb-0.5">{target.title}</div>
                  <div className="text-[11px] font-mono-tech text-slate-400">{target.organization} • {target.category}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono-tech flex-shrink-0 flex items-center gap-1">
                  <CheckCircle2 size={10} /> {target.status || 'TARGET'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

