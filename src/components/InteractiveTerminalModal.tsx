import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { PORTFOLIO_INFO, SKILL_ITEMS, PROJECT_ITEMS, JOURNEY_ITEMS } from '../data/portfolioData';
import { ProjectItem, AdminUser } from '../types';
import { ROOT_ADMIN_EMAIL, getAdminUsers } from '../data/adminAuth';

interface InteractiveTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: ProjectItem[];
  currentUser?: AdminUser | null;
  onOpenAdminLogin?: () => void;
}

interface CommandLog {
  id: string;
  command: string;
  output: string | React.ReactNode;
  time: string;
}

export const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({
  isOpen,
  onClose,
  projects = PROJECT_ITEMS,
  currentUser,
  onOpenAdminLogin,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: 'sys.init --user zion',
      output: (
        <div className="space-y-1 text-cyan-300">
          <div>[SYSTEM] ZION_ROBOT_OS v2.6.8 BOOT SEQUENCE COMPLETE.</div>
          <div>[IDENTITY] 김지온 (Zion Kim) // Robotics & Autonomous Systems</div>
          <div>Type <span className="text-white font-bold">&apos;help&apos;</span> to inspect available terminal commands.</div>
        </div>
      ),
      time: '05:11:34'
    }
  ]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const lowerCmd = cmd.toLowerCase();
    const time = new Date().toLocaleTimeString();
    let output: React.ReactNode = '';

    switch (lowerCmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">AVAILABLE COMMANDS:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              <div><span className="text-white font-bold">bio</span> / <span className="text-white font-bold">zion</span> - View Zion&apos;s robotics profile</div>
              <div><span className="text-white font-bold">skills</span> - List all technical arsenals</div>
              <div><span className="text-white font-bold">projects</span> - View robot project repositories</div>
              <div><span className="text-white font-bold">journey</span> - Display tournament timelines</div>
              <div><span className="text-white font-bold">whoami</span> - Display current user authorization role</div>
              <div><span className="text-white font-bold">admin</span> - View admin authorization status</div>
              <div><span className="text-white font-bold">robot --status</span> - Query real-time robot hardware stats</div>
              <div><span className="text-white font-bold">pid</span> - Inspect line tracing PID gains</div>
              <div><span className="text-white font-bold">quote</span> - Display Zion&apos;s motto</div>
              <div><span className="text-white font-bold">clear</span> - Clear terminal window</div>
            </div>
          </div>
        );
        break;

      case 'whoami':
        output = (
          <div className="space-y-1 text-xs">
            {currentUser ? (
              <div className="text-emerald-400">
                [AUTH] Logged in as: <span className="text-white font-bold">{currentUser.name}</span> ({currentUser.email})
                <br />
                Role: <span className="text-cyan-300 font-mono-tech">[{currentUser.role}]</span>
              </div>
            ) : (
              <div className="text-slate-400">
                [AUTH] Guest Visitor (Read-Only Mode). To authenticate as Admin, use the Admin button in the navbar or run &apos;admin&apos;.
              </div>
            )}
          </div>
        );
        break;

      case 'admin':
      case 'auth':
        const admins = getAdminUsers();
        output = (
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="text-cyan-400 font-bold">ACCESS CONTROL SYSTEM (ACL):</div>
            <div>Root Super Admin: <span className="text-cyan-300 font-bold">{ROOT_ADMIN_EMAIL}</span></div>
            <div>Current Active Admin: <span className="text-white font-bold">{currentUser ? `${currentUser.name} (${currentUser.role})` : 'None (Guest)'}</span></div>
            <div>Registered Admins: {admins.map(a => `${a.name} [${a.role}]`).join(', ')}</div>
            {!currentUser && onOpenAdminLogin && (
              <div className="text-amber-300 mt-1">
                Tip: Click Admin in the navbar to authenticate with owner credentials.
              </div>
            )}
          </div>
        );
        break;

      case 'bio':
      case 'zion':
        output = (
          <div className="space-y-1.5 text-slate-300">
            <div className="text-cyan-300 font-bold">ZION (김지온) // ROBOTICS ENGINEER</div>
            <div>&quot;{PORTFOLIO_INFO.headlineKorean}&quot;</div>
            <div className="text-xs text-slate-400">Mission: {PORTFOLIO_INFO.primaryDirective}</div>
            <div className="text-xs text-cyan-400">Target Goal: {PORTFOLIO_INFO.goal}</div>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">TECHNICAL SKILLS:</div>
            {SKILL_ITEMS.map(s => (
              <div key={s.id} className="text-xs flex items-center justify-between gap-2">
                <span className="text-white">• {s.name}</span>
                <span className="text-cyan-400">[{s.proficiency}%] {s.tags.slice(0, 2).join(', ')}</span>
              </div>
            ))}
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">PROJECT REPOSITORIES ({projects.length}):</div>
            {projects.map(p => (
              <div key={p.id} className="text-xs">
                <span className="text-cyan-300">[{p.code}]</span> <span className="text-white font-bold">{p.title}</span> - {p.category}
              </div>
            ))}
          </div>
        );
        break;

      case 'journey':
        output = (
          <div className="space-y-1 text-slate-300">
            <div className="text-cyan-400 font-bold">TOURNAMENT LOGS:</div>
            {JOURNEY_ITEMS.map(j => (
              <div key={j.id} className="text-xs">
                <span className="text-amber-300">[{j.year}]</span> <span className="text-white font-bold">{j.title}</span> ({j.subtitle})
              </div>
            ))}
          </div>
        );
        break;

      case 'robot --status':
      case 'status':
        output = (
          <div className="space-y-1 text-xs text-slate-300">
            <div className="text-emerald-400 font-bold">[ROBOT TELEMETRY: NOMINAL]</div>
            <div>• Battery Voltage: 7.84V (2S Li-Po 94%)</div>
            <div>• MCU: ESP32 Dual Core @ 240MHz (Temp: 34.2°C)</div>
            <div>• IR Sensor Array: 5-Ch Active (Calibrated: Black=0, White=1023)</div>
            <div>• Motor Drivers: Dual TB6612FNG (PWM Clock: 20kHz)</div>
            <div>• Control Loop: 100Hz RTOS Task (Jitter &lt; 0.1ms)</div>
          </div>
        );
        break;

      case 'pid':
        output = (
          <div className="space-y-1 text-xs text-slate-300">
            <div className="text-cyan-400 font-bold">PID GAIN MATRIX:</div>
            <div>u(t) = Kp*e(t) + Ki*∫e(t)dt + Kd*de(t)/dt</div>
            <div className="text-cyan-300">• Kp = 18.5 (Proportional)</div>
            <div className="text-cyan-300">• Ki = 0.02 (Integral)</div>
            <div className="text-cyan-300">• Kd = 25.0 (Derivative)</div>
          </div>
        );
        break;

      case 'quote':
        output = (
          <div className="text-cyan-300 font-bold italic text-sm">
            &quot;{PORTFOLIO_INFO.headlineKorean}&quot; — Zion Kim
          </div>
        );
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      default:
        output = (
          <div className="text-rose-400 text-xs">
            command not recognized: &apos;{cmd}&apos;. Type &apos;help&apos; for command list.
          </div>
        );
        break;
    }

    setHistory(prev => [...prev, { id: `${Date.now()}`, command: cmd, output, time }]);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className={`relative bg-[#02050b] border border-cyan-500/60 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.35)] overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'w-full h-full' : 'w-full max-w-2xl h-[480px]'
        }`}
      >
        {/* Terminal Titlebar */}
        <div className="px-4 py-3 bg-[#050e1c] border-b border-cyan-900/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 ml-2 text-xs font-mono-tech text-cyan-400">
              <TerminalIcon size={14} />
              <span>zion@robot-lab: ~/portfolio</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono-tech text-xs space-y-3 cyber-grid-dense">
          {history.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-cyan-400 font-bold">zion@lab:~$</span>
                <span className="text-white">{item.command}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{item.time}</span>
              </div>
              <div className="pl-4 text-slate-200">{item.output}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleCommand} className="p-3 bg-[#030914] border-t border-cyan-950 flex items-center gap-2 font-mono-tech text-xs">
          <span className="text-cyan-400 font-bold">zion@lab:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type 'help', 'whoami', 'admin', 'projects', 'status'..."
            className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded text-[11px] font-bold"
          >
            Execute
          </button>
        </form>
      </div>
    </div>
  );
};
