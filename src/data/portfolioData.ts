import { JourneyItem, SkillItem, ProjectItem, AwardItem } from '../types';
import robotLineTracingImg from '../assets/images/robot_line_tracing_1786709526477.jpg';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';

export const PORTFOLIO_INFO = {
  name: "김지온 (Zion Kim)",
  handle: "USER_ZION",
  title: "Zion's robot and code portfolio",
  headlineKorean: "김지온이다. 잘 생겼다.",
  subheadline: "대회나 연습을 하고 만든 결과물을 보여주는 포트폴리오",
  primaryDirective: "To engineer highly functional, elegantly designed synthetic intelligence systems and autonomous robotics platforms.",
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
    team: "Team: CodeChaser",
    roles: ["Programming", "Problem Solving"],
    tags: ["Cospace U12", "C++", "Strategy AI", "Sensor Calibration"],
    status: "completed",
    rank: "본선 5위 (조별 3연승)",
    strength: "최대한 열심히 경기에 임했고 조별 경기에서 3연승을 했다",
    weakness: "마지막에 문제가 있는 코드를 수정하지 못해서 아쉽게 경기에서 5위를 했다",
    review: "열심히 했지만 많이 아쉬웠다. 다음 대회에서는 디버깅 프로세스를 체계화하여 우승을 노린다."
  },
  {
    id: "journey-2025-national",
    year: "2025.11",
    title: "National Robotics Competition",
    subtitle: "Autonomous Navigation League",
    tags: ["ROS2", "Python", "LiDAR", "Path Planning"],
    status: "completed",
    strength: "ROS2 노드 간 통신을 최적화하여 맵 탐색 속도를 30% 향상시킴",
    weakness: "급격한 곡선 구간에서 라이다 노이즈 필터링 지연",
    review: "실제 환경과 시뮬레이션의 물리 오차를 줄이는 하드웨어 튜닝의 중요성을 배움"
  },
  {
    id: "journey-2024-hackathon",
    year: "2024.08",
    title: "Youth Code Hackathon",
    subtitle: "AI integration challenge",
    tags: ["AI Vision", "Python", "OpenCV"],
    status: "completed",
    strength: "객체 인식 모델을 경량화하여 온디바이스 엣지 보드에서 실시간 구동 성공",
    weakness: "조명 변화에 따른 이진화 임계값 수동 보정 한계",
    review: "알고리즘 예외 처리와 견고한 테스트 케이스 구축의 필요성을 체감함"
  }
];

