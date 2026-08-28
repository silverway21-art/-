/**
 * ThemeMusicModal: Dedicated Cyber Holographic Theme Music Window for Visitors
 * Features animated visualizer canvas, full playback controls, playlist selection,
 * volume slider, and minimize to dock.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music, 
  Radio, 
  Sliders, 
  X, 
  Disc, 
  Power, 
  Sparkles,
  Minimize2,
  CheckCircle2
} from 'lucide-react';
import { ThemeTrack, MusicConfig } from '../types';
import { cyberAudioEngine, AudioEngineState } from '../lib/cyberAudioEngine';

interface ThemeMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicConfig: MusicConfig;
  onSelectTrack: (track: ThemeTrack) => void;
  onToggleMusicEnabled: (enabled: boolean) => void;
}

export const ThemeMusicModal: React.FC<ThemeMusicModalProps> = ({
  isOpen,
  onClose,
  musicConfig,
  onSelectTrack,
  onToggleMusicEnabled,
}) => {
  const [engineState, setEngineState] = useState<AudioEngineState>(cyberAudioEngine.getState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Subscribe to audio engine updates
  useEffect(() => {
    const unsub = cyberAudioEngine.subscribe((state) => {
      setEngineState(state);
    });
    return () => {
      unsub();
    };
  }, []);

  // Real-time Cyber Visualizer animation
  useEffect(() => {
    if (!isOpen) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);

    const renderVisualizer = () => {
      cyberAudioEngine.getFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle grid
      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) - 2;
      let x = 1;

      for (let i = 0; i < bufferLength; i++) {
        // If playing, use actual or simulated frequency
        let value = dataArray[i];
        if (!engineState.isPlaying || engineState.isMuted) {
          value = 2; // Flat idle line
        }

        const barHeight = Math.max(3, (value / 255) * (canvas.height - 8));
        const y = canvas.height - barHeight;

        // Cyber Gradient (Cyan to Emerald to Gold)
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, y);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.7, '#10b981');
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, Math.max(1, barWidth), barHeight);

        // Peak dot
        ctx.fillStyle = '#67e8f9';
        ctx.fillRect(x, y - 2, Math.max(1, barWidth), 1.5);

        x += barWidth + 2;
      }

      animFrameRef.current = requestAnimationFrame(renderVisualizer);
    };

    renderVisualizer();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, engineState.isPlaying, engineState.isMuted]);

  if (!isOpen) return null;

  const currentTrack = engineState.currentTrack || 
    musicConfig.tracks.find(t => t.id === musicConfig.activeTrackId) || 
    musicConfig.tracks[0];

  const handlePlayPause = () => {
    if (!musicConfig.enabled) {
      onToggleMusicEnabled(true);
    }
    if (engineState.isPlaying) {
      cyberAudioEngine.pause();
    } else {
      if (currentTrack) {
        cyberAudioEngine.playTrack(currentTrack);
      }
    }
  };

  const handleNextTrack = () => {
    if (!musicConfig.tracks || musicConfig.tracks.length === 0) return;
    const currentIndex = musicConfig.tracks.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % musicConfig.tracks.length;
    const nextTrack = musicConfig.tracks[nextIndex];
    onSelectTrack(nextTrack);
    cyberAudioEngine.playTrack(nextTrack);
  };

  const handlePrevTrack = () => {
    if (!musicConfig.tracks || musicConfig.tracks.length === 0) return;
    const currentIndex = musicConfig.tracks.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + musicConfig.tracks.length) % musicConfig.tracks.length;
    const prevTrack = musicConfig.tracks[prevIndex];
    onSelectTrack(prevTrack);
    cyberAudioEngine.playTrack(prevTrack);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#030919] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Holographic Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#01040f] border-b border-cyan-950">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-400">
              <Disc size={20} className={engineState.isPlaying ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
              {engineState.isPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  CYBER THEME AUDIO PLAYER
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono-tech bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                  SYS.AUDIO // V3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                로봇 포트폴리오 전용 배경음악 및 테마곡 제어 센터
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Music Power Toggle */}
            <button
              onClick={() => onToggleMusicEnabled(!musicConfig.enabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                musicConfig.enabled
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
              }`}
              title="음악 시스템 전체 켜기 / 끄기"
            >
              <Power size={13} />
              <span>{musicConfig.enabled ? 'BGM ON' : 'BGM OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyan-950/60 rounded-xl border border-transparent hover:border-cyan-900 transition-colors"
              title="창 닫기 (음악은 계속 재생됩니다)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Main Display: Vinyl / Holographic Spectrum Stage */}
          <div className="relative p-5 bg-[#020718] border border-cyan-900/80 rounded-2xl overflow-hidden shadow-inner">
            
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Track Info Badge */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-950/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded uppercase">
                    {currentTrack?.category || 'THEME BGM'}
                  </span>
                  {engineState.isPlaying && (
                    <span className="flex items-center gap-1 text-[11px] font-mono-tech text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE PLAYING
                    </span>
                  )}
                  {!engineState.isPlaying && (
                    <span className="text-[11px] font-mono-tech text-slate-500">
                      STANDBY
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {currentTrack?.title || '재생할 테마곡이 선택되지 않았습니다'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>아티스트 / 소스:</span>
                  <strong className="text-cyan-300 font-normal">{currentTrack?.artist || 'Zion Robotics Lab'}</strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex sm:flex-col items-end gap-1 text-right">
                <span className="text-[10px] font-mono-tech text-slate-400">DURATION</span>
                <span className="text-xs font-mono-tech text-cyan-400 font-bold">
                  {currentTrack?.duration || 'LOOP'}
                </span>
              </div>
            </div>

            {/* Audio Spectrum Canvas */}
            <div className="mt-4 relative h-24 bg-black/60 rounded-xl border border-cyan-950 overflow-hidden flex flex-col justify-end p-2">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={80} 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-3 flex items-center gap-2 text-[10px] font-mono-tech text-cyan-500/70">
                <Radio size={12} className={engineState.isPlaying ? 'animate-pulse text-cyan-400' : ''} />
                <span>SPECTRUM FREQ: 20Hz ~ 20kHz</span>
              </div>
              <div className="absolute top-2 right-3 text-[10px] font-mono-tech text-slate-500">
                PCM 48kHz / SYNTH V3
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              
              {/* Main Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevTrack}
                  className="p-2.5 text-slate-300 hover:text-white bg-[#040d24] hover:bg-cyan-950 border border-cyan-900 rounded-xl transition-all active:scale-95"
                  title="이전 곡"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  {engineState.isPlaying ? (
                    <>
                      <Pause size={18} fill="black" />
                      <span>일시정지</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="black" />
                      <span>테마곡 재생</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2.5 text-slate-300 hover:text-white bg-[#040d24] hover:bg-cyan-950 border border-cyan-900 rounded-xl transition-all active:scale-95"
                  title="다음 곡"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-cyan-950">
                <button
                  onClick={() => cyberAudioEngine.toggleMute()}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  title={engineState.isMuted ? '음소거 해제' : '음소거'}
                >
                  {engineState.isMuted || engineState.volume === 0 ? (
                    <VolumeX size={17} className="text-rose-400" />
                  ) : (
                    <Volume2 size={17} className="text-cyan-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={engineState.isMuted ? 0 : engineState.volume}
                  onChange={(e) => {
                    if (engineState.isMuted) cyberAudioEngine.toggleMute();
                    cyberAudioEngine.setVolume(parseFloat(e.target.value));
                  }}
                  className="w-24 sm:w-32 h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <span className="text-xs font-mono-tech text-cyan-400 w-8 text-right">
                  {engineState.isMuted ? '0%' : `${Math.round(engineState.volume * 100)}%`}
                </span>
              </div>
            </div>

            {/* Error or Notice Banner if present */}
            {engineState.error && (
              <div className="mt-3 px-3 py-2 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <Sparkles size={14} className="shrink-0 text-amber-400" />
                <span>{engineState.error}</span>
              </div>
            )}
          </div>

          {/* Theme Songs Playlist Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={16} className="text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  등록된 테마곡 목록 ({musicConfig.tracks.length})
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono-tech">
                원하는 곡을 클릭하여 즉시 청취
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {musicConfig.tracks.map((track, idx) => {
                const isSelected = currentTrack?.id === track.id;
                const isCurrentlyPlaying = isSelected && engineState.isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      onSelectTrack(track);
                      cyberAudioEngine.playTrack(track);
                    }}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#020718] border-cyan-950 hover:border-cyan-800 hover:bg-[#030d2a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-tech text-xs font-bold transition-colors ${
                        isSelected 
                          ? 'bg-cyan-400 text-black' 
                          : 'bg-cyan-950/60 text-slate-400 group-hover:text-cyan-300'
                      }`}>
                        {isCurrentlyPlaying ? (
                          <Disc size={16} className="animate-spin" />
                        ) : (
                          String(idx + 1).padStart(2, '0')
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold transition-colors ${
                            isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {track.title}
                          </span>
                          {track.isPreset && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono-tech bg-slate-800 text-slate-400 rounded">
                              PRESET
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {track.artist} {track.category ? `• ${track.category}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono-tech text-slate-400">
                        {track.duration || 'LOOP'}
                      </span>
                      {isSelected ? (
                        <span className="text-cyan-400 flex items-center gap-1 text-xs font-bold">
                          <CheckCircle2 size={15} />
                          <span className="hidden sm:inline">선택됨</span>
                        </span>
                      ) : (
                        <button className="text-xs text-slate-400 hover:text-cyan-400 transition-colors p-1">
                          <Play size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
            <span>💡 창을 닫아도 배경음악은 사이트 탐색 중 계속 원활하게 재생됩니다.</span>
            <button
              onClick={onClose}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Minimize2 size={13} />
              <span>화면 최소화</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
