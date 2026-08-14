import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, Copy } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2200);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('silverway21@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#050c18] border border-cyan-500/60 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Connect with Zion</h2>
              <p className="text-[11px] font-mono-tech text-cyan-400">김지온 로봇 연구실 통신 채널</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-cyan-950"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-white font-mono-tech">MESSAGE TRANSMITTED</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              지온이에게 메시지가 전달되었습니다. 확인 후 회신드리겠습니다!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // SENDER_NAME / 소속 및 성함
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동 (로보틱스 멘토 / 동료)"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // CONTACT_EMAIL / 연락처 (선택)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // MESSAGE_PAYLOAD / 내용
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="로봇 대회 제휴, 기술 질문, 응원 메시지를 남겨주세요."
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              />
            </div>

            {/* Direct Email Copy Badge */}
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-900/60 flex items-center justify-between text-xs font-mono-tech">
              <span className="text-slate-400">Direct Contact: <strong className="text-cyan-300">silverway21@gmail.com</strong></span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800"
              >
                <Copy size={12} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-[#030814] hover:bg-cyan-950 text-slate-400 border border-cyan-900 text-xs font-mono-tech transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs font-mono-tech shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all"
              >
                <Send size={14} />
                <span>Send Packet</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
