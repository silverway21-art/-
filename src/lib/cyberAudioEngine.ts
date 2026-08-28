/**
 * Cyber Audio Core Engine for Zion's Robot Portfolio
 * Supports HTML5 Audio (URLs / Base64 Data URIs) + Procedural Web Audio Ambient Synthesizer
 * Provides real-time frequency analysis for cyber visualizers.
 */

import { ThemeTrack } from '../types';

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  currentTrack: ThemeTrack | null;
  error: string | null;
}

type AudioListener = (state: AudioEngineState) => void;

class CyberAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private htmlAudioSource: MediaElementAudioSourceNode | null = null;
  
  // Synth generator references
  private synthInterval: any = null;
  private activeSynthNodes: AudioNode[] = [];
  
  private state: AudioEngineState = {
    isPlaying: false,
    isMuted: false,
    volume: 0.45,
    currentTrack: null,
    error: null,
  };

  private listeners: Set<AudioListener> = new Set();
  private userInteracted: boolean = false;

  constructor() {
    // Lazy audio context creation on user interaction
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        this.userInteracted = true;
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
      window.addEventListener('click', handleFirstInteraction, { once: true });
      window.addEventListener('keydown', handleFirstInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    }
  }

  private initAudioContext() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.isMuted ? 0 : this.state.volume, this.audioCtx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('[CyberAudioEngine] Web Audio initialization warning:', e);
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((l) => l(copy));
  }

  public getState(): AudioEngineState {
    return { ...this.state };
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.state.isMuted ? 0 : clamped;
      this.masterGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.state.isMuted ? 0 : clamped;
    }
    this.notify();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    this.setVolume(this.state.volume);
  }

  public async playTrack(track: ThemeTrack) {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {}
    }

    // Stop current playback
    this.stopCurrent();

    this.state.currentTrack = track;
    this.state.error = null;

    if (track.url.startsWith('synth:')) {
      // Use procedural Web Audio Synth
      this.startSynth(track.url);
      this.state.isPlaying = true;
      this.notify();
    } else {
      // Use HTML5 Audio
      this.startHtmlAudio(track.url);
    }
  }

  private startHtmlAudio(url: string) {
    try {
      this.htmlAudio = new Audio();
      this.htmlAudio.crossOrigin = 'anonymous';
      this.htmlAudio.src = url;
      this.htmlAudio.loop = true;
      this.htmlAudio.volume = this.state.isMuted ? 0 : this.state.volume;

      // Connect to analyser if CORS allows
      if (this.audioCtx && this.masterGain) {
        try {
          if (!this.htmlAudioSource) {
            this.htmlAudioSource = this.audioCtx.createMediaElementSource(this.htmlAudio);
            this.htmlAudioSource.connect(this.masterGain);
          }
        } catch {
          // Cross-origin audio can still play via normal destination
        }
      }

      this.htmlAudio.onplay = () => {
        this.state.isPlaying = true;
        this.state.error = null;
        this.notify();
      };

      this.htmlAudio.onpause = () => {
        if (this.state.isPlaying) {
          this.state.isPlaying = false;
          this.notify();
        }
      };

      this.htmlAudio.onerror = (e) => {
        console.warn('[CyberAudioEngine] Audio URL play failed, falling back to Cyber Matrix Synth:', e);
        this.state.error = '외부 오디오 스트림 연결 실패. 사이버 앰비언트 신스로 전환합니다.';
        this.startSynth('synth:cyber-matrix');
        this.state.isPlaying = true;
        this.notify();
      };

      const playPromise = this.htmlAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('[CyberAudioEngine] Autoplay waiting for user gesture:', err.message);
          this.state.isPlaying = false;
          this.state.error = '브라우저 자동재생 방지: 재생 버튼을 누르시면 테마곡이 시작됩니다.';
          this.notify();
        });
      }
    } catch (err: any) {
      this.state.error = err.message;
      this.startSynth('synth:cyber-matrix');
      this.state.isPlaying = true;
      this.notify();
    }
  }

  /**
   * Procedural Web Audio Sci-Fi & Cyber Ambient Generator
   */
  private startSynth(synthType: string) {
    if (!this.audioCtx || !this.masterGain) return;
    const ctx = this.audioCtx;

    // Filter Node for warm cyber tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(synthType === 'synth:lofi-pulse' ? 450 : 650, ctx.currentTime);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);
    filter.connect(this.masterGain);
    this.activeSynthNodes.push(filter);

    // LFO to slowly sweep the filter cutoff (breathing ambient effect)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.activeSynthNodes.push(lfo, lfoGain);

    // Minor 9th Cyber chords (D, F, A, C, E) or (A, C, E, G, B)
    const chordFreqs = synthType === 'synth:lofi-pulse' 
      ? [110.0, 164.81, 220.0, 261.63, 329.63] // A minor 9
      : [73.42, 110.0, 146.83, 174.61, 220.0, 293.66]; // D minor atmospheric drone

    chordFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Gentle micro detune for lush spatial chorus
      osc.detune.setValueAtTime((idx - 2) * 5.5, ctx.currentTime);

      const individualVol = 0.08 / (idx + 1);
      oscGain.gain.setValueAtTime(individualVol, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();

      this.activeSynthNodes.push(osc, oscGain);
    });

    // Gentle arpeggiator chime timer every 2.5 seconds
    const chimeNotes = [440, 523.25, 659.25, 783.99, 880, 1046.5];
    let noteIdx = 0;
    this.synthInterval = setInterval(() => {
      if (!this.state.isPlaying || !this.audioCtx || !this.masterGain) return;
      try {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(chimeNotes[noteIdx % chimeNotes.length], ctx.currentTime);
        noteIdx++;

        chimeGain.gain.setValueAtTime(0.001, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(filter);
        chimeOsc.start();
        chimeOsc.stop(ctx.currentTime + 2.3);
      } catch {}
    }, 2400);

    this.state.isPlaying = true;
  }

  public pause() {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    this.stopSynth();
    this.state.isPlaying = false;
    this.notify();
  }

  public resume() {
    if (this.state.currentTrack) {
      this.playTrack(this.state.currentTrack);
    }
  }

  public togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      if (this.state.currentTrack) {
        this.playTrack(this.state.currentTrack);
      }
    }
  }

  private stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.activeSynthNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeSynthNodes = [];
  }

  private stopCurrent() {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.src = '';
      this.htmlAudio = null;
    }
    this.stopSynth();
  }

  /**
   * Read FFT frequency byte data for rendering animated equalizers & waveforms
   */
  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser && this.state.isPlaying && !this.state.isMuted) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }
}

export const cyberAudioEngine = new CyberAudioEngine();
