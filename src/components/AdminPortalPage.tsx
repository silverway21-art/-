import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { ProjectItem, AdminUser } from '../types';
import { apiLogin, apiLogout } from '../lib/api';

interface AdminPortalPageProps {
  currentUser: AdminUser | null;
  projects: ProjectItem[];
  onNavigateHome: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  onLogout: () => void;
  onOpenAddProject: () => void;
  onOpenEditProject: (project: ProjectItem) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProjectPreview: (project: ProjectItem) => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  currentUser,
  projects,
  onNavigateHome,
  onLoginSuccess,
  onLogout,
  onOpenAddProject,
  onOpenEditProject,
  onDeleteProject,
  onSelectProjectPreview,
}) => {
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'security' | 'telemetry'>('projects');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await apiLogin(username.trim(), password.trim(), true);
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
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>포트폴리오 메인으로 돌아가기 (Return to Portfolio)</span>
          </button>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FIRESTORE AUTH GATEWAY</span>
          </div>
        </header>

        {/* Login Form Container */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-[#030919]/90 border border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-xl space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-2">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                ZION ROBOTICS ADMIN
              </h1>
              <p className="text-xs text-cyan-400/80">
                포트폴리오 데이터베이스 관리자 인증 (/admin)
              </p>
            </div>

            {/* Security Architecture Badge */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-900/60 rounded-xl space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Database size={13} />
                <span>Zero-Trust Server-Side PBKDF2 Verification</span>
              </div>
              <div className="text-[10px] text-slate-400">
                비밀번호는 평문으로 저장되지 않으며, 서버 측에서 솔트 해시를 검증합니다.
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" />
                  <span>관리자 ID (Username)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  className="w-full bg-[#02050e] border border-cyan-900/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold flex items-center gap-1.5">
                  <Lock size={13} className="text-cyan-400" />
                  <span>비밀번호 (Password)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full bg-[#02050e] border border-cyan-900/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 outline-none text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
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

  // If authenticated, render the Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#02050e] text-slate-100 flex flex-col font-mono-tech relative overflow-x-hidden">
      {/* Background Grids */}
      <div className="fixed inset-0 cyber-grid opacity-80 pointer-events-none" />
      <div className="fixed -top-40 right-1/4 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 bg-[#030919]/90 border-b border-cyan-500/30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>공개 포트폴리오 보기 (View Portfolio)</span>
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
        
        {/* Workspace Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040c20]/70 border border-cyan-900/60 rounded-2xl p-5 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
              <Layers size={14} />
              <span>PROJECT MANAGEMENT MATRIX</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              로봇 프로젝트 추가·수정·삭제 관리
            </h1>
            <p className="text-xs text-slate-400">
              관리자 모드에서 수정한 모든 내용은 Firebase Firestore를 통해 공개 포트폴리오(`/`)에 즉시 실시간 반영됩니다.
            </p>
          </div>

          <button
            onClick={onOpenAddProject}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all shrink-0"
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
                className="bg-[#030919] border border-cyan-900/60 hover:border-cyan-500/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
              >
                {/* Project Image & Status */}
                <div className="relative h-40 overflow-hidden bg-slate-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
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

        {/* Security & Database Status Card */}
        <div className="p-5 bg-[#030919]/80 border border-cyan-950 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>데이터베이스 보안 및 권한 설정 상태 (Database Security Status)</span>
            </h3>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 size={13} />
              <span>보호 규칙 정상 적용됨</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1">
              <div className="text-slate-400 text-[11px]">인증 프로토콜</div>
              <div className="text-white font-bold">서버 측 PBKDF2 (SHA-512 + Salt)</div>
              <div className="text-[10px] text-cyan-400">평문 비밀번호 노출 원천 차단</div>
            </div>

            <div className="p-3 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1">
              <div className="text-slate-400 text-[11px]">Firestore 접근 제어</div>
              <div className="text-white font-bold">`/system_admins` 외부 열람 차단</div>
              <div className="text-[10px] text-emerald-400">일반 사용자 계정 해시 조회 불가</div>
            </div>

            <div className="p-3 bg-[#02050e] border border-cyan-950 rounded-xl space-y-1">
              <div className="text-slate-400 text-[11px]">배포 환경 지원</div>
              <div className="text-white font-bold">Vercel & Container SPA 호환</div>
              <div className="text-[10px] text-slate-400">API 엔드포인트 자동 라우팅</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
