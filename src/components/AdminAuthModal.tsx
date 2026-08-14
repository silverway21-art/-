import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, X, Check, UserCheck, Key, ArrowRight } from 'lucide-react';
import { AdminUser } from '../types';
import { ROOT_ADMIN_EMAIL, authenticateAdmin } from '../data/adminAuth';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [emailInput, setEmailInput] = useState(ROOT_ADMIN_EMAIL);
  const [passcodeInput, setPasscodeInput] = useState('zion2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const res = authenticateAdmin(emailInput, passcodeInput);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 250);
  };

  const handleQuickRootLogin = () => {
    setEmailInput(ROOT_ADMIN_EMAIL);
    setPasscodeInput('zion2026');
    const res = authenticateAdmin(ROOT_ADMIN_EMAIL, 'zion2026');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#050c18] border border-cyan-500/60 rounded-2xl flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/80 bg-[#061122] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Shield size={20} />
            </div>
            <div>
              <span className="font-mono-tech text-[10px] text-cyan-400 font-bold tracking-wider block">
                // SYSTEM_AUTHORIZATION
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                관리자 인증 (Admin Login)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950 border border-transparent hover:border-cyan-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Super Admin Quick Access Banner */}
          <div className="p-3.5 rounded-xl bg-[#031527] border border-cyan-500/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tech font-bold text-cyan-300 flex items-center gap-1.5">
                <UserCheck size={14} className="text-cyan-400" />
                소유자 계정 원클릭 인증 (Owner Access)
              </span>
              <span className="text-[10px] font-mono-tech text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                ROOT_ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300">
              최고 관리자 계정: <span className="text-cyan-300 font-mono-tech font-bold">{ROOT_ADMIN_EMAIL}</span>
            </p>
            <button
              id="quick-root-login-btn"
              type="button"
              onClick={handleQuickRootLogin}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono-tech shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
            >
              <span>최고 관리자(Super Admin)로 즉시 로그인</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-cyan-950" />
            <span className="text-[10px] font-mono-tech text-slate-500 uppercase">
              Or Other Authorized Admin
            </span>
            <div className="flex-1 h-[1px] bg-cyan-950" />
          </div>

          {/* Form for other admins / passcodes */}
          <form onSubmit={handleLogin} className="space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/80 text-rose-300 text-xs font-mono-tech flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                관리자 이메일 (Admin Email)
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="example@robotics.org"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                보안 비밀번호 / 패스코드 (Passcode / Security PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Master PIN or Assigned Key"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-700 text-xs font-mono-tech font-bold transition-all active:scale-95"
            >
              <Lock size={14} />
              <span>{isLoading ? '인증 확인 중...' : '관리자 권한 확인 및 로그인'}</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#030712] border-t border-cyan-950 text-center">
          <p className="text-[11px] font-mono-tech text-slate-500">
            관리자 권한이 부여된 사용자만 프로젝트 등록, 수정 및 권한 위임이 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
