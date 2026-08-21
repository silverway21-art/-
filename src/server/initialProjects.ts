import { ProjectItem } from '../types.js';

export const SERVER_INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-line-tracer-2026",
    code: "PRJ-001",
    title: "High-Speed Autonomous Line Tracer",
    category: "Autonomous Robotics & Embedded Control",
    descriptionEn: "High-speed line tracing robot equipped with 5-channel IR optical array and PID feedback control for smooth trajectory tracking.",
    descriptionKo: "5채널 적외선 반사형 센서 어레이와 정밀 PID 제어 알고리즘을 결합하여 고속 주행 시에도 이탈 없이 코스를 완주하는 자율주행 로봇입니다.",
    image: "/assets/images/robot_line_tracing_1786709526477.jpg",
    tags: ["PID Control", "Embedded C", "IR Sensor", "TB6612FNG", "RoboCup"],
    status: "ACTIVE",
    featured: true,
    hardwareBOM: [
      { name: "MCU Board", qty: 1, description: "ESP32 NodeMCU / STM32F401 (Dual Core 240MHz)" },
      { name: "IR Optical Sensor Array", qty: 1, description: "5-Channel High Sensitivity Phototransistor Array" },
      { name: "Motor Driver", qty: 1, description: "TB6612FNG Dual H-Bridge (1.2A Constant Current)" },
      { name: "Coreless DC Geared Motors", qty: 2, description: "12V 1000RPM High Torque Micro Geared Motors" },
      { name: "Li-Po Battery Pack", qty: 1, description: "7.4V 2S 850mAh 45C High Discharge Battery" }
    ],
    algorithmSteps: [
      "1. 5채널 IR 센서의 아날로그 전압값(0~1023)을 ADC로 고속 샘플링",
      "2. 캘리브레이션 맵핑을 통해 라인의 중심 위치 오차 Error = Σ(wi * sensor_val) 계산",
      "3. PID 제어 방정식(P + I + D)을 통해 좌/우 모터의 차동 속도(PWM) 보정값 도출",
      "4. 직각 및 급커브 구간 감지 시 브레이크 펄스 및 가속 제어 알고리즘 개입"
    ],
    codeSnippet: {
      language: "cpp",
      code: `// Zion's High-Speed Line Tracer PID Loop
#define Kp 18.5f
#define Ki 0.02f
#define Kd 25.0f

int lastError = 0;
int integral = 0;

void loop() {
  int error = calculateSensorError(); // Center = 0
  integral += error;
  int derivative = error - lastError;
  
  int correction = (int)(Kp * error + Ki * integral + Kd * derivative);
  
  int leftSpeed = BASE_SPEED + correction;
  int rightSpeed = BASE_SPEED - correction;
  
  setMotorPWM(constrain(leftSpeed, 0, 255), constrain(rightSpeed, 0, 255));
  lastError = error;
  delayMicroseconds(1000); // 1kHz Control Frequency
}`
    }
  },
  {
    id: "proj-cospace-strategy-2026",
    code: "PRJ-002",
    title: "CoSpace U12 Autonomous Strategy Engine",
    category: "Virtual & Real Hybrid Robotics League",
    descriptionEn: "State machine and real-time object collection algorithm for RoboCup Korea Open CoSpace autonomous competition.",
    descriptionKo: "가상 및 실제 경기장 환경에서 다중 센서 데이터를 융합하여 최단 시간에 미션을 완료하는 전략 알고리즘입니다.",
    image: "/assets/images/zion_robot_logo_1786709549858.jpg",
    tags: ["State Machine", "C++", "Color Detection", "Pathfinding"],
    status: "ACTIVE",
    featured: false,
    hardwareBOM: [
      { name: "CoSpace Standard Platform", qty: 1, description: "차동 구동형 가상/실제 공용 로봇 섀시" },
      { name: "RGB Color Sensor", qty: 2, description: "경기장 바닥 보석(타겟) 식별용 컬러 센서" },
      { name: "Ultrasonic Distance Sensor", qty: 3, description: "전방 및 좌우 벽면 충돌 방지용 초음파" }
    ],
    algorithmSteps: [
      "1. 경기장 내 실시간 색상 데이터 분석을 통한 목표물 우선순위 지정",
      "2. 벽면 회피 상태(State-Avoidance) 및 미션 구역 탐색 상태 간 FSM 천이",
      "3. 3연승 달성을 견인한 코너 구역 탈출 고속 루틴 실행"
    ]
  },
  {
    id: "proj-esp32-telemetry-2025",
    code: "PRJ-003",
    title: "ESP32 Real-Time Telemetry & Controller",
    category: "IoT & Wireless Communication",
    descriptionEn: "Low-latency wireless telemetry node transmitting robot battery, IMU data, and motor RPM to ground control station.",
    descriptionKo: "로봇의 실시간 배터리 전압, IMU 자이로 데이터, 모터 RPM을 초저지연 무선으로 대시보드에 전송하는 텔레메트리 시스템입니다.",
    image: "/assets/images/robot_line_tracing_1786709526477.jpg",
    tags: ["ESP-NOW", "WebSockets", "Telemetry", "FreeRTOS"],
    status: "IN_DEVELOPMENT",
    featured: false
  }
];
