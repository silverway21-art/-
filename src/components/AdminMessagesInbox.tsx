import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Inbox, 
  Star, 
  Trash2, 
  Reply, 
  CheckCircle2, 
  Clock, 
  Search, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Send, 
  User, 
  Sparkles, 
  Check,
  MessageSquare,
  ShieldCheck,
  Edit3,
  CornerDownRight
} from 'lucide-react';
import { ContactMessage } from '../types';
import { 
  apiGetMessages, 
  apiUpdateMessageStatus, 
  apiDeleteMessage, 
  subscribeToMessages, 
  apiSendAdminReply 
} from '../lib/api';

interface AdminMessagesInboxProps {
  onUnreadCountChange?: (count: number) => void;
}

export const AdminMessagesInbox: React.FC<AdminMessagesInboxProps> = ({ onUnreadCountChange }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'starred' | 'replied'>('all');
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // In-app direct reply state
  const [replyInputText, setReplyInputText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Fetch initial messages
  const loadMessages = async () => {
    setLoading(true);
    try {
      const list = await apiGetMessages();
      setMessages(list);
      if (list.length > 0 && !selectedMessageId) {
        setSelectedMessageId(list[0].id);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time changes from Firestore
    const unsubscribe = subscribeToMessages((updatedList) => {
      setMessages(updatedList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update unread count callback for parent tab badge
  useEffect(() => {
    const unread = messages.filter(m => !m.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
    // If no message selected and we have messages, select the first one
    if (!selectedMessageId && messages.length > 0) {
      setSelectedMessageId(messages[0].id);
    }
  }, [messages, onUnreadCountChange, selectedMessageId]);

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || null;

  // Sync reply input text when selected message changes
  useEffect(() => {
    if (selectedMessage?.replyText) {
      setReplyInputText(selectedMessage.replyText);
      setIsEditingReply(false);
    } else {
      setReplyInputText('');
      setIsEditingReply(false);
    }
  }, [selectedMessageId, selectedMessage?.replyText]);

  // Handle selecting a message - automatically marks it as read
  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessageId(msg.id);
    if (!msg.read) {
      const updated = messages.map(m => m.id === msg.id ? { ...m, read: true } : m);
      setMessages(updated);
      await apiUpdateMessageStatus(msg.id, { read: true });
    }
  };

  // Toggle Starred
  const handleToggleStar = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStarred = !msg.starred;
    const updated = messages.map(m => m.id === msg.id ? { ...m, starred: newStarred } : m);
    setMessages(updated);
    await apiUpdateMessageStatus(msg.id, { starred: newStarred });
    showToast(newStarred ? '중요 메시지로 등록되었습니다.' : '중요 표시가 해제되었습니다.');
  };

  // Toggle Read/Unread
  const handleToggleRead = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newRead = !msg.read;
    const updated = messages.map(m => m.id === msg.id ? { ...m, read: newRead } : m);
    setMessages(updated);
    await apiUpdateMessageStatus(msg.id, { read: newRead });
    showToast(newRead ? '읽음 처리되었습니다.' : '안 읽음 상태로 변경되었습니다.');
  };

  // Delete message
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const remaining = messages.filter(m => m.id !== id);
    setMessages(remaining);
    setDeleteConfirmId(null);

    if (selectedMessageId === id) {
      setSelectedMessageId(remaining.length > 0 ? remaining[0].id : null);
    }

    if (onUnreadCountChange) {
      const remainingUnread = remaining.filter(m => !m.read).length;
      onUnreadCountChange(remainingUnread);
    }

    await apiDeleteMessage(id);
    showToast('메시지가 성공적으로 삭제되었습니다.');
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const unreadMsgs = messages.filter(m => !m.read);
    if (unreadMsgs.length === 0) {
      showToast('미열람 메시지가 없습니다.');
      return;
    }
    const updated = messages.map(m => ({ ...m, read: true }));
    setMessages(updated);
    for (const m of unreadMsgs) {
      await apiUpdateMessageStatus(m.id, { read: true });
    }
    showToast(`총 ${unreadMsgs.length}건의 메시지를 모두 읽음 처리했습니다.`);
  };

  // Submit in-app direct reply
  const handleSubmitInAppReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMessage) return;
    if (!replyInputText.trim()) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const replyContent = replyInputText.trim();
      const nowIso = new Date().toISOString();
      const author = '김지온 (로봇 연구원)';

      await apiSendAdminReply(selectedMessage.id, replyContent, author);

      // Update state immediately
      const updated = messages.map(m => 
        m.id === selectedMessage.id 
          ? { ...m, replied: true, replyText: replyContent, repliedAt: nowIso, replyAuthor: author }
          : m
      );
      setMessages(updated);
      setIsEditingReply(false);
      showToast(`'${selectedMessage.senderName}' 님에게 앱 내 답변이 안전하게 전송되었습니다.`);
    } catch (err: any) {
      console.error('Failed to submit in-app reply:', err);
      alert('답변 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Quick preset template inserter
  const handleInsertTemplate = (type: 'gratitude' | 'meeting' | 'tech') => {
    if (!selectedMessage) return;
    let template = '';
    if (type === 'gratitude') {
      template = `안녕하세요, ${selectedMessage.senderName}님!\n보내주신 소중한 메시지와 관심 감사드립니다.\n\n남겨주신 내용을 꼼꼼히 확인하였으며, 질문해 주신 부분에 대해 기쁜 마음으로 공유해 드리고자 합니다.\n\n감사합니다.\n김지온 드림`;
    } else if (type === 'meeting') {
      template = `안녕하세요, ${selectedMessage.senderName}님!\n대회 및 연구 관련 제휴/멘토링 제안에 깊이 감사드립니다.\n\n현재 프로젝트 일정과 로봇 시뮬레이션 작업 일정을 조율하여 추가 온/오프라인 미팅이 가능합니다. 추가 세부 사항을 논의할 수 있는 일정이나 연락처를 편하신 시간에 공유 부탁드립니다.\n\n김지온 드림`;
    } else if (type === 'tech') {
      template = `안녕하세요, ${selectedMessage.senderName}님.\n기술 및 알고리즘 구현에 관심을 가져주셔서 감사합니다.\n\n문의하신 모델의 경우 시뮬레이션 환경에서 PID 이득 튜닝 및 칼만 필터 센서 융합을 통해 안정성을 확보하였습니다. 추가적인 코드 상세나 회로도는 포트폴리오의 각 프로젝트 상세 설명 및 깃허브 레포지토리를 통해서도 확인하실 수 있습니다.\n\n감사합니다.\n김지온 드림`;
    }
    setReplyInputText(template);
  };

  // Open default mail client (mailto) as optional secondary channel
  const handleOpenMailto = (msg: ContactMessage) => {
    if (!msg.email || msg.email.includes('미기재')) {
      alert('발신자의 이메일 주소가 등록되지 않았습니다.');
      return;
    }
    const subjectEnc = encodeURIComponent(`[김지온 로봇 연구실 회신] ${msg.subject || '문의하신 내용에 대한 답변입니다'}`);
    const bodyEnc = encodeURIComponent(`안녕하세요 ${msg.senderName}님,\n\n김지온 포트폴리오 사이트를 통해 보내주신 소중한 메시지 감사드립니다.\n\n---\n[수신된 원본 메시지]:\n${msg.message}\n---\n\n`);
    window.location.href = `mailto:${msg.email}?subject=${subjectEnc}&body=${bodyEnc}`;
  };

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    showToast('발신자 이메일이 클립보드에 복사되었습니다.');
  };

  // Filter & Search Logic
  const filteredMessages = messages.filter(m => {
    // Tab filter
    if (filterTab === 'unread' && m.read) return false;
    if (filterTab === 'starred' && !m.starred) return false;
    if (filterTab === 'replied' && !m.replied) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.senderName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchSubject = (m.subject || '').toLowerCase().includes(q);
      const matchBody = m.message.toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchBody;
    }
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;
  const starredCount = messages.filter(m => m.starred).length;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Toast alert */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono-tech shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#040c20]/80 border border-cyan-900/60 rounded-2xl p-5 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
            <Mail size={15} />
            <span>COMMUNICATION INBOX & IN-APP RESPONSE SYSTEM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <span>수신 메시지함 & 앱 내 직접 답변</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                {unreadCount}건 미열람
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">
            방문자의 문의를 열람하고, 이메일 클라이언트 없이 <span className="text-cyan-300 font-medium">앱 안에서 직접 답변</span>을 작성하여 발신자에게 비공개로 실시간 전송합니다.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#02050e] hover:bg-cyan-950 border border-cyan-900/80 text-slate-300 hover:text-white text-xs transition-colors disabled:opacity-40"
          >
            <Check size={14} />
            <span>모두 읽음 처리</span>
          </button>

          <button
            onClick={loadMessages}
            className="p-2 rounded-xl bg-[#02050e] hover:bg-cyan-950 border border-cyan-900 text-slate-400 hover:text-white text-xs transition-colors"
            title="새로고침"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main Mail Window Container */}
      <div className="bg-[#030919]/90 border border-cyan-900/80 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col">
        
        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-cyan-950/80 bg-[#020612]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === 'all'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
              }`}
            >
              <Inbox size={13} />
              <span>전체 ({messages.length})</span>
            </button>

            <button
              onClick={() => setFilterTab('unread')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === 'unread'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>미열람 ({unreadCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('starred')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === 'starred'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
              }`}
            >
              <Star size={13} className={starredCount > 0 ? 'text-amber-400 fill-amber-400' : ''} />
              <span>중요 ({starredCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('replied')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterTab === 'replied'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#030a1c] border border-cyan-950 text-slate-400 hover:text-white'
              }`}
            >
              <Reply size={13} />
              <span>답변 완료 ({messages.filter(m => m.replied).length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="발신자명, 이메일, 본문 검색..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#01040c] border border-cyan-950 focus:border-cyan-400 rounded-lg text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dual Split Pane View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Messages List (5 cols) */}
          <div className="lg:col-span-5 border-r border-cyan-950/80 bg-[#020510]/60 flex flex-col">
            <div className="p-2.5 border-b border-cyan-950/50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>수신 목록 ({filteredMessages.length}개 항목)</span>
              <span className="text-[10px] text-cyan-400">클릭 시 자동 읽음 처리</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-cyan-950/40 max-h-[660px]">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-900/60 mx-auto flex items-center justify-center text-cyan-500">
                    <Inbox size={22} />
                  </div>
                  <div className="text-xs text-slate-300 font-bold">수신된 메시지가 없습니다</div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {searchQuery 
                      ? `'${searchQuery}' 검색 결과가 없습니다.`
                      : '방문자가 상단 Connect 메뉴를 통해 문의를 전송하면 이곳에 실시간으로 표시됩니다.'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessageId;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-3.5 sm:p-4 cursor-pointer transition-all relative group ${
                        isSelected 
                          ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 text-white' 
                          : 'hover:bg-cyan-950/20 text-slate-300'
                      } ${!msg.read ? 'bg-[#030d24]/60' : ''}`}
                    >
                      {/* Top row: Sender & Timestamp */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {/* Unread indicator */}
                          {!msg.read ? (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-transparent flex-shrink-0" />
                          )}
                          <span className={`text-xs truncate font-bold ${!msg.read ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {msg.senderName}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0 font-mono-tech">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="text-xs text-white font-bold truncate mb-1 pl-4">
                        {msg.subject || '(제목 없음)'}
                      </div>

                      {/* Message Preview Snippet */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 pl-4 leading-relaxed">
                        {msg.message}
                      </p>

                      {/* Bottom action tags */}
                      <div className="flex items-center justify-between gap-2 mt-2.5 pl-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#01040c] border border-cyan-950 text-slate-400 truncate max-w-[160px]">
                            {msg.email || '이메일 없음'}
                          </span>
                          {msg.replied && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                              <Check size={10} />
                              <span>답변 완료</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Action Icons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(msg, e)}
                            className="p-1 rounded hover:bg-cyan-900/60 text-slate-400 hover:text-amber-400 transition-colors"
                            title={msg.starred ? '중요 표시 해제' : '중요 메시지로 등록'}
                          >
                            <Star 
                              size={13} 
                              className={msg.starred ? 'text-amber-400 fill-amber-400' : ''} 
                            />
                          </button>

                          {deleteConfirmId === msg.id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleDelete(msg.id, e)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-sm"
                                title="삭제 확인"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                                title="취소"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(msg.id);
                              }}
                              className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Message Detail & In-App Direct Reply (7 cols) */}
          <div className="lg:col-span-7 bg-[#030716]/90 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[720px]">
            {selectedMessage ? (
              <div className="space-y-6 flex-1">
                
                {/* Message Header */}
                <div className="border-b border-cyan-950/80 pb-5 space-y-4">
                  
                  {/* Top Bar: Subject & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-mono-tech">
                          INCOMING INQUIRY
                        </span>
                        {selectedMessage.replied && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-mono-tech flex items-center gap-1 font-bold">
                            <CheckCircle2 size={11} />
                            <span>앱 내 답변 완료</span>
                          </span>
                        )}
                        {!selectedMessage.read && (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-[10px] text-amber-300 font-mono-tech">
                            NEW UNREAD
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                        {selectedMessage.subject || '(제목 없음)'}
                      </h2>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => handleToggleStar(selectedMessage, e)}
                        className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                          selectedMessage.starred
                            ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                            : 'bg-[#02050e] border-cyan-900 text-slate-400 hover:text-white'
                        }`}
                        title="중요 메시지 토글"
                      >
                        <Star size={15} className={selectedMessage.starred ? 'fill-amber-400' : ''} />
                      </button>

                      <button
                        onClick={() => handleToggleRead(selectedMessage)}
                        className="px-2.5 py-2 rounded-xl bg-[#02050e] hover:bg-cyan-950 border border-cyan-900 text-slate-300 hover:text-white text-xs transition-colors"
                        title="읽음/안읽음 상태 전환"
                      >
                        {selectedMessage.read ? '안읽음으로 표시' : '읽음으로 표시'}
                      </button>

                      {deleteConfirmId === selectedMessage.id ? (
                        <div className="flex items-center gap-1 bg-[#02050e] p-1 rounded-xl border border-rose-800/80">
                          <button
                            onClick={() => handleDelete(selectedMessage.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                          >
                            삭제 확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(selectedMessage.id)}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs transition-colors flex items-center gap-1"
                          title="메시지 삭제"
                        >
                          <Trash2 size={15} />
                          <span className="hidden sm:inline text-xs">삭제</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sender Profile Box */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#02040c] border border-cyan-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-300 font-bold text-sm">
                        {selectedMessage.senderName.slice(0, 1) || 'Z'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedMessage.senderName}</span>
                          {selectedMessage.email && (
                            <span className="text-[11px] text-cyan-400 font-mono-tech font-normal">
                              &lt;{selectedMessage.email}&gt;
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono-tech flex items-center gap-2 mt-0.5">
                          <Clock size={11} />
                          <span>수신 일시: {new Date(selectedMessage.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedMessage.email && (
                        <>
                          <button
                            onClick={() => handleCopyEmail(selectedMessage.email)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-[11px] text-cyan-300 rounded-lg transition-colors"
                          >
                            <Copy size={12} />
                            <span>{copiedEmail ? '복사됨' : '이메일 복사'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenMailto(selectedMessage)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#051124] hover:bg-cyan-950 border border-cyan-800 text-slate-300 hover:text-white text-[11px] rounded-lg transition-colors"
                            title="외부 메일 클라이언트로 보내기"
                          >
                            <ExternalLink size={12} />
                            <span>외부 메일앱 (선택)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="p-5 bg-[#020510] border border-cyan-950 rounded-2xl space-y-2.5">
                  <div className="text-[11px] text-cyan-400 font-mono-tech border-b border-cyan-950/60 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={13} />
                      <span>수신된 원본 문의 내용 (VISITOR INQUIRY)</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">발신자: {selectedMessage.senderName}</span>
                  </div>
                  <div className="text-sm sm:text-base text-slate-200 whitespace-pre-wrap leading-relaxed font-sans py-1">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Registered In-App Reply Display (if already replied) */}
                {selectedMessage.replied && selectedMessage.replyText && !isEditingReply && (
                  <div className="p-5 bg-gradient-to-br from-[#02181a] via-[#021220] to-[#040f28] border border-emerald-500/50 rounded-2xl space-y-3 shadow-[0_0_25px_rgba(16,185,129,0.15)] animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <span>{selectedMessage.replyAuthor || '김지온 연구원'}의 등록된 앱 내 답변</span>
                            <span className="px-1.5 py-0.2 bg-emerald-900/80 text-emerald-200 text-[9px] rounded font-mono-tech">
                              전송 완료
                            </span>
                          </div>
                          {selectedMessage.repliedAt && (
                            <div className="text-[10px] text-slate-400 font-mono-tech">
                              답변 시각: {formatDate(selectedMessage.repliedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:flex items-center gap-1 text-[10px] text-cyan-400 font-mono-tech px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                          <ShieldCheck size={11} />
                          <span>발신자 본인에게만 비공개 노출</span>
                        </span>

                        <button
                          onClick={() => setIsEditingReply(true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs transition-colors"
                        >
                          <Edit3 size={12} />
                          <span>답변 수정</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#010814]/80 border border-emerald-950 rounded-xl">
                      <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.replyText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck size={13} />
                        <span>발신자가 앱의 'Connect' 모달 열람 시 이 답변이 즉시 표시됩니다.</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* In-App Direct Reply Composer (Shown if not replied OR if editing) */}
                {(!selectedMessage.replied || !selectedMessage.replyText || isEditingReply) && (
                  <form onSubmit={handleSubmitInAppReply} className="p-5 bg-gradient-to-r from-[#03091c] to-[#051530] border border-cyan-700/60 rounded-2xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-950/80 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                          <Reply size={15} />
                          <span>앱 내 직접 답변 작성 (IN-APP DIRECT RESPONSE)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          답변을 작성하면 <span className="text-cyan-300 font-semibold">{selectedMessage.senderName}</span> 님의 화면에만 안전하게 실시간 표시되며, 타인에게는 절대 보이지 않습니다.
                        </p>
                      </div>

                      {isEditingReply && (
                        <button
                          type="button"
                          onClick={() => setIsEditingReply(false)}
                          className="self-start sm:self-auto text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700"
                        >
                          수정 취소
                        </button>
                      )}
                    </div>

                    {/* Preset Template Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-mono-tech flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-400" />
                        <span>빠른 답변 양식 템플릿 삽입:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('gratitude')}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800 text-[11px] text-cyan-300 transition-colors"
                        >
                          관심 감사 인사
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('meeting')}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800 text-[11px] text-cyan-300 transition-colors"
                        >
                          멘토링 / 대회 제휴
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate('tech')}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-800 text-[11px] text-cyan-300 transition-colors"
                        >
                          기술 질문 답변
                        </button>
                      </div>
                    </div>

                    {/* Textarea */}
                    <div className="space-y-1">
                      <textarea
                        rows={5}
                        value={replyInputText}
                        onChange={(e) => setReplyInputText(e.target.value)}
                        placeholder={`발신자(${selectedMessage.senderName})님에게 전달할 답변을 입력하세요. 전송 즉시 해당 방문자의 앱 접속 화면에만 프라이빗하게 표시됩니다...`}
                        className="w-full p-3.5 bg-[#010510] border border-cyan-800/80 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none leading-relaxed resize-none shadow-inner"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono-tech">
                        <span>작성자: 김지온 (로봇 연구원)</span>
                        <span>{replyInputText.length} 자 작성됨</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ShieldCheck size={13} className="text-emerald-400" />
                        <span>보안 암호화 전송: 다른 사람에게는 비공개</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReply || !replyInputText.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm font-mono-tech shadow-[0_0_18px_rgba(34,211,238,0.4)] transition-all cursor-pointer"
                      >
                        {isSubmittingReply ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>전송 중...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>{isEditingReply ? '수정된 답변 전송' : '앱 내 답변 즉시 전송'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-cyan-950/30 border border-cyan-900/60 flex items-center justify-center text-cyan-400">
                  <Mail size={28} />
                </div>
                <h3 className="text-sm font-bold text-white">메시지를 선택하세요</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  좌측 수신 목록에서 항목을 선택하면 문의 내용 확인 및 앱 내 직접 답변 작성이 가능합니다.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
