import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, Copy, Loader2, Sparkles } from 'lucide-react';
import { apiSendMessage } from '../lib/api';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onMessageSent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiSendMessage({
        senderName: name.trim(),
        email: email.trim() || '익명 연락처 (연락처 미기재)',
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setSent(true);
      if (onMessageSent) onMessageSent();

      setTimeout(() => {
        setSent(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setIsSubmitting(false);
        onClose();
      }, 2400);
    } catch (err) {
      console.error('Failed to send message:', err);
      setIsSubmitting(false);
    }
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
            <h3 className="text-base font-bold text-white font-mono-tech">MESSAGE PACKET DISPATCHED</h3>
            <p className="text-xs text-emerald-400 font-mono-tech">
              관리자 메일함(Admin Inbox)으로 메시지가 안전하게 도착했습니다!
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              지온이가 관리자 모드에서 실시간으로 확인 후 등록하신 연락처로 회신드립니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // SENDER_NAME / 소속 및 성함 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동 (KAIST 로보틱스 연구원 / 대회 동료)"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // CONTACT_EMAIL / 회신받을 이메일 (선택)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com (회신을 원하실 경우 입력)"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // SUBJECT / 메시지 제목 (선택)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: 2026 로봇 경진대회 알고리즘 멘토링 제휴 문의"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                // MESSAGE_PAYLOAD / 메시지 본문 <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="로봇 대회 제휴, 기술 질문, 응원 메시지를 자유롭게 남겨주세요."
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
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-[#030814] hover:bg-cyan-950 text-slate-400 border border-cyan-900 text-xs font-mono-tech transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs font-mono-tech shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Packet (메시지 전송)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
