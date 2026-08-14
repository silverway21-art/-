import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Cpu, Code2, Check, Copy, Sliders } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'code' | 'hardware'>('overview');
  const [copied, setCopied] = useState(false);

  // Simulator State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [kp, setKp] = useState(1.8);
  const [ki, setKi] = useState(0.01);
  const [kd, setKd] = useState(2.2);
  const [speed, setSpeed] = useState(3.5);
  const [telemetry, setTelemetry] = useState({
    error: 0,
    leftPwm: 180,
    rightPwm: 180,
    lapCount: 0,
    status: 'Tracking Line'
  });

  // Simulator loop
  useEffect(() => {
    if (!project || activeTab !== 'simulator') return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Robot state
    let robotX = 140;
    let robotY = 120;
    let robotAngle = 0;
    let lastError = 0;
    let integral = 0;
    let lapCount = 0;
    let prevCheckPassed = false;

    // Track path definition (Smooth racetrack)
    const getTrackPoints = (w: number, h: number) => {
      const pts: { x: number; y: number }[] = [];
      const numPts = 300;
      for (let i = 0; i < numPts; i++) {
        const t = (i / numPts) * Math.PI * 2;
        // Figure eight / racetrack formula
        const x = w / 2 + (w * 0.38) * Math.cos(t);
        const y = h / 2 + (h * 0.35) * Math.sin(2 * t) * 0.7;
        pts.push({ x, y });
      }
      return pts;
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const trackPoints = getTrackPoints(w, h);

      // 1. Clear background
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, w, h);

      // 2. Draw subtle grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Draw Track (Black tape line with cyan glow)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      trackPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.stroke();

      // Centerline guide
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Find nearest point on track to robot front sensor
      const sensorDist = 18;
      const sensorX = robotX + Math.cos(robotAngle) * sensorDist;
      const sensorY = robotY + Math.sin(robotAngle) * sensorDist;

      let closestPt = trackPoints[0];
      let minDistance = 99999;
      let closestIdx = 0;

      trackPoints.forEach((pt, idx) => {
        const d = Math.hypot(pt.x - sensorX, pt.y - sensorY);
        if (d < minDistance) {
          minDistance = d;
          closestPt = pt;
          closestIdx = idx;
        }
      });

      // Track target heading vector
      const nextIdx = (closestIdx + 3) % trackPoints.length;
      const targetPt = trackPoints[nextIdx];
      const targetAngle = Math.atan2(targetPt.y - sensorY, targetPt.x - sensorX);

      // Error calculation: signed angular error between current robot heading and target line
      let error = targetAngle - robotAngle;
      while (error > Math.PI) error -= Math.PI * 2;
      while (error < -Math.PI) error += Math.PI * 2;

      // PID step
      if (isRunning) {
        integral += error;
        integral = Math.max(-10, Math.min(10, integral)); // Anti-windup
        const derivative = error - lastError;
        lastError = error;

        const pidOutput = (kp * error) + (ki * integral) + (kd * derivative);

        // Turn rate and linear velocity
        const angularVelocity = pidOutput * 0.15;
        robotAngle += angularVelocity;

        robotX += Math.cos(robotAngle) * speed;
        robotY += Math.sin(robotAngle) * speed;

        // Lap detection
        if (robotX > w / 2 && !prevCheckPassed) {
          lapCount++;
          prevCheckPassed = true;
        } else if (robotX < w / 2) {
          prevCheckPassed = false;
        }

        // Update telemetry
        const basePwm = 180;
        const diffPwm = Math.round(pidOutput * 25);
        setTelemetry({
          error: parseFloat((error * (180 / Math.PI)).toFixed(1)),
          leftPwm: Math.max(0, Math.min(255, basePwm + diffPwm)),
          rightPwm: Math.max(0, Math.min(255, basePwm - diffPwm)),
          lapCount: Math.floor(lapCount / 2),
          status: minDistance < 25 ? 'Locked On Line' : 'Recalibrating...'
        });
      }

      // 5. Draw Robot Chassis
      ctx.save();
      ctx.translate(robotX, robotY);
      ctx.rotate(robotAngle);

      // Body frame (Translucent Blue Acrylic)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-16, -12, 32, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Left and Right Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -15, 12, 4);
      ctx.fillRect(-10, 11, 12, 4);

      // Front IR Sensor Array Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(12, -10, 5, 20);

      // Sensor LEDs (red/cyan)
      for (let s = -8; s <= 8; s += 4) {
        ctx.fillStyle = Math.abs(error) < 0.2 && Math.abs(s) <= 4 ? '#22d3ee' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(14, s, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center glowing core
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [project, activeTab, isRunning, kp, ki, kd, speed]);

  if (!project) return null;

  const handleCopyCode = () => {
    if (project.codeSnippet) {
      navigator.clipboard.writeText(project.codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#050c18] border border-cyan-500/50 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/80 flex items-center justify-between bg-[#061122]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono-tech text-xs text-cyan-400 font-bold tracking-wider">
              {project.code}
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white ml-2">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950/60 border border-transparent hover:border-cyan-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-950 bg-[#040914] px-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'System Overview', icon: Cpu },
            { id: 'simulator', label: 'Live PID Simulator', icon: Sliders },
            { id: 'code', label: 'C++ / Algorithm', icon: Code2 },
            { id: 'hardware', label: 'Hardware BOM', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-mono-tech font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl overflow-hidden border border-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-black">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-56 sm:h-64 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-mono-tech text-xs text-cyan-400 mb-1">// SYSTEM_SUMMARY</h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {project.descriptionKo}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-900/50 space-y-2">
                    <span className="font-mono-tech text-[11px] text-cyan-300 font-bold block">
                      KEY ENGINEERING SPECS:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 font-mono-tech">
                      <li>• Control Loop: 100 Hz PID Closed Loop</li>
                      <li>• Sensor: 5-Channel High Sensitivity IR Reflection Array</li>
                      <li>• Actuators: Dual Differential DC Motor with PWM modulation</li>
                      <li>• Target: Zero overshoot with smooth cornering trajectories</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-mono-tech rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Algorithm Step-by-Step Flow */}
              {project.algorithmSteps && (
                <div className="p-4 rounded-xl bg-[#060e1b] border border-cyan-900/50 space-y-3">
                  <h3 className="font-mono-tech text-xs text-cyan-400 font-bold">
                    // CONTROL ALGORITHM EXECUTION PIPELINE
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {project.algorithmSteps.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-cyan-950/20 border border-cyan-950 flex items-start gap-2">
                        <span className="text-cyan-400 font-mono-tech font-bold">{idx + 1}.</span>
                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#060e1b] border border-cyan-900/60">
                <div>
                  <span className="font-mono-tech text-xs font-bold text-cyan-400">// PID TUNING WORKSPACE</span>
                  <p className="text-[11px] text-slate-400">
                    실시간으로 비례(P), 적분(I), 미분(D) 계수를 조정하여 가상 로봇의 라인트레이싱 거동을 확인하세요.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded transition-colors"
                  >
                    {isRunning ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isRunning ? 'Pause' : 'Start'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setKp(1.8);
                      setKi(0.01);
                      setKd(2.2);
                      setSpeed(3.5);
                    }}
                    className="p-1.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded hover:text-white"
                    title="Reset PID values"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Canvas Visualizer */}
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-inner bg-black">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={320}
                  className="w-full h-64 sm:h-72 block"
                />

                {/* On-screen Telemetry Overlay */}
                <div className="absolute top-2 left-2 p-2 rounded bg-black/80 border border-cyan-900/80 font-mono-tech text-[10px] text-cyan-300 space-y-0.5 pointer-events-none">
                  <div>STATUS: <span className="text-white font-bold">{telemetry.status}</span></div>
                  <div>HEADING_ERR: <span className="text-amber-300">{telemetry.error}°</span></div>
                  <div>L_PWM: <span className="text-emerald-300">{telemetry.leftPwm}</span> | R_PWM: <span className="text-emerald-300">{telemetry.rightPwm}</span></div>
                  <div>COMPLETED_LAPS: <span className="text-white font-bold">{telemetry.lapCount}</span></div>
                </div>
              </div>

              {/* PID Tuning Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#060e1b] border border-cyan-900/50">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-cyan-400 font-bold">Kp (Proportional):</span>
                    <span className="text-white">{kp.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={kp}
                    onChange={(e) => setKp(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">현재 오차 반응 강도</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-cyan-400 font-bold">Ki (Integral):</span>
                    <span className="text-white">{ki.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.05"
                    step="0.005"
                    value={ki}
                    onChange={(e) => setKi(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">누적 오차 정상상태 제거</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-cyan-400 font-bold">Kd (Derivative):</span>
                    <span className="text-white">{kd.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={kd}
                    onChange={(e) => setKd(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">진동 억제 및 급커브 댐핑</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-cyan-400 font-bold">Speed (Velocity):</span>
                    <span className="text-white">{speed.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="6.0"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">기준 주행 속도 (PWM Base)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CODE SNIPPET */}
          {activeTab === 'code' && project.codeSnippet && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-xs text-cyan-400">// ARDUINO_C_PID_CONTROLLER.ino</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-800 rounded text-xs font-mono-tech transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#02050b] border border-cyan-950 text-xs font-mono-tech text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                <code>{project.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: HARDWARE BOM */}
          {activeTab === 'hardware' && project.hardwareBOM && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="font-mono-tech text-xs text-cyan-400 font-bold">// HARDWARE BILL OF MATERIALS</h3>
              <div className="border border-cyan-950 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono-tech">
                  <thead className="bg-cyan-950/60 text-cyan-300 border-b border-cyan-900">
                    <tr>
                      <th className="p-3">Component</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Specification / Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-950 text-slate-300">
                    {project.hardwareBOM.map((part, i) => (
                      <tr key={i} className="hover:bg-cyan-950/20">
                        <td className="p-3 font-semibold text-white">{part.name}</td>
                        <td className="p-3 text-cyan-400">{part.qty}</td>
                        <td className="p-3 text-slate-400">{part.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-950 bg-[#040913] flex justify-between items-center text-xs font-mono-tech text-slate-400">
          <span>PORTFOLIO_ID: {project.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-white border border-cyan-800 transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
