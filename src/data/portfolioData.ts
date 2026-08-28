import { JourneyItem, SkillItem, ProjectItem, AwardItem, ThemeTrack, MusicConfig } from '../types';
import robotLineTracingImg from '../assets/images/robot_line_tracing_1786709526477.jpg';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';

export const PORTFOLIO_INFO = {
  name: "김지온 (Zion Kim)",
  handle: "USER_ZION",
  title: "Zion's robot and code portfolio",
  headlineKorean: "김지온이다. 잘 생겼다.",
  subheadline: "대회나 연습을 하고 만든 결과물을 보여주는 포트폴리오",
  primaryDirective: "대회나 연습을 하고 만든 결과물을 보여주는 포트폴리오",
  goal: "로봇 제작 능력과 코딩 실력 향상",
  quote: '"김지온이다. 잘 생겼다."',
  year: 2026,
  logoImg: zionLogoImg,
};

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    id: "journey-2026-cospace",
    year: "2026",
    title: "2026 RobotCup Korea Open Cospace U12",
    subtitle: "Autonomous Virtual & Real Robotics League",
    team: "CodeChaser",
    roles: ["Programming", "Problem Solving"],
    tags: ["Cospace U12", "C / C++", "Autonomous", "Sensor Calibration"],
    status: "completed",
    rank: "본선 5위 (조별 3연승)",
    strength: "최대한 열심히 경기에 임했고 조별 경기에서 3연승을 했다",
    weakness: "마지막에 문제가 있는 코드를 수정하지 못해서 아쉽게 경기에서 5위를 했다",
    review: "열심히 했지만 많이 아쉬웠다. 다음 대회에서는 디버깅 프로세스를 체계화하여 우승을 노린다."
  }
];

export const SKILL_ITEMS: SkillItem[] = [
  {
    id: "skill-c-coding",
    name: "C / C++ Coding",
    category: "code",
    iconType: "code",
    description: "로봇 펌웨어 및 제어 알고리즘 구현",
    proficiency: 90,
    tags: ["C / C++", "Embedded", "Memory Mgmt", "Pointers"],
    details: "마이크로컨트롤러 레지스터 제어 및 PID 제어 루프 최적화"
  },
  {
    id: "skill-sensor-control",
    name: "Sensor Control",
    category: "control",
    iconType: "sensor",
    description: "라인 센서 바닥 오차 감지 및 센서 캘리브레이션",
    proficiency: 88,
    tags: ["IR Sensor", "ADC Filter", "Sensor Calibration", "Line Sensing"],
    details: "아날로그 신호 필터링 및 바닥 반사율 오차 측정 알고리즘"
  },
  {
    id: "skill-motor-control",
    name: "Motor Control",
    category: "control",
    iconType: "motor",
    description: "좌우 모터 속도 정밀 제어 및 차동 구동",
    proficiency: 85,
    tags: ["PWM Control", "DC Motor", "Differential Drive", "Motor Driver"],
    details: "좌우 모터의 속도 편차를 정밀 제어하여 부드러운 주행 구현"
  },
  {
    id: "skill-pid-algorithm",
    name: "PID Algorithm",
    category: "control",
    iconType: "code",
    description: "PID 알고리즘 기반 정밀 제어 및 경로 추종",
    proficiency: 88,
    tags: ["PID Control", "Proportional", "Integral", "Derivative"],
    details: "오차값을 계산하여 P, I, D 게인 튜닝으로 흔들림 없는 라인 트레이싱 구현"
  },
  {
    id: "skill-block-coding",
    name: "Block Coding",
    category: "code",
    iconType: "block",
    description: "블록 코딩 기반 로직 설계 및 시각적 알고리즘 구현",
    proficiency: 95,
    tags: ["Block Coding", "Visual Logic", "State Machine"],
    details: "직관적인 블록 코딩으로 로봇의 기본 주행 로직 및 조건 분기 설계"
  },
  {
    id: "skill-problem-solving",
    name: "Problem Solving & Debugging",
    category: "logic",
    iconType: "problem",
    description: "실시간 경기장 디버깅 및 예외 상황 대처",
    proficiency: 92,
    tags: ["Live Debugging", "Troubleshooting", "Optimization"],
    details: "대회 현장 센서 오차 및 코드 오류를 신속히 분석하고 해결"
  }
];

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "prj-001",
    code: "PRJ-001 // ACTIVE",
    title: "Robot Line Tracing (라인트레이싱)",
    category: "Autonomous Ground Vehicle",
    descriptionEn: "Line-following robot that detects track error using line sensors and precisely controls left/right motor speeds with a PID algorithm.",
    descriptionKo: "라인트레이싱은 로봇이 라인을 따라가게 하는 프로그램이고 이 프로그램의 작동 방식은 라인 센서로 바닥 오차를 감지하여 좌우 모터 속도를 PID 알고리즘으로 정밀 제어하는 자율주행 시스템입니다.",
    image: robotLineTracingImg,
    tags: ["c-cpp", "motorcontrol", "sensorcontrol", "pid-control", "arduino"],
    status: "ACTIVE",
    featured: true,
    hardwareBOM: [
      { name: "Line Sensor Bar (적외선 라인 센서)", qty: 1, description: "바닥 라인 감지 및 오차 측정 센서" },
      { name: "Microcontroller Unit (MCU)", qty: 1, description: "센서 데이터 연산 및 모터 PID 제어 연산" },
      { name: "Dual Motor Driver (모터 드라이버)", qty: 1, description: "좌/우 DC 모터 속도 및 방향 제어" },
      { name: "DC Geared Motors & Wheels (DC 모터 및 바퀴)", qty: 2, description: "로봇 주행 및 차동 구동" },
      { name: "Battery Pack (배터리 전원)", qty: 1, description: "로봇 전원 공급" }
    ],
    algorithmSteps: [
      "1. 센서 감지: 라인 센서로 바닥의 흰색/검은색 반사율을 감지하여 중심 위치 오차(Error) 계산",
      "2. PID 제어 연산: 비례(P), 적분(I), 미분(D) 알고리즘으로 좌우 모터 보정값 산출",
      "3. 차동 모터 제어: 좌우 모터 속도를 각각 조절하여 라인을 벗어나지 않고 부드럽게 주행",
      "4. 실시간 피드백 루프: 빠른 주기로 센서 값을 다시 읽고 속도를 지속적으로 보정"
    ],
    codeSnippet: {
      language: "cpp",
      code: `// Zion's Line Tracing PID Control Algorithm
#include <Arduino.h>

const float Kp = 18.5;  // Proportional Gain (비례)
const float Ki = 0.02;  // Integral Gain (적분)
const float Kd = 25.0;  // Derivative Gain (미분)

int baseSpeed = 160;
int maxSpeed = 255;
float lastError = 0;
float integral = 0;

void loop() {
  // 1. 라인 센서로 바닥 오차 감지
  float error = readLineSensorError();
  
  // 2. PID 제어 연산
  integral += error;
  float derivative = error - lastError;
  float correction = (Kp * error) + (Ki * integral) + (Kd * derivative);
  lastError = error;
  
  // 3. 좌우 모터 속도 정밀 제어
  int leftMotorSpeed = constrain(baseSpeed + correction, 0, maxSpeed);
  int rightMotorSpeed = constrain(baseSpeed - correction, 0, maxSpeed);
  
  setMotors(leftMotorSpeed, rightMotorSpeed);
  delay(10);
}`
    }
  }
];

