import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Upload, Sparkles, Languages, Check, Bot, Loader2, ArrowRight, Wand2, Image as ImageIcon, Link as LinkIcon, RotateCcw, ChevronUp, ChevronDown, ListOrdered } from 'lucide-react';
import { ProjectItem } from '../types';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';
import robotLineTracingImg from '../assets/images/robot_line_tracing_1786709526477.jpg';
import { translateProjectDetails, translateSingleText } from '../utils/translation';


interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: ProjectItem) => void;
  nextProjectNumber: number;
}

// Preset Quick Templates for easy 1-click filling
const TEMPLATES = [
  {
    name: "자율주행 축구 로봇 (Robot Soccer Bot)",
    category: "RoboCup Junior Soccer",
    title: "Omni-directional Soccer Bot",
    descriptionKo: "3개의 옴니휠과 IR 볼 탐지 센서, 초음파 장애물 회피 알고리즘을 탑재하여 축구 경기에서 골대를 향해 공을 드리블하고 슈팅하는 로봇입니다.",
    descriptionEn: "3-Omniwheel competitive soccer robot with real-time IR pulsed-ball tracking and high-speed solenoid kicker.",
    tags: ["c++", "omni-wheel", "ir-seeker", "solenoid", "robocup"],
    hardware: [
      { name: "Omni Wheels & High-RPM Motors", qty: 3, description: "전방향 이동 12V 기어드 모터" },
      { name: "360° IR Ball Seeker Sensor", qty: 1, description: "적외선 펄스 축구공 방향 및 거리 감지" },
      { name: "Digital Compass / Gyro (BNO055)", qty: 1, description: "경기장 내 절대 방향 각도 유지" },
      { name: "High-Voltage Solenoid Kicker", qty: 1, description: "승압 회로 기반 순간 슈팅 장치" }
    ],
    algorithmSteps: [
      "1. 360도 IR 볼 시커 센서로 축구공 방향 및 거리 탐색",
      "2. 디지털 나침반(BNO055)으로 골대 방향 정렬 유지",
      "3. 3-옴니휠 차동 벡터 연산으로 공을 향해 자율 이동 및 드리블",
      "4. 볼 감지 센서 접촉 확인 시 고전압 솔레노이드 슈팅 트리거"
    ],
    code: `// Zion's Omni Soccer Bot - Ball Vector Heading
void trackAndKick() {
  int ballAngle = readIRBallAngle();
  int goalAngle = readCompassHeading();
  
  if (ballAngle != -1) {
    driveOmni(ballAngle, 200, goalAngle); // Drive towards ball while facing goal
    if (isBallInDribbler()) {
      chargeSolenoid();
      kickBall();
    }
  }
}`
  },
  {
    name: "라이다 SLAM 자율 로버 (LiDAR Rover)",
    category: "Autonomous Mapping Robot",
    title: "ROS2 LiDAR SLAM Rover",
    descriptionKo: "2D 360도 라이다와 엔코더 오도메트리를 결합하여 미지의 실내 환경을 2D 맵으로 작성하고 목표 지점까지 최단 경로로 자율주행하는 로버입니다.",
    descriptionEn: "Autonomous mapping rover with 2D LiDAR, ROS2 Nav2 stack, and A* obstacle avoidance algorithm.",
    tags: ["ros2", "lidar", "slam", "python", "nav2"],
    hardware: [
      { name: "RPLiDAR A1 360° 2D Scanner", qty: 1, description: "최대 12m 반경 레이저 거리 측정 센서" },
      { name: "Raspberry Pi 4 / Jetson Nano", qty: 1, description: "ROS2 노드 연산 및 실시간 매핑 메인보드" },
      { name: "Optical Wheel Encoders", qty: 2, description: "바퀴 회전수 및 오도메트리 위치 추정" }
    ],
    algorithmSteps: [
      "1. 2D 라이다 360도 레이저 스캔 포인트 클라우드 수신",
      "2. 카토그래퍼 / SLAM 알고리즘으로 점유 격자 지도 생성",
      "3. A* 및 Nav2 경로 생성기로 최단 주행 경로 연산",
      "4. 장애물 접근 시 감속 및 실시간 회피 주행 제어"
    ],
    code: `# ROS2 Autonomous Navigation Node
import rclpy
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

def scan_callback(data):
    min_front_dist = min(data.ranges[160:200])
    cmd = Twist()
    if min_front_dist < 0.35:
        cmd.linear.x = 0.0
        cmd.angular.z = 1.2 # Obstacle detected: turn
    else:
        cmd.linear.x = 0.4 # Path clear: forward
    cmd_pub.publish(cmd)`
  },
  {
    name: "AI 스마트 비전 분류기 (AI Vision Sorter)",
    category: "Computer Vision & Edge AI",
    title: "AI Vision Color & Object Sorter",
    descriptionKo: "OpenCV 카메라 영상에서 객체의 색상과 형태를 실시간으로 인식하여 서보 모터 그리퍼로 목표 위치에 분류 적재하는 로봇 팔 시스템입니다.",
    descriptionEn: "Edge AI camera robot arm sorting items based on color mask contours and inverse kinematics.",
    tags: ["opencv", "python", "servo-control", "kinematics", "ai-vision"],
    hardware: [
      { name: "4-DOF Robotic Arm with Gripper", qty: 1, description: "금속 기어 서보모터 관절 및 집게" },
      { name: "USB HD Wide-Angle Camera", qty: 1, description: "탑뷰 작업 영역 실시간 비디오 캡처" },
      { name: "PCA9685 16-Ch PWM Servo Driver", qty: 1, description: "I2C 정밀 서보모터 각도 제어" }
    ],
    algorithmSteps: [
      "1. USB 카메라 실시간 프레임 캡처 및 전처리",
      "2. HSV 색상 마스크 및 윤곽선(Contours) 검출",
      "3. 목표 물체 3차원 좌표 역기구학(IK) 관절 각도 계산",
      "4. 4축 서보모터 및 그리퍼 구동으로 분류 적재"
    ],
    code: `# OpenCV Color Mask & Sorting Logic
import cv2
import numpy as np

def detect_object(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    lower_red = np.array([0, 120, 70])
    upper_red = np.array([10, 255, 255])
    mask = cv2.inRange(hsv, lower_red, upper_red)
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    return contours`
  }
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  nextProjectNumber,
}) => {
  const codeDefault = `PRJ-${String(nextProjectNumber).padStart(3, '0')} // ACTIVE`;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState(codeDefault);
  const [category, setCategory] = useState('Autonomous Robotics');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [tagInput, setTagInput] = useState('c++, motorcontrol, autonomous, arduino');
  const [imagePreview, setImagePreview] = useState<string>(zionLogoImg);
  const [status, setStatus] = useState<'ACTIVE' | 'IN_DEVELOPMENT' | 'ARCHIVED'>('ACTIVE');

  // Translation UI state
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isTranslatingDesc, setIsTranslatingDesc] = useState<boolean>(false);
  const [isTranslatingTitle, setIsTranslatingTitle] = useState<boolean>(false);
  const [translateSuccessMsg, setTranslateSuccessMsg] = useState<string | null>(null);

  // Hardware BOM builder
  const [hardwareList, setHardwareList] = useState<{ name: string; qty: number; description: string }[]>([
    { name: 'Microcontroller Unit (Arduino/ESP32)', qty: 1, description: '주요 제어 연산 및 모터 PWM 제어' },
    { name: 'DC Geared Motors & Rubber Wheels', qty: 2, description: '차동 구동 모터 및 타이어' }
  ]);

  // Algorithm Steps
  const [algorithmSteps, setAlgorithmSteps] = useState<string[]>([
    '1. 시스템 센서 데이터 초기화 및 캘리브레이션',
    '2. 타겟 오차 계산 및 피드백 제어 연산',
    '3. 모터 드라이버 PWM 출력 신호 변조',
    '4. 실시간 상태 모니터링 및 예외 회피'
  ]);
  const [algoInput, setAlgoInput] = useState('');

  // Code snippet
  const [codeSnippet, setCodeSnippet] = useState(`// Zion's Robot Logic
void setup() {
  Serial.begin(115200);
  initSensors();
}

void loop() {
  updateRobotControl();
}`);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setDescriptionKo(tpl.descriptionKo);
    setDescriptionEn(tpl.descriptionEn);
    setTagInput(tpl.tags.join(', '));
    setHardwareList(tpl.hardware);
    setCodeSnippet(tpl.code);
    if (tpl.algorithmSteps) {
      setAlgorithmSteps(tpl.algorithmSteps);
    }
    setTranslateSuccessMsg(null);
  };

  const handleAddAlgoStep = () => {
    if (algoInput.trim()) {
      setAlgorithmSteps([...algorithmSteps, algoInput.trim()]);
      setAlgoInput('');
    }
  };

  const handleUpdateAlgoStep = (index: number, val: string) => {
    const updated = [...algorithmSteps];
    updated[index] = val;
    setAlgorithmSteps(updated);
  };

  const handleMoveAlgoStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= algorithmSteps.length) return;
    const updated = [...algorithmSteps];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setAlgorithmSteps(updated);
  };

  const handleRemoveAlgoStep = (index: number) => {
    setAlgorithmSteps(algorithmSteps.filter((_, i) => i !== index));
  };

  const handleResetDefaultAlgoSteps = () => {
    setAlgorithmSteps([
      '1. 시스템 센서 데이터 초기화 및 캘리브레이션',
      '2. 타겟 오차 계산 및 피드백 제어 연산',
      '3. 모터 드라이버 PWM 출력 신호 변조',
      '4. 실시간 상태 모니터링 및 예외 회피'
    ]);
  };

  // Full AI Auto-Translate (Title, Description, Category, Tags)
  const handleAutoTranslateAll = async () => {
    if (!descriptionKo.trim() && !title.trim()) {
      alert('먼저 한국어 제목 또는 한국어 설명을 입력해주세요!');
      return;
    }

    setIsTranslating(true);
    setTranslateSuccessMsg(null);

    try {
      const result = await translateProjectDetails({
        titleKo: title,
        descriptionKo: descriptionKo,
        categoryKo: category,
        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (result.translatedDescription) {
        setDescriptionEn(result.translatedDescription);
      }
      if (result.translatedCategory && category === 'Autonomous Robotics') {
        setCategory(result.translatedCategory);
      }
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        setTagInput(result.suggestedTags.join(', '));
      }
      setTranslateSuccessMsg('AI 영문 자동 번역이 완료되었습니다! (Auto-translated to English)');
      setTimeout(() => setTranslateSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
      setTranslateSuccessMsg('번역 중 오류가 발생했습니다. 로컬 번역이 적용되었습니다.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Single Description Translation
  const handleTranslateDescription = async () => {
    if (!descriptionKo.trim()) return;
    setIsTranslatingDesc(true);
    try {
      const translated = await translateSingleText(descriptionKo);
      if (translated) {
        setDescriptionEn(translated);
      }
    } finally {
      setIsTranslatingDesc(false);
    }
  };

  // Single Title Translation
  const handleTranslateTitle = async () => {
    if (!title.trim()) return;
    setIsTranslatingTitle(true);
    try {
      const translated = await translateSingleText(title);
      if (translated) {
        // If the user entered Korean title, we can update or set category/title
        setTitle(translated);
      }
    } finally {
      setIsTranslatingTitle(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHardwareRow = () => {
    setHardwareList([...hardwareList, { name: '', qty: 1, description: '' }]);
  };

  const handleRemoveHardwareRow = (index: number) => {
    setHardwareList(hardwareList.filter((_, i) => i !== index));
  };

  const handleHardwareChange = (index: number, field: string, val: any) => {
    const updated = [...hardwareList];
    updated[index] = { ...updated[index], [field]: val };
    setHardwareList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newProject: ProjectItem = {
      id: `prj-${Date.now()}`,
      code: code.trim() || `PRJ-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'Robotics System',
      descriptionKo: descriptionKo.trim() || `${title} 로봇 프로젝트입니다.`,
      descriptionEn: descriptionEn.trim() || `${title} autonomous robotics project.`,
      image: imagePreview || zionLogoImg,
      tags: tags.length > 0 ? tags : ['robot', 'c++', 'control'],
      status: status,
      featured: false,
      hardwareBOM: hardwareList.filter((h) => h.name.trim() !== ''),
      codeSnippet: codeSnippet.trim()
        ? {
            language: 'cpp',
            code: codeSnippet,
          }
        : undefined,
      algorithmSteps: algorithmSteps.length > 0 ? algorithmSteps : undefined,
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#050c18] border border-cyan-500/60 rounded-2xl flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/80 bg-[#061122] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-xs text-cyan-400 font-bold tracking-wider">
                  // NEW_ROBOT_PROJECT
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono-tech">
                  AI_TRANSLATION_ACTIVE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                새 로봇 프로젝트 추가 & 한-영 자동 번역
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-950 border border-transparent hover:border-cyan-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* AI Auto-Translation Banner Control */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#031527] to-[#04101e] border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 mt-0.5">
                <Languages size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono-tech">
                    AI 한-영 기술 자동 번역
                    <span className="text-[10px] px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 rounded">
                      Gemini Powered
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  한국어로 입력하면 로봇 공학 전문 용어에 맞춰 영어 설명과 태그를 자동으로 번역·생성합니다.
                </p>
              </div>
            </div>

            <button
              id="btn-auto-translate-all"
              type="button"
              onClick={handleAutoTranslateAll}
              disabled={isTranslating}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs font-mono-tech shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95 flex-shrink-0"
            >
              {isTranslating ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>AI 번역 처리 중...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  <span>한국어 ➔ 영어 자동 번역 실행</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message Banner if any */}
          {translateSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600/80 text-emerald-300 text-xs font-mono-tech flex items-center gap-2 animate-in fade-in">
              <Check size={14} className="text-emerald-400" />
              <span>{translateSuccessMsg}</span>
            </div>
          )}

          {/* Quick Template Fillers */}
          <div className="p-3 rounded-xl bg-[#030914] border border-cyan-900/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono-tech text-cyan-400 font-bold">
              <Sparkles size={14} className="text-cyan-300" />
              <span>빠른 예시 템플릿 불러오기 (Quick Preset Templates):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 hover:border-cyan-400 text-left text-xs transition-all flex flex-col justify-between group"
                >
                  <span className="font-bold text-white group-hover:text-cyan-300 line-clamp-1">{tpl.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono-tech mt-1">{tpl.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono-tech text-cyan-300">
                  프로젝트 이름 (Project Title) *
                </label>
                {title && (
                  <button
                    type="button"
                    onClick={handleTranslateTitle}
                    disabled={isTranslatingTitle}
                    className="text-[10px] text-cyan-400 hover:text-cyan-200 underline font-mono-tech flex items-center gap-0.5"
                    title="Translate title into English"
                  >
                    {isTranslatingTitle ? <Loader2 size={10} className="animate-spin" /> : <Languages size={10} />}
                    <span>영문 제목으로 변환</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 고속 라인트레이서 자율주행 로봇"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Code identifier */}
            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                프로젝트 코드 (Project Code)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PRJ-004 // ACTIVE"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                카테고리 / 로봇 유형 (Category)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: Autonomous Ground Vehicle / RoboCup"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
                진행 상태 (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="ACTIVE">ACTIVE (개발 완료 / 운용 중)</option>
                <option value="IN_DEVELOPMENT">IN_DEVELOPMENT (제작 및 코딩 중)</option>
                <option value="ARCHIVED">ARCHIVED (대회 완료 기록)</option>
              </select>
            </div>
          </div>

          {/* Descriptions (Korean & English with direct translation buttons) */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono-tech text-cyan-300">
                  한국어 설명 (Korean Description) *
                </label>
                <button
                  type="button"
                  onClick={handleTranslateDescription}
                  disabled={isTranslatingDesc || !descriptionKo.trim()}
                  className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-400 hover:text-white px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 disabled:opacity-40 transition-colors"
                >
                  {isTranslatingDesc ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <ArrowRight size={11} />
                  )}
                  <span>👉 영문 설명으로 번역 (Translate to English)</span>
                </button>
              </div>
              <textarea
                required
                rows={2}
                value={descriptionKo}
                onChange={(e) => setDescriptionKo(e.target.value)}
                placeholder="로봇의 기능, 작동 방식, 제어 알고리즘 및 목적을 한국어로 자유롭게 작성하세요."
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono-tech text-cyan-300 flex items-center gap-1.5">
                  <span>영어 설명 (English Description)</span>
                  {descriptionEn && (
                    <span className="text-[10px] text-cyan-400 font-mono-tech bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-900">
                      Auto-synced
                    </span>
                  )}
                </label>
              </div>
              <input
                type="text"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Autonomous robot with sensor-guided feedback and motor control."
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Image Selection & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech text-cyan-300 flex items-center gap-1.5 font-bold">
                <ImageIcon size={14} className="text-cyan-400" />
                <span>로봇 프로젝트 사진 / 이미지 변경 (Project Image Asset) *</span>
              </label>
              <span className="text-[10px] text-cyan-400/80 font-mono-tech">
                컴퓨터 파일 업로드 또는 웹 이미지 URL 입력
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-[#030814] border border-cyan-900/80">
              {/* Preview Box */}
              <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border-2 border-cyan-500/60 bg-black flex-shrink-0 flex items-center justify-center relative shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <img
                  src={imagePreview || zionLogoImg}
                  alt="Robot Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] text-cyan-300 font-mono-tech">
                  PREVIEW
                </span>
              </div>

              {/* Controls */}
              <div className="space-y-3 flex-1 w-full">
                {/* Upload & Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono-tech shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                  >
                    <Upload size={13} />
                    <span>내 컴퓨터 사진 변경 / 업로드</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview(robotLineTracingImg)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    라인트레이서 기본
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview(zionLogoImg)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    사이버 로고
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePreview('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    AI 휴머노이드
                  </button>
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500" />
                    <input
                      type="url"
                      placeholder="또는 이미지 웹 URL 직접 입력 (https://...)"
                      value={imagePreview.startsWith('data:') ? '' : imagePreview}
                      onChange={(e) => {
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#02050e] border border-cyan-900/80 focus:border-cyan-400 text-slate-200 text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                  {imagePreview !== zionLogoImg && (
                    <button
                      type="button"
                      onClick={() => setImagePreview(zionLogoImg)}
                      className="p-1.5 rounded bg-cyan-950 text-slate-400 hover:text-white border border-cyan-900"
                      title="기본 이미지로 초기화"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-mono-tech">
                  💡 컴퓨터의 사진(JPG, PNG, WebP)을 선택하여 등록하거나 웹 링크를 붙여넣을 수 있습니다.
                </p>
              </div>
            </div>
          </div>


          {/* Tags */}
          <div>
            <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
              기술 태그 (Tags, 쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="arduino, motorcontrol, sensorcontrol, pid-control, python"
              className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-cyan-900 focus:border-cyan-400 text-slate-100 text-xs font-mono-tech focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Hardware BOM Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono-tech text-cyan-300">
                하드웨어 부품 목록 (Hardware BOM Table)
              </label>
              <button
                type="button"
                onClick={handleAddHardwareRow}
                className="flex items-center gap-1 text-[11px] font-mono-tech text-cyan-400 hover:text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800"
              >
                <Plus size={12} />
                <span>부품 추가</span>
              </button>
            </div>

            <div className="space-y-2">
              {hardwareList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="부품명 (예: STM32 / L298N)"
                    value={item.name}
                    onChange={(e) => handleHardwareChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded bg-[#030712] border border-cyan-950 text-xs font-mono-tech text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="수량"
                    value={item.qty}
                    onChange={(e) => handleHardwareChange(idx, 'qty', parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 rounded bg-[#030712] border border-cyan-950 text-xs font-mono-tech text-cyan-400 text-center focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="역할 / 규격"
                    value={item.description}
                    onChange={(e) => handleHardwareChange(idx, 'description', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded bg-[#030712] border border-cyan-950 text-xs font-mono-tech text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHardwareRow(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Pipeline Steps */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#040c1e] border border-cyan-900/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-cyan-950 pb-1.5">
              <label className="text-xs font-mono-tech text-cyan-300 font-bold flex items-center gap-1.5">
                <ListOrdered size={14} className="text-cyan-400" />
                <span>제어 알고리즘 실행 파이프라인 (// PIPELINE STEPS)</span>
              </label>
              <button
                type="button"
                onClick={handleResetDefaultAlgoSteps}
                className="text-[11px] text-cyan-400/80 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono-tech"
              >
                <RotateCcw size={11} />
                <span>표준 4단계로 채우기</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono-tech">
              프로젝트 모달창에 표시되는 실시간 실행 단계 목록입니다. 직접 수정하거나 순서를 변경할 수 있습니다.
            </p>

            {algorithmSteps.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {algorithmSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#02050e] border border-cyan-950 rounded-lg p-2">
                    <span className="text-xs font-bold font-mono-tech text-cyan-400 w-5 text-center flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={step.replace(/^\d+\.\s*/, '')}
                      onChange={(e) => handleUpdateAlgoStep(idx, `${idx + 1}. ${e.target.value}`)}
                      placeholder={`단계 ${idx + 1} 설명`}
                      className="flex-1 bg-[#01040a] border border-cyan-900/60 focus:border-cyan-400 rounded px-2.5 py-1 text-xs text-slate-200 font-mono-tech outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveAlgoStep(idx, -1)}
                        disabled={idx === 0}
                        title="위로 이동"
                        className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveAlgoStep(idx, 1)}
                        disabled={idx === algorithmSteps.length - 1}
                        title="아래로 이동"
                        className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlgoStep(idx)}
                        className="p-1 rounded bg-rose-950/40 text-rose-400 hover:text-rose-200"
                        title="삭제"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={algoInput}
                onChange={(e) => setAlgoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAlgoStep();
                  }
                }}
                placeholder="새 단계 입력 후 추가 (예: 초음파 거리 측정 및 긴급 정지)"
                className="flex-1 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-white text-xs outline-none font-mono-tech"
              />
              <button
                type="button"
                onClick={handleAddAlgoStep}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs flex items-center gap-1 font-mono-tech shrink-0 font-bold"
              >
                <Plus size={13} />
                <span>단계 추가</span>
              </button>
            </div>
          </div>

          {/* Algorithm Code Snippet */}
          <div>
            <label className="block text-xs font-mono-tech text-cyan-300 mb-1">
              제어 알고리즘 코드 스니펫 (C++ / Python / Arduino)
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#02050b] border border-cyan-950 focus:border-cyan-400 text-cyan-300 font-mono-tech text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-mono"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-950">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#030814] hover:bg-cyan-950 text-slate-400 border border-cyan-900 text-xs font-mono-tech transition-colors"
            >
              취소 (Cancel)
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs font-mono-tech shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all active:scale-95"
            >
              <Check size={14} />
              <span>프로젝트 등록 완료 (Deploy Project)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
