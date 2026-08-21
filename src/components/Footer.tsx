import React, { useState } from 'react';
import { Terminal, Shield, ArrowUp, Lock } from 'lucide-react';
import { PortfolioInfo } from '../types';

interface FooterProps {
  onOpenTerminal: () => void;
  onOpenAdmin?: () => void;
  portfolioInfo?: PortfolioInfo;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerminal, onOpenAdmin, portfolioInfo }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-cyan-950/80 bg-[#02050c] text-slate-400 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono-tech">
        
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          <span className="text-white font-bold tracking-wider">
            {portfolioInfo?.footerText ? `© ${portfolioInfo.year || 2026} ${portfolioInfo.footerText}` : `© 2026 ZION'S PORTFOLIO`}
          </span>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-cyan-400 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            <Shield size={12} />
            <span>PRIVACY POLICY</span>
          </button>
          
          <span className="text-cyan-900">•</span>

          <button
            onClick={onOpenTerminal}
            className="hover:text-cyan-400 text-cyan-500 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            <Terminal size={12} />
            <span>TERMINAL ACCESS</span>
          </button>

          {onOpenAdmin && (
            <>
              <span className="text-cyan-900">•</span>
              <button
                onClick={onOpenAdmin}
                className="hover:text-cyan-300 text-slate-400 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <Lock size={12} className="text-cyan-500" />
                <span>ADMIN PORTAL</span>
              </button>
            </>
          )}
        </div>

        {/* Right Scroll Top */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">{portfolioInfo?.coreArch || 'Autonomous Robotics Stack'}</span>
          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-900 hover:border-cyan-700 transition-colors"
            title="Scroll to top"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      {/* Privacy Policy Dialog */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#050c18] border border-cyan-500/60 rounded-xl p-6 max-w-md w-full space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
            <h3 className="text-sm font-bold text-cyan-400 font-mono-tech">// PRIVACY & TERMS POLICY</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono-tech">
              {portfolioInfo?.privacyPolicy || '김지온의 로봇 및 코딩 포트폴리오의 모든 연구 및 프로젝트 자료는 교육, 대회 및 자율주행 연구 목적으로 공개되어 있습니다. 본 사이트는 불필요한 개인정보를 수집하지 않으며 연구 데이터의 무단 상업적 도용을 금합니다.'}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-400 text-black font-bold text-xs font-mono-tech"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

