/**
 * Technical Robotics Translation Helper
 * Communicates with the server-side Gemini API (/api/translate)
 * with robust client-side fallback dictionary for instant response.
 */

// Common robotics terminology dictionary for fallback and fast parsing
const ROBOTICS_DICT: Record<string, string> = {
  '라인트레이서': 'High-Speed Line Tracer Robot',
  '라인 트레이서': 'Line Tracing Autonomous Robot',
  '자율주행': 'Autonomous Navigation & Drive System',
  '자율 주행': 'Autonomous Navigation',
  '로봇': 'Robot',
  '축구 로봇': 'Omni-Directional Soccer Robot',
  '로봇 축구': 'RoboCup Soccer Robot',
  '로봇팔': 'Robotic Manipulator Arm',
  '로봇 팔': 'Robotic Manipulator Arm',
  '라이다': 'LiDAR SLAM Mapping System',
  '장애물 회피': 'Real-time Obstacle Avoidance',
  '초음파 센서': 'Ultrasonic Distance Sensors',
  '적외선 센서': 'Infrared (IR) Optical Sensors',
  '옴니휠': 'Omni-wheel Holonomic Drive',
  '모터 제어': 'Motor Speed & Direction Control',
  '모터 드라이버': 'Motor Driver Module',
  '엔코더': 'Optical Wheel Encoders',
  '피드백 제어': 'Closed-Loop PID Feedback Control',
  '카메라': 'Vision Camera System',
  '비전 인식': 'Computer Vision Object Recognition',
  '색상 인식': 'Color Segmentation & Tracking',
  '물체 분류': 'Object Sorting & Classification',
  '임베디드': 'Embedded Systems & Firmware',
  '아두이노': 'Arduino Microcontroller',
  '라즈베리파이': 'Raspberry Pi Single Board Computer',
};

export interface ProjectTranslationResult {
  translatedTitle: string;
  translatedCategory: string;
  translatedDescription: string;
  suggestedTags: string[];
}

export async function translateSingleText(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ singleText: text.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.translated && typeof data.translated === 'string') {
        return data.translated;
      }
    }
  } catch (err) {
    console.warn('Backend translation failed, falling back to local heuristic', err);
  }

  // Fallback heuristics
  let fallback = text;
  for (const [kr, en] of Object.entries(ROBOTICS_DICT)) {
    if (fallback.includes(kr)) {
      fallback = fallback.replace(new RegExp(kr, 'g'), en);
    }
  }
  return fallback || text;
}

export async function translateProjectDetails(params: {
  titleKo: string;
  descriptionKo: string;
  categoryKo?: string;
  tags?: string[];
}): Promise<ProjectTranslationResult> {
  const { titleKo, descriptionKo, categoryKo = '', tags = [] } = params;

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleKo,
        descriptionKo,
        categoryKo,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          translatedTitle: data.translatedTitle || titleKo,
          translatedCategory: data.translatedCategory || categoryKo || 'Autonomous Robotics',
          translatedDescription: data.translatedDescription || descriptionKo,
          suggestedTags: Array.isArray(data.suggestedTags) && data.suggestedTags.length > 0
            ? data.suggestedTags
            : tags,
        };
      }
    }
  } catch (err) {
    console.warn('Server translation request error:', err);
  }

  // Smart client-side fallback
  let enTitle = titleKo;
  let enDesc = descriptionKo;
  let enCat = categoryKo || 'Autonomous Robotics';

  for (const [kr, en] of Object.entries(ROBOTICS_DICT)) {
    if (enTitle.includes(kr)) {
      enTitle = enTitle.replace(new RegExp(kr, 'g'), en);
    }
    if (enDesc.includes(kr)) {
      enDesc = enDesc.replace(new RegExp(kr, 'g'), en);
    }
    if (enCat.includes(kr)) {
      enCat = enCat.replace(new RegExp(kr, 'g'), en);
    }
  }

  return {
    translatedTitle: enTitle.trim() || 'Custom Robotics Project',
    translatedCategory: enCat.trim() || 'Autonomous Robotics',
    translatedDescription: enDesc.trim() || 'Autonomous robotics system with precision sensor feedback and motor control.',
    suggestedTags: tags.length > 0 ? tags : ['robotics', 'c++', 'autonomous', 'embedded'],
  };
}