export const SKILL_ITEMS: SkillItem[] = [
  {
    id: "skill-c-coding",
    name: "C / C++ Coding",
    category: "code",
    iconType: "code",
    description: "임베디드 펌웨어 및 고속 제어 알고리즘 구현",
    proficiency: 90,
    tags: ["Embedded C", "C++17", "Memory Mgmt", "Pointers"],
    details: "마이크로컨트롤러(Arduino, STM32) 레지스터 제어 및 PID 제어 루프 최적화"
  },
  {
    id: "skill-sensor-control",
    name: "Sensor Control",
    category: "control",
    iconType: "sensor",
    description: "IR 라인 센서, 초음파, IMU 자이로 센서 융합",
    proficiency: 88,
    tags: ["IR Array", "Ultrasonic", "ADC Filter", "Kalman"],
    details: "아날로그 신호 필터링, 이동 평균 필터 및 센서 캘리브레이션 알고리즘 구현"
  },
  {
    id: "skill-motor-control",
    name: "Motor Control",
    category: "control",
    iconType: "motor",
    description: "DC 모터 PWM 듀티 제어 및 엔코더 피드백",
    proficiency: 85,
    tags: ["PWM Control", "H-Bridge", "PID Loop", "Differential Drive"],
    details: "차동 구동(Differential Drive) 키네마틱스 및 실시간 가감속 프로파일 제어"
  },
  {
    id: "skill-block-coding",
    name: "Block Coding",
    category: "code",
    iconType: "block",
    description: "블록 코딩 기반 로직 설계 및 입문 제어",
    proficiency: 95,
    tags: ["Scratch", "App Inventor", "Micro:bit", "Visual Logic"],
    details: "복잡한 알고리즘을 직관적인 상태 머신(State Machine) 구조로 시각화 및 모델링"
  },
  {
    id: "skill-problem-solving",
    name: "Problem Solving",
    category: "logic",
    iconType: "problem",
    description: "대회 현장 실시간 디버깅 및 예외 케이스 처리",
    proficiency: 92,
    tags: ["Live Debugging", "Telemetry Log", "Edge Cases", "Strategy"],
    details: "경기장 조명, 마찰력 변화 등 하드웨어 돌발 상황에 맞춘 빠른 튜닝과 논리적 문제 해결"
  },
  {
    id: "skill-python",
    name: "Python",
    category: "code",
    iconType: "python",
    description: "데이터 시뮬레이션, 자동화 스크립트 및 AI 연동",
    proficiency: 88,
    tags: ["Python 3", "NumPy", "Matplotlib", "PySerial"],
    details: "로봇 센서 데이터 실시간 시각화, 로그 분석 및 시뮬레이션 환경 구축"
  },
  {
    id: "skill-ros2",
    name: "ROS 2 Core",
    category: "code",
    iconType: "ros",
    description: "노드 통신, 토픽 발행/구독 및 액션 서버",
    proficiency: 80,
    tags: ["ROS2 Humble", "RCLPY", "TF2", "Nav2"],
    details: "로봇 분산 시스템 아키텍처 및 자율주행 스택 연동"
  },
  {
    id: "skill-mechatronics",
    name: "Mechatronics & CAD",
    category: "hardware",
    iconType: "mechatronics",
    description: "로봇 섀시 기구 설계 및 전원 배선",
    proficiency: 84,
    tags: ["Fusion 360", "3D Printing", "Breadboard", "Li-Po Power"],
    details: "경량 아크릴 프레임 설계, 무게 중심 배분 및 노이즈 차폐 회로 구성"
  },
  {
    id: "skill-computer-vision",
    name: "Computer Vision",
    category: "code",
    iconType: "vision",
    description: "OpenCV 영상 처리 및 색상 마스킹 트래킹",
    proficiency: 82,
    tags: ["OpenCV", "HSV Threshold", "Contour Detection", "Camera Calibration"],
    details: "카메라 기반 실시간 라인 검출, 볼 트래킹 및 장애물 인지"
  }
];

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "prj-001",
    code: "PRJ-001 // ACTIVE",
    title: "Robot Line Tracing",
    category: "Autonomous Ground Vehicle",
    descriptionEn: "High-precision line-following robot utilizing infrared sensors and PID control for rapid course navigation.",
    descriptionKo: "라인트레이싱은 로봇이 라인을 따라가게 하는 프로그램이고 이 프로그램의 작동 방식은 라인 센서로 바닥 오차를 감지하여 좌우 모터 속도를 PID 알고리즘으로 정밀 제어하는 자율주행 시스템입니다.",
    image: robotLineTracingImg,
    tags: ["python", "motorcontrol", "sensorcontrol", "pid-control", "arduino"],
    status: "ACTIVE",
    featured: true,
    hardwareBOM: [
      { name: "5-Channel IR Line Sensor Bar", qty: 1, description: "바닥 검은색/흰색 반사율 측정 아날로그/디지털 센서" },
      { name: "Microcontroller Unit (Arduino/ESP32)", qty: 1, description: "16MHz~240MHz 제어 연산 및 인터럽트 처리" },
      { name: "L298N / TB6612FNG Dual Motor Driver", qty: 1, description: "좌/우 DC 기어드 모터 PWM 전압 제어" },
      { name: "High-Torque TT DC Motors & Wheels", qty: 2, description: "고무 그립 타이어 및 1:48 감속 기어박스" },
      { name: "Li-Ion 7.4V Battery Pack", qty: 1, description: "안정적인 모터 및 로직 분리 전원 공급" },
      { name: "Front Caster Wheel & Acrylic Chassis", qty: 1, description: "초경량 3점 지지 차체 프레임" }
    ],
    algorithmSteps: [
      "1. 센서 캘리브레이션: 트랙 배경(흰색)과 라인(검은색)의 임계값 측정",
      "2. 오차값 계산: 5개 적외선 센서의 가중치 평균으로 라인 중심 이탈도(Error) 산출 (-4 ~ +4)",
      "3. PID 제어 연산: P(비례 오차) + I(누적 오차) + D(변화율 오차) 계산",
      "4. 차동 구동 출력: 기준 속도(Base Speed)에 보정값(PID Output)을 가감하여 Left/Right 모터 PWM 인가",
      "5. 루프 주기 유지: 100Hz(10ms) 고속 샘플링으로 부드러운 코너링 유지"
    ],
    codeSnippet: {
      language: "cpp",
      code: `// Zion's High-Precision PID Line Tracing Algorithm
#include <Arduino.h>

const float Kp = 18.5;  // Proportional Gain
const float Ki = 0.02;  // Integral Gain
const float Kd = 25.0;  // Derivative Gain

int baseSpeed = 160;
int maxSpeed = 255;
float lastError = 0;
float integral = 0;

void loop() {
  // 1. Read 5-channel line sensors (Weighted Sum)
  int s0 = digitalRead(PIN_S0);
  int s1 = digitalRead(PIN_S1);
  int s2 = digitalRead(PIN_S2); // Center
  int s3 = digitalRead(PIN_S3);
  int s4 = digitalRead(PIN_S4);
  
  float error = (-2*s0) + (-1*s1) + (0*s2) + (1*s3) + (2*s4);
  
  // 2. PID Calculations
  integral += error;
  float derivative = error - lastError;
  float correction = (Kp * error) + (Ki * integral) + (Kd * derivative);
  lastError = error;
  
  // 3. Compute differential motor velocities
  int leftMotorSpeed = constrain(baseSpeed + correction, 0, maxSpeed);
  int rightMotorSpeed = constrain(baseSpeed - correction, 0, maxSpeed);
  
  setMotors(leftMotorSpeed, rightMotorSpeed);
  delay(10);
}`
    }
  },
  {
    id: "prj-002",
    code: "PRJ-002 // DEVELOPMENT",
    title: "Cospace U12 Strategy Bot",
    category: "Competitive Robotics",
    descriptionEn: "Virtual simulator game strategy bot with automated object collection and dynamic path planning.",
    descriptionKo: "로보컵 코스페이스 U12 대회용 전략 알고리즘. 경기장 내 점수 오브젝트를 자동 수집하고 장애물을 회피하는 실시간 상태 머신.",
    image: zionLogoImg,
    tags: ["c++", "state-machine", "cospace", "strategy"],
    status: "IN_DEVELOPMENT",
    featured: false
  },
  {
    id: "prj-003",
    code: "PRJ-003 // CONCEPT",
    title: "ROS2 Vision Autonomous Rover",
    category: "Next Generation Platform",
    descriptionEn: "Edge AI camera robot with SLAM mapping and AprilTag marker tracking.",
    descriptionKo: "카메라 기반 에이프릴태그 인식과 2D 라이다 SLAM 매핑을 결합한 지능형 자율주행 로버.",
    image: zionLogoImg,
    tags: ["ros2", "opencv", "slam", "python"],
    status: "IN_DEVELOPMENT",
    featured: false
  }
];

export const AWARDS_DATA: AwardItem[] = [
  {
    id: "award-target-2026",
    title: "2026 RobotCup Korea Open Champion Target",
    date: "2026.10",
    organization: "Korea Robotics League",
    category: "Cospace / Autonomous",
    status: "TARGET_GOAL"
  }
];
