import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  ArrowRight,
  Inbox
} from 'lucide-react';
import { apiSendMessage, apiGetMyInquiries } from '../lib/api';
import { getVisitorId } from '../lib/visitorSession';
import { ContactMessage } from '../types';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onMessageSent }) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // My Inquiries & Replies State
  const [myMessages, setMyMessages] = useState<ContactMessage[]>([]);
  const [loadingMyMessages, setLoadingMyMessages] = useState(false);
  const [emailLookup, setEmailLookup] = useState('');
  const [showLookupInput, setShowLookupInput] = useState(false);

  // Fetch my inquiries
  const fetchMyInquiries = async (customEmail?: string) => {
    setLoadingMyMessages(true);
    try {
      const visitorId = getVisitorId();
      const targetEmail = customEmail !== undefined ? customEmail.trim() : email.trim();
      const list = await apiGetMyInquiries(visitorId, targetEmail || undefined);
      setMyMessages(list);
    } catch (err) {
      console.error('Failed to fetch my inquiries:', err);
    } finally {
      setLoadingMyMessages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyInquiries();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sentEmail = email.trim();
      const res = await apiSendMessage({
        senderName: name.trim(),
        email: sentEmail || '익명 연락처 (연락처 미기재)',
        subject: subject.trim() || undefined,
        message: message.trim(),
      });

      if (res.success && res.message) {
        setMyMessages(prev => [res.message, ...prev.filter(m => m.id !== res.message.id)]);
      }

      setSentSuccess(true);
      if (onMessageSent) onMessageSent();

      // Reset form fields
      setName('');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
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

  const handlePerformLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLookup.trim()) return;
    fetchMyInquiries(emailLookup.trim());
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const repliedCount = myMessages.filter(m => m.replied && m.replyText).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#040a16] border border-cyan-500/60 rounded-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cyan-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Connect with Zion</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono-tech">
                  1:1 PRIVATE CHANNEL
                </span>
              </h2>
              <p className="text-[11px] font-mono-tech text-cyan-400">김지온 로봇 연구실 전용 다이렉트 소통 채널</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-1 border-b border-cyan-950/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('compose');
              setSentSuccess(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'compose'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
            }`}
          >
            <Send size={12} />
            <span>새 메시지 작성</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchMyInquiries();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare size={12} />
            <span>내 문의 & 도착한 답변</span>
            {myMessages.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-tech ${
                repliedCount > 0 
                  ? 'bg-emerald-400 text-black font-bold animate-pulse' 
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {repliedCount > 0 ? `답변 ${repliedCount}건` : myMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Compose Form */}
        {activeTab === 'compose' && (
          <div className="flex-1 overflow-y-auto pt-3 space-y-4">
            {sentSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 bg-[#020614]/80 p-6 rounded-2xl border border-cyan-900/60">
                <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-base font-bold text-white font-mono-tech">MESSAGE PACKET DISPATCHED</h3>
                <p className="text-xs text-emerald-400 font-mono-tech">
                  김지온 연구원의 수신함으로 메시지가 안전하게 도착했습니다!
                </p>
                <div className="p-3 bg-[#01040e] border border-cyan-950 rounded-xl text-left text-xs text-slate-300 space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>개인정보 및 프라이버시 보호 안내</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    지온 연구원이 앱 안에서 직접 답변을 작성하면, 다른 사람에게는 일절 노출되지 않고 <strong className="text-white">오직 본인 기기의 [내 문의 & 도착한 답변] 탭</strong>에만 비공개로 실시간 표시됩니다.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSentSuccess(false);
                      setActiveTab('history');
                      fetchMyInquiries();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono-tech shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                  >
                    <span>내 문의 내역 확인</span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-3 rounded-xl bg-[#02050e] hover:bg-cyan-950 border border-cyan-900 text-slate-300 text-xs"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-400 flex-shrink-0" />
                  <span>문의 및 답변은 1:1 암호화 채널로 관리되어 타인에게 절대 노출되지 않습니다.</span>
                </div>

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
                    // CONTACT_EMAIL / 이메일 주소 (선택)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com (기재 시 다른 기기에서도 조회 가능)"
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
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 transition-colors"
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
                    닫기
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs font-mono-tech shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>전송 중...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>메시지 전송 (Send Packet)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: My Inquiries & Replies History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto pt-3 space-y-3">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#020512] border border-cyan-950 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span className="text-[11px]">발신자 전용 비공개 수신함</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLookupInput(!showLookupInput)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  {showLookupInput ? '이메일 검색 닫기' : '다른 이메일로 보낸 문의 찾기'}
                </button>

                <button
                  type="button"
                  onClick={() => fetchMyInquiries()}
                  className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:text-white"
                  title="새로고침"
                >
                  <RefreshCw size={12} className={loadingMyMessages ? 'animate-spin text-cyan-400' : ''} />
                </button>
              </div>
            </div>

            {/* Optional Email Lookup Input */}
            {showLookupInput && (
              <form onSubmit={handlePerformLookup} className="flex gap-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/80 animate-in fade-in">
                <input
                  type="email"
                  value={emailLookup}
                  onChange={(e) => setEmailLookup(e.target.value)}
                  placeholder="작성 시 입력했던 이메일 주소를 입력하세요..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#01040e] border border-cyan-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1"
                >
                  <Search size={12} />
                  <span>조회</span>
                </button>
              </form>
            )}

            {/* List of My Inquiries */}
            {loadingMyMessages ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                <Loader2 size={24} className="animate-spin text-cyan-400" />
                <span className="text-xs font-mono-tech">문의 내역을 안전하게 불러오는 중...</span>
              </div>
            ) : myMessages.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center text-cyan-400">
                  <Inbox size={22} />
                </div>
                <h4 className="text-xs font-bold text-slate-200">등록된 문의 내역이 없습니다</h4>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  이 기기에서 전송된 문의가 아직 없습니다. 상단의 '새 메시지 작성' 탭을 통해 메시지를 남겨주시면 연구원의 답변을 이곳에서 바로 확인하실 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="mt-1 px-3.5 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  새 메시지 작성하기
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {myMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className="p-4 rounded-xl bg-[#020512] border border-cyan-950 space-y-3 hover:border-cyan-900/80 transition-colors"
                  >
                    {/* Inquiry Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-cyan-950/80 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {msg.subject || '(제목 없음)'}
                          </span>
                          {msg.replied && msg.replyText ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold flex items-center gap-1 font-mono-tech">
                              <CheckCircle2 size={11} />
                              <span>답변 도착</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-mono-tech">
                              답변 대기 중
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono-tech mt-1">
                          <span>발신자: {msg.senderName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Original Sent Inquiry Content */}
                    <div className="p-3 rounded-lg bg-[#01040d] border border-cyan-950/60 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>

                    {/* Researcher's Direct In-App Reply (If available) */}
                    {msg.replied && msg.replyText ? (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#02181a] to-[#031526] border border-emerald-500/60 space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                              Z
                            </div>
                            <span className="text-xs font-bold text-emerald-300">
                              {msg.replyAuthor || '김지온 연구원'}의 답변
                            </span>
                          </div>
                          {msg.repliedAt && (
                            <span className="text-[10px] text-slate-400 font-mono-tech">
                              {formatDate(msg.repliedAt)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed pt-1">
                          {msg.replyText}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 pt-1 border-t border-emerald-950">
                          <ShieldCheck size={12} />
                          <span>1:1 비공개: 이 답변은 오직 본인(발신자)의 화면에만 표시됩니다.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-950 text-[11px] text-slate-400 flex items-center gap-2 font-mono-tech">
                        <Clock size={13} className="text-amber-400" />
                        <span>연구원이 문의 내용을 확인하고 있습니다. 답변 등록 시 이곳에 실시간으로 표시됩니다.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