export const AWARDS_DATA: AwardItem[] = [];

export const DEFAULT_PORTFOLIO_INFO = {
  ...PORTFOLIO_INFO,
  sysInitBadge: "SYS.INIT // USER_ZION",
  coreArch: "Embedded MCU & Arduino",
  focusArea: "PID Control & Line Tracing",
  footerBrand: "© 2026 ZION'S PORTFOLIO",
  footerText: "Robot & Code Portfolio",
  privacyPolicy: "김지온의 로봇 및 코딩 포트폴리오의 모든 연구 및 프로젝트 자료는 교육, 대회 및 자율주행 연구 목적으로 공개되어 있습니다. 본 사이트는 불필요한 개인정보를 수집하지 않으며 연구 데이터의 무단 상업적 도용을 금합니다.",
  noAwardsTitle: "NO AWARDS YET",
  noAwardsDesc: "Database scanning... 0 records found.",
  noAwardsQuote: "최대한 열심히 경기에 임했고 조별 경기 3연승의 성과를 거두었습니다. 현재 다음 시즌 트로피 획득을 위해 알고리즘 고도화 훈련 중입니다.",
};

export const DEFAULT_SITE_CONFIG = {
  portfolioInfo: DEFAULT_PORTFOLIO_INFO,
  journeyItems: JOURNEY_ITEMS,
  skillItems: SKILL_ITEMS,
  awardsData: AWARDS_DATA,
};

export const DEFAULT_MUSIC_CONFIG: MusicConfig = {
  enabled: true,
  activeTrackId: 'track_preset_synth_1',
  defaultVolume: 0.45,
  loop: true,
  autoPlayPrompt: true,
  tracks: [
    {
      id: 'track_preset_synth_1',
      title: 'Neural Matrix Protocol (사이버 앰비언트 신스)',
      artist: 'Zion Robotics Audio Lab',
      url: 'synth:cyber-matrix',
      category: 'Cyberpunk Ambient',
      duration: 'Procedural Loop',
      isPreset: true,
      addedAt: '2026-08-28T00:00:00.000Z'
    },
    {
      id: 'track_preset_synth_2',
      title: 'Autonomous Pulse (로보틱스 로우파이 비트)',
      artist: 'Zion Engineering Core',
      url: 'synth:lofi-pulse',
      category: 'Lo-Fi Focus',
      duration: 'Procedural Loop',
      isPreset: true,
      addedAt: '2026-08-28T00:00:00.000Z'
    },
    {
      id: 'track_preset_audio_1',
      title: 'Futuristic Sci-Fi Laboratory Ambient',
      artist: 'Creative Commons Audio',
      url: 'https://actions.google.com/sounds/v1/science_fiction/sci_fi_ambient.ogg',
      category: 'Sci-Fi Sound',
      duration: '01:30',
      isPreset: true,
      addedAt: '2026-08-28T00:00:00.000Z'
    },
    {
      id: 'track_preset_audio_2',
      title: 'Deep Space Robotics Station Hum',
      artist: 'Free Sound Archive',
      url: 'https://actions.google.com/sounds/v1/science_fiction/lab_hum.ogg',
      category: 'Deep Drone',
      duration: '01:05',
      isPreset: true,
      addedAt: '2026-08-28T00:00:00.000Z'
    }
  ]
};


