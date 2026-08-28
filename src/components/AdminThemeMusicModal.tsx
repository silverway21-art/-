/**
 * AdminThemeMusicModal: Dedicated Theme Song & Background Audio Studio Window for Admin
 * Supports audio upload, URL input, preset loader, test playback, default track selection,
 * and persistent saving to Firestore.
 */

import React, { useState, useRef } from 'react';
import { 
  Music, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  Upload, 
  Check, 
  Power, 
  Save, 
  Sparkles, 
  X, 
  Disc, 
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ThemeTrack, MusicConfig } from '../types';
import { cyberAudioEngine } from '../lib/cyberAudioEngine';

interface AdminThemeMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicConfig: MusicConfig;
  onSaveConfig: (updatedConfig: MusicConfig) => Promise<boolean>;
}

export const AdminThemeMusicModal: React.FC<AdminThemeMusicModalProps> = ({
  isOpen,
  onClose,
  musicConfig,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<MusicConfig>({ ...musicConfig });
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addMode, setAddMode] = useState<'url' | 'file' | 'presets'>('url');

  // New track form state
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newCategory, setNewCategory] = useState('Cyberpunk');
  const [newUrl, setNewUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [fileError, setFileError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleToggleGlobal = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleSetActiveTrack = (trackId: string) => {
    setConfig(prev => ({ ...prev, activeTrackId: trackId }));
  };

  const handlePreviewPlay = (track: ThemeTrack) => {
    if (previewTrackId === track.id) {
      cyberAudioEngine.pause();
      setPreviewTrackId(null);
    } else {
      cyberAudioEngine.playTrack(track);
      setPreviewTrackId(track.id);
    }
  };

  const handleDeleteTrack = (id: string) => {
    if (config.tracks.length <= 1) {
      alert('최소 1개 이상의 테마곡이 유지되어야 합니다.');
      return;
    }
    if (confirm('이 테마곡을 목록에서 삭제하시겠습니까?')) {
      if (previewTrackId === id) {
        cyberAudioEngine.pause();
        setPreviewTrackId(null);
      }
      setConfig(prev => {
        const nextTracks = prev.tracks.filter(t => t.id !== id);
        let nextActive = prev.activeTrackId;
        if (nextActive === id) {
          nextActive = nextTracks[0]?.id || '';
        }
        return {
          ...prev,
          tracks: nextTracks,
          activeTrackId: nextActive,
        };
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    // Check file size (recommend < 12MB for local browser & base64 performance)
    if (file.size > 15 * 1024 * 1024) {
      setFileError('오디오 파일 크기가 15MB를 초과합니다. 15MB 이하의 MP3 또는 오디오 스트림 URL 사용을 권장합니다.');
      return;
    }

    setUploadFileName(file.name);
    if (!newTitle) {
      // Auto-extract title from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setNewTitle(nameWithoutExt);
    }
    if (!newArtist) {
      setNewArtist('User Custom Audio');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setFileError('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('곡 제목을 입력해 주세요.');
      return;
    }
    if (!newUrl.trim()) {
      alert('오디오 URL을 입력하거나 컴퓨터에서 음악 파일을 업로드해 주세요.');
      return;
    }

    const newTrack: ThemeTrack = {
      id: `track_custom_${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Zion Robot Portfolio',
      url: newUrl.trim(),
      category: newCategory.trim() || 'Custom Theme',
      duration: 'Audio',
      addedAt: new Date().toISOString(),
      isPreset: false,
    };

    setConfig(prev => ({
      ...prev,
      tracks: [newTrack, ...prev.tracks],
      activeTrackId: prev.activeTrackId || newTrack.id,
    }));

    // Reset form
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setUploadFileName('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert('새 테마곡이 목록에 추가되었습니다! 상단의 [서버 및 Firestore에 저장] 버튼을 눌러 확정해 주세요.');
  };

  const handleAddPresetTrack = (preset: ThemeTrack) => {
    const exists = config.tracks.some(t => t.id === preset.id);
    if (exists) {
      alert('이미 목록에 존재하는 프리셋 곡입니다.');
      return;
    }

    setConfig(prev => ({
      ...prev,
      tracks: [...prev.tracks, preset],
    }));
    alert(`프리셋 곡 "${preset.title}"이(가) 추가되었습니다.`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const ok = await onSaveConfig(config);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save music config:', err);
      alert('음악 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#020614] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Admin Studio Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#01040e] border-b border-cyan-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/60 rounded-xl text-cyan-400">
              <Music size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-wide">
                  테마곡 및 배경음악 관리 스튜디오 (BGM STUDIO)
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono-tech bg-cyan-500 text-black font-bold rounded">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                사용자가 사이트에 방문했을 때 재생될 테마곡을 추가하고, BGM을 켜거나 끌 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>동기화 중...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={15} />
                  <span>저장 완료!</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>설정 확정 저장</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-950/60 rounded-xl border border-transparent hover:border-cyan-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Studio Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Master Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Control 1: Global BGM Toggle */}
            <div className={`p-4 rounded-2xl border transition-all ${
              config.enabled 
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-rose-950/20 border-rose-800/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">포트폴리오 배경음악 상태</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  config.enabled ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                }`}>
                  {config.enabled ? '활성화 (ON)' : '비활성화 (OFF)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 mb-3">
                전체 포트폴리오에 BGM 재생 버튼 노출 및 음악 시스템 활성화 여부
              </p>
              <button
                onClick={handleToggleGlobal}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  config.enabled
                    ? 'bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500 text-rose-200'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                }`}
              >
                <Power size={14} />
                <span>{config.enabled ? '음악 완전히 끄기 (Turn Off)' : '음악 켜기 (Turn On)'}</span>
              </button>
            </div>

            {/* Control 2: Default Startup Volume */}
            <div className="p-4 rounded-2xl bg-[#030919] border border-cyan-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">기본 시작 음량 (Volume)</span>
                <span className="text-xs font-mono-tech text-cyan-400 font-bold">
                  {Math.round(config.defaultVolume * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                방문자가 사이트 접속 시 적용될 최초 볼륨
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Volume2 size={16} className="text-cyan-400" />
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={config.defaultVolume}
                  onChange={(e) => setConfig(prev => ({ ...prev, defaultVolume: parseFloat(e.target.value) }))}
                  className="flex-1 h-2 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Control 3: Currently Selected Theme Song */}
            <div className="p-4 rounded-2xl bg-[#030919] border border-cyan-950 space-y-2">
              <span className="text-xs font-bold text-slate-300">현재 대표 테마곡</span>
              <p className="text-[11px] text-slate-400">
                사이트 진입 시 가장 먼저 재생되는 기본 곡
              </p>
              <div className="p-2.5 bg-[#01040f] border border-cyan-900 rounded-xl flex items-center gap-2">
                <Disc size={15} className="text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-cyan-300 truncate">
                  {config.tracks.find(t => t.id === config.activeTrackId)?.title || '선택된 테마곡 없음'}
                </span>
              </div>
            </div>

          </div>

          {/* Section 2: Add New Theme Song Form */}
          <div className="p-5 bg-[#030919] border border-cyan-900/60 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-950">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">새 테마곡 추가 (Add New Theme Song)</h3>
              </div>

              {/* Mode Switch Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-cyan-950 text-xs">
                <button
                  type="button"
                  onClick={() => setAddMode('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    addMode === 'url' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  오디오 웹 링크 (URL)
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    addMode === 'file' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  컴퓨터 파일 업로드 (MP3/WAV)
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('presets')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    addMode === 'presets' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  사이버 프리셋 선택
                </button>
              </div>
            </div>

            {addMode === 'presets' ? (
              /* Preset Selection Mode */
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  로봇 공학 포트폴리오에 최적화된 고품질 사이버펑크 앰비언트 및 사운드트랙입니다. 클릭 한 번으로 추가할 수 있습니다:
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
                          onClick={() => handlePreviewPlay(preset)}
                          className="p-2 text-cyan-400 hover:bg-cyan-950 rounded-lg border border-cyan-900"
                          title="미리듣기"
                        >
                          {previewTrackId === preset.id ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPresetTrack(preset)}
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
              /* Form Mode: URL or File Upload */
              <form onSubmit={handleAddTrackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      테마곡 제목 (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: Zion Cyberpunk Theme"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      아티스트 / 소스 (Artist)
                    </label>
                    <input
                      type="text"
                      placeholder="예: Zion Music Lab"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      카테고리 / 장르
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
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

                {addMode === 'url' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      오디오 스트림 주소 (MP3, OGG, WAV URL) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/soundtrack.mp3"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#01040f] border border-cyan-950 focus:border-cyan-400 rounded-xl text-xs text-white font-mono-tech outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      온라인 상에 호스팅된 직접 오디오 스트림 링크(.mp3, .ogg, .wav 등)를 입력해 주세요.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      컴퓨터 음악 파일 선택 (.mp3, .wav, .ogg, .m4a) *
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="audio-file-input"
                      />
                      <label
                        htmlFor="audio-file-input"
                        className="w-full sm:w-auto px-4 py-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload size={14} />
                        <span>컴퓨터에서 오디오 파일 찾기</span>
                      </label>
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        {uploadFileName ? `선택됨: ${uploadFileName}` : '선택된 파일 없음'}
                      </span>
                    </div>
                    {fileError && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {fileError}
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
                    <span>테마곡 목록에 추가하기</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 3: Registered Theme Songs Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  현재 등록된 테마곡 리스트 ({config.tracks.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                💡 [대표곡으로 지정]을 누르면 사이트 첫 진입 시 해당 곡이 자동 지정됩니다.
              </span>
            </div>

            <div className="space-y-2.5">
              {config.tracks.map((track, idx) => {
                const isActive = config.activeTrackId === track.id;
                const isPreviewing = previewTrackId === track.id;

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

                    {/* Actions Row */}
                    <div className="flex items-center gap-2">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => handlePreviewPlay(track)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          isPreviewing
                            ? 'bg-amber-400 text-black border-amber-300'
                            : 'bg-[#01040f] text-slate-300 hover:text-white border-cyan-900 hover:border-cyan-700'
                        }`}
                      >
                        {isPreviewing ? <Pause size={13} fill="black" /> : <Play size={13} />}
                        <span>{isPreviewing ? '재생 중지' : '미리듣기'}</span>
                      </button>

                      {/* Set Active Button */}
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleSetActiveTrack(track.id)}
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

                      {/* Delete Track */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTrack(track.id)}
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

        {/* Studio Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-[#01040f] border-t border-cyan-950 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span>설정을 변경하신 후 상단의 [설정 확정 저장]을 누르시면 방문자 전체에게 즉시 반영됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            창 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
