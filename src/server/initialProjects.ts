import { ProjectItem } from '../types.js';

export const SERVER_INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "prj-001",
    code: "PRJ-001",
    title: "Robot Line Tracing (라인트레이싱)",
    category: "Autonomous Ground Vehicle",
    descriptionEn: "Line-following robot that detects track error using line sensors and precisely controls left/right motor speeds with a PID algorithm.",
    descriptionKo: "라인트레이싱은 로봇이 라인을 따라가게 하는 프로그램이고 이 프로그램의 작동 방식은 라인 센서로 바닥 오차를 감지하여 좌우 모터 속도를 PID 알고리즘으로 정밀 제어하는 자율주행 시스템입니다.",
    image: "/assets/images/robot_line_tracing_1786709526477.jpg",
    tags: ["PID Control", "C / C++", "Line Sensor", "Motor Control", "Arduino"],
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
  }
];
