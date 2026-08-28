import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  User, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  ExternalLink, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Cpu, 
  Sparkles,
  Terminal as TerminalIcon,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  Rocket,
  Wrench,
  Trophy,
  Save,
  RotateCcw,
  Check,
  Globe,
  Upload,
  Image as ImageIcon,
  Mail,
  Inbox,
  Music,
  Disc,
  Volume2,
  Power
} from 'lucide-react';
import { ProjectItem, AdminUser, SiteConfig, JourneyItem, SkillItem, AwardItem, ThemeTrack, MusicConfig } from '../types';
import { apiLogin, apiLogout, subscribeToMessages, apiGetMessages } from '../lib/api';
import { DEFAULT_SITE_CONFIG } from '../data/portfolioData';
import { AdminMessagesInbox } from './AdminMessagesInbox';
import { AdminThemeMusicModal } from './AdminThemeMusicModal';
import { cyberAudioEngine } from '../lib/cyberAudioEngine';

interface AdminPortalPageProps {
  currentUser: AdminUser | null;
  projects: ProjectItem[];
  siteConfig: SiteConfig;
  musicConfig: MusicConfig;
  onNavigateHome: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  onLogout: () => void;
  onOpenAddProject: () => void;
  onOpenEditProject: (project: ProjectItem) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectPreview: (project: ProjectItem) => void;
  onSaveSiteConfig: (newConfig: Partial<SiteConfig>) => Promise<boolean>;
  onSaveMusicConfig: (updatedConfig: MusicConfig) => Promise<boolean>;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  currentUser,
  projects,
  siteConfig,
  musicConfig,
  onNavigateHome,
  onLoginSuccess,
  onLogout,
  onOpenAddProject,
  onOpenEditProject,
  onDeleteProject,
  onSelectProjectPreview,
  onSaveSiteConfig,
  onSaveMusicConfig,
}) => {
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'site_text' | 'messages' | 'security' | 'music'>('projects');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);


  // Keep unread messages count in sync in the background
  useEffect(() => {
    apiGetMessages().then(msgs => {
      setUnreadMessagesCount(msgs.filter(m => !m.read).length);
    }).catch(() => {});

    const unsub = subscribeToMessages(msgs => {
      setUnreadMessagesCount(msgs.filter(m => !m.read).length);
    });

    return () => unsub();
  }, []);

  // Site Configuration Form State
  const [editableConfig, setEditableConfig] = useState<SiteConfig>(siteConfig || DEFAULT_SITE_CONFIG);
  const [siteTextSubTab, setSiteTextSubTab] = useState<'hero' | 'journey' | 'skills' | 'awards' | 'footer'>('hero');

  // Keep editableConfig in sync if external siteConfig updates
  useEffect(() => {
    if (siteConfig) {
      setEditableConfig(siteConfig);
    }
  }, [siteConfig]);

  // Theme Music Configuration State
  const [localMusicConfig, setLocalMusicConfig] = useState<MusicConfig>(musicConfig);
  const [previewMusicTrackId, setPreviewMusicTrackId] = useState<string | null>(null);
  const [isSavingMusic, setIsSavingMusic] = useState(false);
  const [musicSaveSuccess, setMusicSaveSuccess] = useState(false);
  const [musicAddMode, setMusicAddMode] = useState<'url' | 'file' | 'presets'>('url');
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [newMusicArtist, setNewMusicArtist] = useState('');
  const [newMusicCategory, setNewMusicCategory] = useState('Cyberpunk');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [musicUploadFileName, setMusicUploadFileName] = useState('');
  const [musicFileError, setMusicFileError] = useState('');

  useEffect(() => {
    if (musicConfig) {
      setLocalMusicConfig(musicConfig);
    }
  }, [musicConfig]);

  const handleToggleGlobalMusic = () => {
    setLocalMusicConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleSetGlobalActiveTrack = (id: string) => {
    setLocalMusicConfig(prev => ({ ...prev, activeTrackId: id }));
  };

  const handlePreviewMusicTrack = (track: ThemeTrack) => {
    if (previewMusicTrackId === track.id) {
      cyberAudioEngine.pause();
      setPreviewMusicTrackId(null);
    } else {
      cyberAudioEngine.playTrack(track);
      setPreviewMusicTrackId(track.id);
    }
  };

  const handleDeleteMusicTrack = (id: string) => {
    if (localMusicConfig.tracks.length <= 1) {
      alert('최소 1개 이상의 테마곡이 등록되어 있어야 합니다.');
      return;
    }
    if (confirm('이 테마곡을 삭제하시겠습니까?')) {
      if (previewMusicTrackId === id) {
        cyberAudioEngine.pause();
        setPreviewMusicTrackId(null);
      }
      setLocalMusicConfig(prev => {
        const nextTracks = prev.tracks.filter(t => t.id !== id);
        let nextActive = prev.activeTrackId;
        if (nextActive === id) nextActive = nextTracks[0]?.id || '';
        return { ...prev, tracks: nextTracks, activeTrackId: nextActive };
      });
    }
  };

  const handleMusicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMusicFileError('');
    if (file.size > 15 * 1024 * 1024) {
      setMusicFileError('오디오 파일 크기가 15MB를 초과합니다.');
      return;
    }
    setMusicUploadFileName(file.name);
    if (!newMusicTitle) {
      setNewMusicTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    if (!newMusicArtist) {
      setNewMusicArtist('User Custom Audio');
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) setNewMusicUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMusicTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMusicTitle.trim()) {
      alert('테마곡 제목을 입력해 주세요.');
      return;
    }
    if (!newMusicUrl.trim()) {
      alert('오디오 웹 URL을 입력하거나 음악 파일을 선택해 주세요.');
      return;
    }

    const newTrack: ThemeTrack = {
      id: `track_custom_${Date.now()}`,
      title: newMusicTitle.trim(),
      artist: newMusicArtist.trim() || 'Zion Robotics Lab',
      url: newMusicUrl.trim(),
      category: newMusicCategory.trim() || 'Custom Theme',
      duration: 'Audio',
      addedAt: new Date().toISOString(),
      isPreset: false,
    };

    setLocalMusicConfig(prev => ({
      ...prev,
      tracks: [newTrack, ...prev.tracks],
      activeTrackId: prev.activeTrackId || newTrack.id,
    }));

    setNewMusicTitle('');
    setNewMusicArtist('');
    setNewMusicUrl('');
    setMusicUploadFileName('');
    alert('새 테마곡이 추가되었습니다! 우측 상단의 [테마곡 설정 저장]을 눌러 서버에 반영해 주세요.');
  };

  const handleSaveLocalMusic = async () => {
    setIsSavingMusic(true);
    setMusicSaveSuccess(false);
    try {
      const ok = await onSaveMusicConfig(localMusicConfig);
      if (ok) {
        setMusicSaveSuccess(true);
        setTimeout(() => setMusicSaveSuccess(false), 3000);
      }
    } catch (e) {
      alert('음악 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingMusic(false);
    }
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await apiLogin(username.trim(), password.trim(), false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err: any) {
      setErrorMsg('서버 인증 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Central sync helper to ensure instant reflection on public/default window
  const applyAndSyncConfig = useCallback((updated: SiteConfig) => {
    setEditableConfig(updated);
    onSaveSiteConfig(updated);
  }, [onSaveSiteConfig]);

  const handleResetToDefaults = () => {
    if (window.confirm('모든 텍스트와 설정을 초기 기본값으로 되돌리시겠습니까?')) {
      applyAndSyncConfig(DEFAULT_SITE_CONFIG);
    }
  };

  // Helper for Hero/Bio fields - immediate real-time sync
  const handleHeroChange = (field: string, value: string) => {
    const updated: SiteConfig = {
      ...editableConfig,
      portfolioInfo: {
        ...editableConfig.portfolioInfo,
        [field]: value
      }
    };
    applyAndSyncConfig(updated);
  };

  // Journey CRUD - immediate real-time sync
  const handleAddJourneyItem = () => {
    const newItem: JourneyItem = {
      id: `journey-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '새로운 로봇 대회 참가',
      subtitle: 'Autonomous Robotics Challenge',
      team: 'Team Zion',
      roles: ['Programming', 'Control'],
      tags: ['Autonomous', 'Sensor Fusion'],
      status: 'active',
      rank: '본선 진출',
      strength: '센서 피드백 루프 최적화',
      weakness: '모터 발열 튜닝 필요',
      review: '알고리즘 정밀 제어 학습'
    };
    const updated: SiteConfig = {
      ...editableConfig,
      journeyItems: [newItem, ...editableConfig.journeyItems]
    };
    applyAndSyncConfig(updated);
  };

  const handleUpdateJourneyItem = (index: number, field: keyof JourneyItem, value: any) => {
    const updatedJourney = [...editableConfig.journeyItems];
    updatedJourney[index] = {
      ...updatedJourney[index],
      [field]: value
    };
    const updated: SiteConfig = {
      ...editableConfig,
      journeyItems: updatedJourney
    };
    applyAndSyncConfig(updated);
  };

  const handleDeleteJourneyItem = (index: number) => {
    const updatedJourney = editableConfig.journeyItems.filter((_, i) => i !== index);
    const updated: SiteConfig = {
      ...editableConfig,
      journeyItems: updatedJourney
    };
    applyAndSyncConfig(updated);
  };

  // Skills CRUD - immediate real-time sync
  const handleAddSkillItem = () => {
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: '신규 기술 스택',
      category: 'code',
      iconType: 'code',
      description: '기술에 대한 간략한 설명을 입력하세요.',
      proficiency: 85,
      tags: ['NEW', 'CODE'],
      details: '상세 알고리즘 구현 및 로봇 적용 경험'
    };
    const updated: SiteConfig = {
      ...editableConfig,
      skillItems: [...editableConfig.skillItems, newSkill]
    };
    applyAndSyncConfig(updated);
  };

  const handleUpdateSkillItem = (index: number, field: keyof SkillItem, value: any) => {
    const updatedSkills = [...editableConfig.skillItems];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    const updated: SiteConfig = {
      ...editableConfig,
      skillItems: updatedSkills
    };
    applyAndSyncConfig(updated);
  };

  const handleDeleteSkillItem = (index: number) => {
    const updatedSkills = editableConfig.skillItems.filter((_, i) => i !== index);
    const updated: SiteConfig = {
      ...editableConfig,
      skillItems: updatedSkills
    };
    applyAndSyncConfig(updated);
  };

  // Awards Target CRUD - immediate real-time sync
  const handleAddAwardItem = () => {
    const newAward: AwardItem = {
      id: `award-${Date.now()}`,
      title: '2026 로봇 경진대회 우승 목표',
      date: '2026.11',
      organization: 'Robotics Association',
      category: 'Autonomous Navigation',
      status: 'TARGET_GOAL'
    };
    const updated: SiteConfig = {
      ...editableConfig,
      awardsData: [...editableConfig.awardsData, newAward]
    };
    applyAndSyncConfig(updated);
  };

  const handleUpdateAwardItem = (index: number, field: keyof AwardItem, value: any) => {
    const updatedAwards = [...editableConfig.awardsData];
    updatedAwards[index] = {
      ...updatedAwards[index],
      [field]: value
    };
    const updated: SiteConfig = {
      ...editableConfig,
      awardsData: updatedAwards
    };
    applyAndSyncConfig(updated);
  };

  const handleDeleteAwardItem = (index: number) => {
    const updatedAwards = editableConfig.awardsData.filter((_, i) => i !== index);
    const updated: SiteConfig = {
      ...editableConfig,
      awardsData: updatedAwards
    };
    applyAndSyncConfig(updated);
  };

  const handleReturnHome = () => {
    onLogout();
    onNavigateHome();
  };

  // If not logged in, render the Cybernetic Admin Login Portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-mono-tech select-none">
        {/* Background Grids & Ambient Lighting */}
        <div className="absolute inset-0 cyber-grid opacity-70 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Minimal Bar */}
        <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-cyan-950/60 bg-[#030816]/70 backdrop-blur-md">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>포트폴리오 메인으로 돌아가기 (Return to Portfolio)</span>
          </button>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SECURE GATEWAY ACTIVE</span>
          </div>
        </header>

        {/* Center Login Box */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#040c1e]/95 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl">
            
            {/* Header / Brand */}
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-2">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ZION ADMIN ACCESS
              </h1>
              <p className="text-xs text-cyan-400/80">
                포트폴리오 및 데이터베이스 통합 관리자 시스템
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" />
                  <span>관리자 아이디 (Admin ID)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="관리자 ID를 입력하세요"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#02050e] border border-cyan-900/80 focus:border-cyan-400 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono-tech"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Key size={13} className="text-cyan-400" />
                  <span>비밀번호 (Password)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#02050e] border border-cyan-900/80 focus:border-cyan-400 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono-tech"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-black" />
                    <span>서버 인증 확인 중...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>관리자 로그인 (Authenticate)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        {/* Footer info */}
        <footer className="relative z-10 p-4 text-center text-[11px] text-slate-500 border-t border-cyan-950/40">
          Zion Robotics Autonomous Systems // Secure Admin Console v2.6
        </footer>
      </div>
    );
  }

  // If authenticated, render the Full Comprehensive Admin Dashboard
  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-mono-tech relative overflow-x-hidden">
      {/* Background Grids */}
      <div className="fixed inset-0 cyber-grid opacity-80 pointer-events-none" />
      <div className="fixed -top-40 right-1/4 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 bg-[#030919]/90 border-b border-cyan-500/30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>기본 모드 포트폴리오 보기 (View Portfolio)</span>
          </button>

          <div className="h-4 w-px bg-cyan-950 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-white font-bold">ADMIN PORTAL:</span>
            <span className="text-cyan-400 font-bold">{currentUser.name}</span>
            <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-700/60 rounded text-[10px] text-cyan-300">
              [{currentUser.role}]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 px-3 py-1 bg-[#01040a] border border-cyan-950 rounded-lg">
            <Database size={13} className="text-cyan-400" />
            <span>Firestore: <strong className="text-emerald-400">SYNCED</strong></span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs transition-all"
          >
            <LogOut size={14} />
            <span>로그아웃 (Logout)</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Workspace Mode Selection Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-cyan-950 pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-[#030919] border border-cyan-900/80 text-slate-300 hover:text-white hover:border-cyan-500/60'
            }`}
          >
            <Layers size={15} />
            <span>01. 로봇 프로젝트 관리 ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('site_text')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'site_text'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-[#030919] border border-cyan-900/80 text-slate-300 hover:text-white hover:border-cyan-500/60'
            }`}
          >
            <Sliders size={15} />
            <span>02. 기본 모드 텍스트 & 인터페이스 전체 설정 (Site CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'messages'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-[#030919] border border-cyan-900/80 text-slate-300 hover:text-white hover:border-cyan-500/60'
            }`}
          >
            <Mail size={15} />
            <span>03. 수신 메시지 & 메일함 (Inbox)</span>
            {unreadMessagesCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'messages'
                  ? 'bg-black text-amber-300'
                  : 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse'
              }`}>
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-[#030919] border border-cyan-900/80 text-slate-300 hover:text-white hover:border-cyan-500/60'
            }`}
          >
            <ShieldCheck size={15} />
            <span>04. 보안 및 데이터베이스 상태</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'music'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-[#030919] border border-cyan-900/80 text-slate-300 hover:text-white hover:border-cyan-500/60'
            }`}
          >
            <Music size={15} />
            <span>05. 테마곡 & 배경음악 설정 (BGM Studio)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              musicConfig?.enabled 
                ? activeTab === 'music' ? 'bg-black text-emerald-400' : 'bg-emerald-500 text-black' 
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {musicConfig?.enabled ? 'BGM ON' : 'BGM OFF'}
            </span>
          </button>
        </div>

        {/* ===================== TAB 1: PROJECTS MANAGEMENT ===================== */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Workspace Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040c20]/70 border border-cyan-900/60 rounded-2xl p-5 backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
                  <Layers size={14} />
                  <span>PROJECT MANAGEMENT MATRIX</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  로봇 프로젝트 추가·수정·사진 변경·삭제
                </h1>
                <p className="text-xs text-slate-400">
                  프로젝트 추가 시 컴퓨터 파일 업로드나 웹 URL로 자유롭게 사진을 지정할 수 있으며, 즉시 기본 모드(`/`)에 반영됩니다.
                </p>
              </div>

              <button
                onClick={onOpenAddProject}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all shrink-0 active:scale-95"
              >
                <Plus size={16} />
                <span>+ 새 프로젝트 등록 (Add Project)</span>
              </button>
            </div>

            {/* Database Projects List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database size={15} className="text-cyan-400" />
                  <span>등록된 프로젝트 목록 ({projects.length}개)</span>
                </h2>
                <span className="text-xs text-slate-500">실시간 데이터베이스 동기화 활성화됨</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#030919] border border-cyan-900/60 hover:border-cyan-500/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-md"
                  >
                    {/* Project Image & Status */}
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030919] via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded text-[10px] text-cyan-300 font-bold">
                          {project.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          project.status === 'ACTIVE' 
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' 
                            : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      {project.featured && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/20 border border-amber-500/60 text-amber-300 rounded text-[10px] font-bold flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>FEATURED</span>
                        </div>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                          {project.category}
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {project.descriptionKo}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-cyan-950/50 border border-cyan-900/60 text-cyan-300 text-[10px] rounded">
                            #{tag}
                          </span>
                        ))}
                        {(project.tags?.length || 0) > 3 && (
                          <span className="text-[10px] text-slate-500">+{project.tags.length - 3}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-cyan-950/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectProjectPreview(project)}
                          className="p-2 bg-[#02050e] hover:bg-cyan-950 border border-cyan-900 text-slate-300 hover:text-cyan-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                          title="미리보기 (Preview Modal)"
                        >
                          <Eye size={14} />
                          <span className="hidden sm:inline">미리보기</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenEditProject(project)}
                            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-bold"
                          >
                            <Edit3 size={13} />
                            <span>수정 (Edit)</span>
                          </button>

                          {deleteConfirmId === project.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteProject(project.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(project.id)}
                              className="p-2 bg-rose-950/30 hover:bg-rose-900/60 border border-rose-900 text-rose-400 hover:text-rose-200 rounded-lg text-xs transition-colors"
                              title="프로젝트 삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: SITE TEXT & INTERFACE CMS ===================== */}
        {activeTab === 'site_text' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Sub-tabs for specific sections with Live Sync status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-950 pb-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'hero', label: '1. 메인 프로필 & Hero', icon: FileText },
                  { id: 'journey', label: `2. 대회 참가 여정 (${editableConfig.journeyItems.length})`, icon: Rocket },
                  { id: 'skills', label: `3. 기술 스택 (${editableConfig.skillItems.length})`, icon: Wrench },
                  { id: 'awards', label: `4. 수상 내역 & 목표 (${editableConfig.awardsData.length})`, icon: Trophy },
                  { id: 'footer', label: '5. 푸터 & 정책', icon: Globe },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSiteTextSubTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        siteTextSubTab === tab.id
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-[#030814] text-slate-400 hover:text-white border border-cyan-950'
                      }`}
                    >
                      <IconComponent size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>기본 창 실시간 즉시 반영 중</span>
                </div>
                <button
                  onClick={handleResetToDefaults}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-cyan-900/60 hover:border-rose-900/60 text-[11px] font-mono-tech flex items-center gap-1 transition-all"
                  title="모든 텍스트 초기 기본값으로 복원"
                >
                  <RotateCcw size={12} />
                  <span>초기화</span>
                </button>
              </div>
            </div>

            {/* ================= SECTION 1: HERO & BIO ================= */}
            {siteTextSubTab === 'hero' && (
              <div className="space-y-4 bg-[#030919]/70 border border-cyan-900/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-cyan-950 pb-3">
                  <FileText size={16} />
                  <span>메인 화면 (Hero Section) 텍스트 및 기본 프로필</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">메인 타이틀 (Main Headline Title)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.title}
                      onChange={(e) => handleHeroChange('title', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">시스템 뱃지 텍스트 (System Badge)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.sysInitBadge || 'SYS.INIT // USER_ZION'}
                      onChange={(e) => handleHeroChange('sysInitBadge', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">한국어 한 줄 소개 (Headline Korean)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.headlineKorean}
                      onChange={(e) => handleHeroChange('headlineKorean', e.target.value)}
                      placeholder="김지온이다. 잘 생겼다."
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">서브 헤드라인 (Subheadline)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.subheadline}
                      onChange={(e) => handleHeroChange('subheadline', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 font-bold mb-1">주요 지향점 (Primary Directive)</label>
                    <textarea
                      rows={3}
                      value={editableConfig.portfolioInfo.primaryDirective}
                      onChange={(e) => handleHeroChange('primaryDirective', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">최종 목표 (Goal)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.goal}
                      onChange={(e) => handleHeroChange('goal', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">코어 하드웨어 아키텍처 (Core Hardware)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.coreArch || 'ARM Cortex-M4 & ESP32'}
                      onChange={(e) => handleHeroChange('coreArch', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 font-bold mb-1">중점 연구 분야 (Focus Area)</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.focusArea || 'PID Control & Autonomous Robotics'}
                      onChange={(e) => handleHeroChange('focusArea', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECTION 2: JOURNEY ================= */}
            {siteTextSubTab === 'journey' && (
              <div className="space-y-4 bg-[#030919]/70 border border-cyan-900/60 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Rocket size={16} />
                    <span>대회 참가 여정 및 문제 해결 로그 (Competition Journey)</span>
                  </h3>
                  <button
                    onClick={handleAddJourneyItem}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus size={13} /> 새 여정 추가
                  </button>
                </div>

                <div className="space-y-4">
                  {editableConfig.journeyItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 bg-[#02050e] border border-cyan-900/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">#0{idx + 1}. {item.title}</span>
                        <button
                          onClick={() => handleDeleteJourneyItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">연도/일자 (Year)</label>
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'year', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">대회명 (Title)</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">리그/부문 (Subtitle)</label>
                          <input
                            type="text"
                            value={item.subtitle}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'subtitle', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">팀명 (Team)</label>
                          <input
                            type="text"
                            value={item.team || ''}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'team', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">순위/결과 (Rank)</label>
                          <input
                            type="text"
                            value={item.rank || ''}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'rank', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">태그 (쉼표 구분)</label>
                          <input
                            type="text"
                            value={item.tags.join(', ')}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-emerald-400 mb-1">성과 / 잘한 점 (Strength)</label>
                          <textarea
                            rows={2}
                            value={item.strength || ''}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'strength', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-rose-400 mb-1">아쉬운 점 / 극복 과제 (Weakness)</label>
                          <textarea
                            rows={2}
                            value={item.weakness || ''}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'weakness', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-cyan-400 mb-1">총평 및 교훈 (Review)</label>
                          <textarea
                            rows={2}
                            value={item.review || ''}
                            onChange={(e) => handleUpdateJourneyItem(idx, 'review', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SECTION 3: SKILLS ================= */}
            {siteTextSubTab === 'skills' && (
              <div className="space-y-4 bg-[#030919]/70 border border-cyan-900/60 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Wrench size={16} />
                    <span>기술 스택 및 역량 (Technical Arsenal & Core Skills)</span>
                  </h3>
                  <button
                    onClick={handleAddSkillItem}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus size={13} /> 새 기술 추가
                  </button>
                </div>

                <div className="space-y-4">
                  {editableConfig.skillItems.map((skill, idx) => (
                    <div key={skill.id || idx} className="p-4 bg-[#02050e] border border-cyan-900/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">{skill.name} ({skill.proficiency}%)</span>
                        <button
                          onClick={() => handleDeleteSkillItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">기술명 (Skill Name)</label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleUpdateSkillItem(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">카테고리 (Category)</label>
                          <select
                            value={skill.category}
                            onChange={(e) => handleUpdateSkillItem(idx, 'category', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          >
                            <option value="code">code (프로그래밍 언어)</option>
                            <option value="hardware">hardware (하드웨어/센서)</option>
                            <option value="control">control (제어/알고리즘)</option>
                            <option value="logic">logic (문제 해결)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">아이콘 (Icon Type)</label>
                          <select
                            value={skill.iconType}
                            onChange={(e) => handleUpdateSkillItem(idx, 'iconType', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          >
                            <option value="code">code (Code)</option>
                            <option value="python">python (Python)</option>
                            <option value="ros">ros (ROS2 / Robot)</option>
                            <option value="sensor">sensor (Sensor)</option>
                            <option value="motor">motor (Motor / Actuator)</option>
                            <option value="vision">vision (Computer Vision)</option>
                            <option value="mechatronics">mechatronics (CAD/Design)</option>
                            <option value="block">block (Blocks)</option>
                            <option value="problem">problem (Logic)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">숙련도 ({skill.proficiency}%)</label>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={skill.proficiency}
                            onChange={(e) => handleUpdateSkillItem(idx, 'proficiency', parseInt(e.target.value) || 50)}
                            className="w-full accent-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">한 줄 요약 (Summary)</label>
                          <input
                            type="text"
                            value={skill.description}
                            onChange={(e) => handleUpdateSkillItem(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">기술 태그 (쉼표 구분)</label>
                          <input
                            type="text"
                            value={skill.tags.join(', ')}
                            onChange={(e) => handleUpdateSkillItem(idx, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SECTION 4: AWARDS ================= */}
            {siteTextSubTab === 'awards' && (
              <div className="space-y-4 bg-[#030919]/70 border border-cyan-900/60 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Trophy size={16} />
                    <span>수상 내역 배너 및 목표 챌린지 (Certifications & Awards)</span>
                  </h3>
                  <button
                    onClick={handleAddAwardItem}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus size={13} /> 새 목표 챌린지 추가
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#02050e] border border-cyan-900/80 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300">미수상 / 준비중 배너 텍스트 설정</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">배너 메인 타이틀</label>
                        <input
                          type="text"
                          value={editableConfig.portfolioInfo.noAwardsTitle || 'NO AWARDS YET'}
                          onChange={(e) => handleHeroChange('noAwardsTitle', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">스캔 상태 텍스트</label>
                        <input
                          type="text"
                          value={editableConfig.portfolioInfo.noAwardsDesc || 'Database scanning... 0 records found.'}
                          onChange={(e) => handleHeroChange('noAwardsDesc', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">동기부여 인용구 (Quote)</label>
                        <textarea
                          rows={2}
                          value={editableConfig.portfolioInfo.noAwardsQuote || ''}
                          onChange={(e) => handleHeroChange('noAwardsQuote', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#01040a] border border-cyan-950 focus:border-cyan-500 rounded text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-300 pt-2">목표 대회 및 챌린지 리스트</h4>
                  {editableConfig.awardsData.map((award, idx) => (
                    <div key={award.id || idx} className="p-3 bg-[#02050e] border border-cyan-900/60 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400">챌린지 #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteAwardItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">목표 타이틀</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) => handleUpdateAwardItem(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1 bg-[#01040a] border border-cyan-950 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">일정</label>
                          <input
                            type="text"
                            value={award.date}
                            onChange={(e) => handleUpdateAwardItem(idx, 'date', e.target.value)}
                            className="w-full px-2.5 py-1 bg-[#01040a] border border-cyan-950 rounded text-xs text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">주관 기관</label>
                          <input
                            type="text"
                            value={award.organization}
                            onChange={(e) => handleUpdateAwardItem(idx, 'organization', e.target.value)}
                            className="w-full px-2.5 py-1 bg-[#01040a] border border-cyan-950 rounded text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= SECTION 5: FOOTER & POLICY ================= */}
            {siteTextSubTab === 'footer' && (
              <div className="space-y-4 bg-[#030919]/70 border border-cyan-900/60 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-cyan-950 pb-3">
                  <Globe size={16} />
                  <span>푸터 영역 및 개인정보·연구 정책</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">푸터 브랜드 / 카피라이트 텍스트</label>
                    <input
                      type="text"
                      value={editableConfig.portfolioInfo.footerText || "ZION'S PORTFOLIO"}
                      onChange={(e) => handleHeroChange('footerText', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">개인정보 및 연구 데이터 이용 정책 문구 (Privacy Policy)</label>
                    <textarea
                      rows={4}
                      value={editableConfig.portfolioInfo.privacyPolicy || ''}
                      onChange={(e) => handleHeroChange('privacyPolicy', e.target.value)}
                      className="w-full px-3 py-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg text-white text-xs outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: MESSAGES & EMAIL INBOX ===================== */}
        {activeTab === 'messages' && (
          <AdminMessagesInbox onUnreadCountChange={setUnreadMessagesCount} />
        )}

        {/* ===================== TAB 4: SECURITY & DATABASE ===================== */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 bg-[#030919]/90 border border-cyan-900/80 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-cyan-950 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>데이터베이스 보안 및 권한 설정 상태 (Database Security Status)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    관리자 계정 및 사이트 데이터는 Firestore와 서버 측 PBKDF2 암호화 프로토콜로 보호됩니다.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-xs text-emerald-300 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} />
                  <span>보호 규칙 정상 적용됨</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-4 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1.5">
                  <div className="text-slate-400 text-xs">인증 프로토콜</div>
                  <div className="text-white font-bold text-sm">PBKDF2 (SHA-512 + Salt)</div>
                  <div className="text-[11px] text-cyan-400">평문 비밀번호 노출 차단</div>
                </div>

                <div className="p-4 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1.5">
                  <div className="text-slate-400 text-xs">Firestore 접근 제어</div>
                  <div className="text-white font-bold text-sm">`/system_admins` 외부 열람 차단</div>
                  <div className="text-[11px] text-emerald-400">일반 사용자 계정 해시 조회 불가</div>
                </div>

                <div className="p-4 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1.5">
                  <div className="text-slate-400 text-xs">배포 환경 지원</div>
                  <div className="text-white font-bold text-sm">Vercel & Container SPA 호환</div>
                  <div className="text-[11px] text-slate-400">하이브리드 Firestore direct fallback</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: THEME MUSIC & BGM MANAGEMENT ===================== */}
        {activeTab === 'music' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040c20]/70 border border-cyan-900/60 rounded-2xl p-5 backdrop-blur-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
                  <Music size={14} />
                  <span>THEME AUDIO & BGM MATRIX</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  테마곡 등록 및 사이트 배경음악(BGM) 제어
                </h1>
                <p className="text-xs text-slate-400">
                  방문자가 사이트 접속 시 재생되는 테마곡을 추가하고, BGM 켜기/끄기를 설정합니다. 별도의 독립 팝업 창으로 띄워서 관리할 수도 있습니다.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <ExternalLink size={14} />
                  <span>별도 팝업 창으로 분리해서 열기</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveLocalMusic}
                  disabled={isSavingMusic}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSavingMusic ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>저장 중...</span>
                    </>
                  ) : musicSaveSuccess ? (
                    <>
                      <Check size={15} />
                      <span>저장 완료!</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>테마곡 설정 저장</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Master Control Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Music Toggle */}
              <div className={`p-5 rounded-2xl border transition-all ${
                localMusicConfig.enabled 
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                  : 'bg-rose-950/20 border-rose-800/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">전체 배경음악 상태</span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    localMusicConfig.enabled ? 'bg-emerald-400 text-black' : 'bg-rose-500 text-white'
                  }`}>
                    {localMusicConfig.enabled ? '활성화 (ON)' : '비활성화 (OFF)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 mb-4">
                  포트폴리오에 BGM 재생 버튼 노출 및 자동/수동 음악 시스템 활성화 여부
                </p>
                <button
                  type="button"
                  onClick={handleToggleGlobalMusic}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    localMusicConfig.enabled
                      ? 'bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500 text-rose-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  }`}
                >
                  <Power size={14} />
                  <span>{localMusicConfig.enabled ? '음악 완전히 끄기 (Turn Off)' : '음악 켜기 (Turn On)'}</span>
                </button>
              </div>

              {/* Card 2: Volume */}
              <div className="p-5 rounded-2xl bg-[#030919] border border-cyan-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">기본 시작 볼륨</span>
                  <span className="text-xs font-mono-tech text-cyan-400 font-bold">
                    {Math.round(localMusicConfig.defaultVolume * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  방문자가 사이트 접속 시 적용될 기본 사운드 음량 크기
                </p>
                <div className="pt-3 flex items-center gap-3">
                  <Volume2 size={18} className="text-cyan-400" />
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={localMusicConfig.defaultVolume}
                    onChange={(e) => setLocalMusicConfig(prev => ({ ...prev, defaultVolume: parseFloat(e.target.value) }))}
                    className="flex-1 h-2 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Card 3: Active Song */}
              <div className="p-5 rounded-2xl bg-[#030919] border border-cyan-950 space-y-2">
                <span className="text-xs font-bold text-slate-300">현재 대표 테마곡</span>
                <p className="text-xs text-slate-400">
                  방문자가 메인 화면에서 가장 먼저 듣게 되는 기본 곡
                </p>
                <div className="p-3 bg-[#01040f] border border-cyan-900 rounded-xl flex items-center gap-2.5">
                  <Disc size={18} className="text-cyan-400 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-cyan-300 truncate">
                      {localMusicConfig.tracks.find(t => t.id === localMusicConfig.activeTrackId)?.title || '선택된 테마곡 없음'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {localMusicConfig.tracks.find(t => t.id === localMusicConfig.activeTrackId)?.artist || ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Theme Song Box */}
            <div className="p-6 bg-[#030919] border border-cyan-900/60 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-950">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">새 테마곡 추가 (Add Theme Track)</h3>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-cyan-950 text-xs">
                  <button
                    type="button"
                    onClick={() => setMusicAddMode('url')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      musicAddMode === 'url' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    오디오 웹 링크 (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicAddMode('file')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      musicAddMode === 'file' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    컴퓨터 파일 업로드 (MP3/WAV)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicAddMode('presets')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      musicAddMode === 'presets' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    사이버 프리셋 선택
                  </button>
                </div>
              </div>

              {musicAddMode === 'presets' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    로봇 공학 포트폴리오에 어울리는 추천 고품질 테마 사운드트랙입니다. 클릭하여 바로 추가할 수 있습니다:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'track_preset_synth_1',
                        title: 'Neural Matrix Protocol (사이버 앰비언트 신스)',
                        artist: 'Zion Robotics Audio Lab',
                        url: 'synth:cyber-matrix',
                        category: 'Cyberpunk Ambient',
                        duration: 'Procedural Loop',
                        isPreset: true,
                      },
                      {
                        id: 'track_preset_synth_2',
                        title: 'Autonomous Pulse (로보틱스 로우파이 비트)',
                        artist: 'Zion Engineering Core',
                        url: 'synth:lofi-pulse',
                        category: 'Lo-Fi Focus',
                        duration: 'Procedural Loop',
                        isPreset: true,
                      },
                      {
                        id: 'track_preset_audio_1',
                        title: 'Futuristic Sci-Fi Laboratory Ambient',
                        artist: 'Creative Commons Audio',
                        url: 'https://actions.google.com/sounds/v1/science_fiction/sci_fi_ambient.ogg',
                        category: 'Sci-Fi Sound',
                        duration: '01:30',
                        isPreset: true,
                      },
                      {
                        id: 'track_preset_audio_2',
                        title: 'Deep Space Robotics Station Hum',
                        artist: 'Free Sound Archive',
                        url: 'https://actions.google.com/sounds/v1/science_fiction/lab_hum.ogg',
                        category: 'Deep Drone',
                        duration: '01:05',
                        isPreset: true,
                      }
                    ].map((preset) => (
                      <div 
                        key={preset.id}
                        className="p-3.5 bg-[#01040f] border border-cyan-950 hover:border-cyan-800 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{preset.title}</div>
                          <div className="text-[11px] text-slate-400">{preset.artist} • {preset.category}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePreviewMusicTrack(preset)}
                            className="p-2 text-cyan-400 hover:bg-cyan-950 rounded-lg border border-cyan-900"
                            title="미리듣기"
                          >
                            {previewMusicTrackId === preset.id ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const exists = localMusicConfig.tracks.some(t => t.id === preset.id);
                              if (exists) {
                                alert('이미 목록에 존재하는 곡입니다.');
                                return;
                              }
                              setLocalMusicConfig(prev => ({ ...prev, tracks: [...prev.tracks, preset] }));
                              alert(`"${preset.title}"이(가) 추가되었습니다. 상단의 [테마곡 설정 저장]을 눌러주세요.`);
                            }}
                            className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-colors"
                          >
                            추가하기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddMusicTrackSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        테마곡 제목 (Title) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: Zion Cyberpunk Theme"
                        value={newMusicTitle}
                        onChange={(e) => setNewMusicTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        아티스트 / 소스 (Artist)
                      </label>
                      <input
                        type="text"
                        placeholder="예: Zion Music Lab"
                        value={newMusicArtist}
                        onChange={(e) => setNewMusicArtist(e.target.value)}
                        className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        카테고리 / 장르
                      </label>
                      <select
                        value={newMusicCategory}
                        onChange={(e) => setNewMusicCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                      >
                        <option value="Cyberpunk">Cyberpunk (사이버펑크)</option>
                        <option value="Robotics Ambient">Robotics Ambient (로봇 앰비언트)</option>
                        <option value="Lo-Fi Beats">Lo-Fi Beats (코딩 로우파이)</option>
                        <option value="Epic Future">Epic Future (미래지향 사운드트랙)</option>
                        <option value="Custom Audio">Custom Audio (사용자 지정 음악)</option>
                      </select>
                    </div>
                  </div>

                  {musicAddMode === 'url' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        오디오 웹 링크 (MP3, OGG, WAV URL) *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://example.com/soundtrack.mp3"
                        value={newMusicUrl}
                        onChange={(e) => setNewMusicUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white font-mono-tech outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        컴퓨터 오디오 파일 선택 (.mp3, .wav, .ogg, .m4a) *
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.ogg,.m4a"
                          onChange={handleMusicFileUpload}
                          className="hidden"
                          id="tab5-audio-file-input"
                        />
                        <label
                          htmlFor="tab5-audio-file-input"
                          className="w-full sm:w-auto px-4 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Upload size={14} />
                          <span>컴퓨터에서 음악 파일 찾기</span>
                        </label>
                        <span className="text-xs text-slate-400 truncate max-w-xs">
                          {musicUploadFileName ? `선택됨: ${musicUploadFileName}` : '선택된 파일 없음'}
                        </span>
                      </div>
                      {musicFileError && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {musicFileError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>테마곡 목록에 등록</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Registered Theme Tracks List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Disc size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    현재 등록된 테마곡 리스트 ({localMusicConfig.tracks.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  💡 [대표곡으로 지정]을 누르면 첫 방문 시 자동 재생되는 대표 테마곡이 변경됩니다.
                </span>
              </div>

              <div className="space-y-2.5">
                {localMusicConfig.tracks.map((track, idx) => {
                  const isActive = localMusicConfig.activeTrackId === track.id;
                  const isPreviewing = previewMusicTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isActive 
                          ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'bg-[#030919] border-cyan-950 hover:border-cyan-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono-tech text-xs font-bold ${
                          isActive ? 'bg-cyan-400 text-black' : 'bg-cyan-950/80 text-cyan-400'
                        }`}>
                          {isPreviewing ? <Disc size={18} className="animate-spin" /> : String(idx + 1).padStart(2, '0')}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{track.title}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500 text-black rounded">
                                대표 테마곡
                              </span>
                            )}
                            {track.isPreset && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono-tech bg-slate-800 text-slate-400 rounded">
                                PRESET
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {track.artist} • <span className="text-cyan-400/80">{track.category}</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewMusicTrack(track)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isPreviewing
                              ? 'bg-amber-400 text-black border-amber-300'
                              : 'bg-[#01040f] text-slate-300 hover:text-white border-cyan-900 hover:border-cyan-700'
                          }`}
                        >
                          {isPreviewing ? <Pause size={13} fill="black" /> : <Play size={13} />}
                          <span>{isPreviewing ? '재생 중지' : '미리듣기'}</span>
                        </button>

                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => handleSetGlobalActiveTrack(track.id)}
                            className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold rounded-lg transition-colors"
                          >
                            대표곡으로 지정
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 size={14} />
                            <span>대표곡 적용중</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteMusicTrack(track.id)}
                          className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 border border-transparent hover:border-rose-900/60 rounded-lg transition-colors"
                          title="테마곡 삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Dedicated Window for Music Management ("다른 창 만들어서") */}
      <AdminThemeMusicModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        musicConfig={localMusicConfig}
        onSaveConfig={onSaveMusicConfig}
      />
    </div>
  );
};
