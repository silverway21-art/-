import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, X, Key, User, RefreshCw } from 'lucide-react';
import { AdminUser } from '../types';
import { apiLogin } from '../lib/api';

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
  const [usernameInput, setUsernameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim() || !passcodeInput.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiLogin(usernameInput.trim(), passcodeInput.trim(), false);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('인증 처리 중 오류가 발생했습니다.');
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
          <p className="text-xs text-slate-300">
            포트폴리오 관리 및 데이터 수정을 위해 부여받은 관리자 아이디와 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-3.5" autoComplete="off">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/80 text-rose-300 text-xs font-mono-tech flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-cyan-400" />
                <span>관리자 아이디 (Admin ID / Email)</span>
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="예: zionadminID"
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1 flex items-center gap-1.5">
                <Key size={13} className="text-cyan-400" />
                <span>비밀번호 (Password)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  className="w-full pl-3 pr-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono-tech font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-black" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>관리자 로그인 (Authenticate)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#030712] border-t border-cyan-950 text-center">
          <p className="text-[11px] font-mono-tech text-slate-500">
            인증된 최고 관리자만 포트폴리오 프로젝트 및 설정을 수정할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
