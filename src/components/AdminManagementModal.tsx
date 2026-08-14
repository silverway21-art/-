import React, { useState } from 'react';
import { Shield, UserPlus, Trash2, Key, Check, Copy, AlertCircle, X, Users, Crown, Sparkles } from 'lucide-react';
import { AdminUser, AdminRole } from '../types';
import { getAdminUsers, addAdminUser, removeAdminUser, ROOT_ADMIN_EMAIL } from '../data/adminAuth';

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser | null;
  onAdminListUpdated?: () => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAdminListUpdated,
}) => {
  const [adminList, setAdminList] = useState<AdminUser[]>(() => getAdminUsers());
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<AdminRole>('ADMIN');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

  const refreshList = () => {
    const updated = getAdminUsers();
    setAdminList(updated);
    if (onAdminListUpdated) onAdminListUpdated();
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const res = addAdminUser({
      email: emailInput.trim(),
      name: nameInput.trim() || emailInput.split('@')[0],
      role: roleInput,
      passcode: passcodeInput.trim() || undefined,
    });

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setEmailInput('');
      setNameInput('');
      setPasscodeInput('');
      refreshList();
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleRemove = (userId: string, targetName: string) => {
    if (!confirm(`'${targetName}' 님의 관리자 권한을 회수하시겠습니까?`)) {
      return;
    }

    const res = removeAdminUser(userId);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      refreshList();
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#050c18] border border-cyan-500/60 rounded-2xl flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/80 bg-[#061122] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] text-cyan-400 font-bold tracking-wider">
                  // ACCESS_CONTROL_POLICY
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono-tech">
                  {adminList.length} AUTHORIZED
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                관리자 권한 관리 및 다른 사람에게 권한 부여
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Current User Status Banner */}
          <div className="p-3.5 rounded-xl bg-[#031527] border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold font-mono-tech">
                <Crown size={18} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{currentUser?.name || '최고 관리자'}</span>
                  <span className="text-[10px] font-mono-tech px-2 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                    {currentUser?.role || 'SUPER_ADMIN'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono-tech">{currentUser?.email || ROOT_ADMIN_EMAIL}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono-tech text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
                ● ALL PERMISSIONS ACTIVE
              </span>
            </div>
          </div>

          {/* Feedback message banner */}
          {message && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono-tech flex items-center gap-2 animate-in fade-in ${
                message.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-600/80 text-rose-300'
              }`}
            >
              {message.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Grant Admin to New Person Form (Only if Super Admin / Admin) */}
          <div className="p-4 rounded-xl bg-[#030914] border border-cyan-900/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-cyan-400">
              <UserPlus size={15} />
              <span>새 관리자 / 팀원에게 권한 부여하기 (Grant Admin Rights)</span>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-tech text-cyan-300 mb-1">
                    부여 대상 이메일 (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="teammate@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-cyan-300 mb-1">
                    이름 / 호칭 (Name / Title)
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="예: 홍길동 (하드웨어 멘토)"
                    className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-cyan-300 mb-1">
                    부여할 권한 등급 (Role)
                  </label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN (프로젝트 추가/수정/삭제 전권)</option>
                    <option value="MENTOR">MENTOR (멘토/코치 피드백 & 프로젝트 등록)</option>
                    <option value="COLLABORATOR">COLLABORATOR (팀원 / 로봇 프로젝트 등록)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-tech text-cyan-300 mb-1">
                    지정 접속 키 (Custom Passcode, 미입력 시 자동생성)
                  </label>
                  <input
                    type="text"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="예: ROBOT2026 (선택)"
                    className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs font-mono-tech shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all active:scale-95"
                >
                  <UserPlus size={14} />
                  <span>관리자 권한 추가 부여 (Grant Access)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Authorized Admin List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-400 font-bold">
              <span>현재 등록된 관리자 목록 (Authorized Administrators):</span>
              <span className="text-slate-500 font-normal text-[11px]">
                총 {adminList.length}명
              </span>
            </div>

            <div className="space-y-2">
              {adminList.map((admin) => {
                const isRoot = admin.isRoot || admin.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

                return (
                  <div
                    key={admin.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isRoot
                        ? 'bg-[#041324]/90 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'bg-[#030712]/80 border-cyan-900/60 hover:border-cyan-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isRoot
                            ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {isRoot ? <Crown size={16} /> : <Shield size={16} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{admin.name}</span>
                          <span
                            className={`text-[10px] font-mono-tech px-1.5 py-0.2 rounded border ${
                              isRoot
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            {admin.role}
                          </span>
                          {isRoot && (
                            <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                              ROOT_OWNER
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono-tech flex items-center gap-2 mt-0.5">
                          <span>{admin.email}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 text-[10px]">등록일: {admin.addedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Passcode preview & copy */}
                      {admin.passcode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(admin.passcode || '', admin.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800 text-[11px] font-mono-tech text-cyan-300 transition-colors"
                          title="접속용 패스코드 복사"
                        >
                          <Key size={12} />
                          <span>Key: {admin.passcode}</span>
                          {copiedKey === admin.id ? (
                            <Check size={12} className="text-emerald-400 ml-1" />
                          ) : (
                            <Copy size={12} className="ml-1 opacity-70" />
                          )}
                        </button>
                      )}

                      {/* Remove button (Cannot remove Root) */}
                      {!isRoot && (
                        <button
                          type="button"
                          onClick={() => handleRemove(admin.id, admin.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-400 transition-colors"
                          title="관리자 권한 회수"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#030712] border-t border-cyan-950 flex items-center justify-between">
          <span className="text-[11px] font-mono-tech text-slate-500">
            소유자 계정: <span className="text-cyan-400">{ROOT_ADMIN_EMAIL}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
          >
            닫기 (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
