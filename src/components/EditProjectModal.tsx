import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Upload, Sparkles, Languages, Check, Bot, Loader2, ArrowRight, Image as ImageIcon, Link as LinkIcon, RotateCcw, ChevronUp, ChevronDown, ListOrdered } from 'lucide-react';
import { ProjectItem } from '../types';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';
import robotLineTracingImg from '../assets/images/robot_line_tracing_1786709526477.jpg';
import { translateProjectDetails, translateSingleText } from '../utils/translation';


interface EditProjectModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  onClose: () => void;
  onUpdateProject: (updated: ProjectItem) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onUpdateProject,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'IN_DEVELOPMENT'>('ACTIVE');
  const [featured, setFeatured] = useState(false);
  const [selectedImg, setSelectedImg] = useState('');
  const [customImgUrl, setCustomImgUrl] = useState('');

  // Hardware BOM
  const [hardwareBOM, setHardwareBOM] = useState<{ name: string; qty: number; description: string }[]>([]);
  const [bomName, setBomName] = useState('');
  const [bomQty, setBomQty] = useState(1);
  const [bomDesc, setBomDesc] = useState('');

  // Code Snippet
  const [codeLang, setCodeLang] = useState('cpp');
  const [codeContent, setCodeContent] = useState('');

  // Algorithm Steps
  const [algoInput, setAlgoInput] = useState('');
  const [algorithmSteps, setAlgorithmSteps] = useState<string[]>([]);

  // AI Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const [singleTranslatingField, setSingleTranslatingField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setCategory(project.category || '');
      setDescriptionKo(project.descriptionKo || '');
      setDescriptionEn(project.descriptionEn || '');
      setTags(project.tags || []);
      setStatus(project.status || 'ACTIVE');
      setFeatured(project.featured || false);
      setSelectedImg(project.image || robotLineTracingImg);
      setHardwareBOM(project.hardwareBOM || []);
      setCodeLang(project.codeSnippet?.language || 'cpp');
      setCodeContent(project.codeSnippet?.code || '');
      setAlgorithmSteps(project.algorithmSteps || []);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddBOM = () => {
    if (bomName.trim()) {
      setHardwareBOM([...hardwareBOM, { name: bomName.trim(), qty: bomQty, description: bomDesc.trim() }]);
      setBomName('');
      setBomQty(1);
      setBomDesc('');
    }
  };

  const handleRemoveBOM = (index: number) => {
    setHardwareBOM(hardwareBOM.filter((_, i) => i !== index));
  };

  const handleAddAlgoStep = () => {
    if (algoInput.trim()) {
      setAlgorithmSteps([...algorithmSteps, algoInput.trim()]);
      setAlgoInput('');
    }
  };

  const handleUpdateAlgoStep = (index: number, value: string) => {
    const updated = [...algorithmSteps];
    updated[index] = value;
    setAlgorithmSteps(updated);
  };

  const handleMoveAlgoStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= algorithmSteps.length) return;
    const updated = [...algorithmSteps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImg(result);
        setCustomImgUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAutoTranslate = async () => {
    if (!title && !descriptionKo) return;
    setIsTranslating(true);
    try {
      const result = await translateProjectDetails({
        titleKo: title,
        categoryKo: category,
        descriptionKo: descriptionKo,
      });

      if (result.translatedTitle && !project.title) setTitle(result.translatedTitle);
      if (result.translatedCategory && !category) setCategory(result.translatedCategory);
      if (result.translatedDescription) setDescriptionEn(result.translatedDescription);

      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const merged = Array.from(new Set([...tags, ...result.suggestedTags]));
        setTags(merged);
      }

      setTranslateSuccess(true);
      setTimeout(() => setTranslateSuccess(false), 3000);
    } catch (e) {
      console.error('Translation failed', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSingleTranslate = async (field: 'desc') => {
    if (field === 'desc' && descriptionKo) {
      setSingleTranslatingField('desc');
      const translated = await translateSingleText(descriptionKo);
      setDescriptionEn(translated);
      setSingleTranslatingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedItem: ProjectItem = {
      ...project,
      title: title.trim(),
      category: category.trim() || 'Robotics System',
      descriptionKo: descriptionKo.trim() || title,
      descriptionEn: descriptionEn.trim() || descriptionKo || title,
      image: selectedImg || robotLineTracingImg,
      tags: tags.length > 0 ? tags : ['robotics', 'control'],
      status: status,
      featured: featured,
      hardwareBOM: hardwareBOM.length > 0 ? hardwareBOM : undefined,
      algorithmSteps: algorithmSteps.length > 0 ? algorithmSteps : undefined,
      codeSnippet: codeContent.trim()
        ? {
            language: codeLang,
            code: codeContent.trim(),
          }
        : undefined,
    };

    onUpdateProject(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#030712] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#050f24] border-b border-cyan-900/60 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <div>
              <h2 className="text-lg font-bold text-white font-mono-tech flex items-center gap-2">
                <span>EDIT PROJECT //</span>
                <span className="text-cyan-400">[{project.code}] {project.title}</span>
              </h2>
              <p className="text-xs text-slate-400">포트폴리오 프로젝트 정보 수정 (Firestore 실시간 반영)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-cyan-950/60 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 font-mono-tech text-sm">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-cyan-950 pb-2">
              <span>01. 기본 제원 및 카테고리 (Basic Specs)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">프로젝트 제목 (Title) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">카테고리 (Category) *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">개발 상태 (Status)</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-sm outline-none"
                >
                  <option value="ACTIVE">ACTIVE (완성 및 정상 구동)</option>
                  <option value="IN_DEVELOPMENT">IN_DEVELOPMENT (제작 및 튜닝 진행 중)</option>
                  <option value="ARCHIVED">ARCHIVED (보관/레퍼런스)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-500 bg-[#02050e] border-cyan-900"
                  />
                  <span>메인 추천 프로젝트로 강조 (Featured Badge)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Image Asset Modification */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center justify-between border-b border-cyan-950 pb-2">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} />
                <span>02. 프로젝트 이미지 / 사진 변경 (Visual Asset)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                파일 업로드 / 웹 URL 변경 / 프리셋 선택
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-[#02050e] border border-cyan-900/60">
              {/* Preview Thumbnail */}
              <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border-2 border-cyan-500/60 bg-black flex-shrink-0 flex items-center justify-center relative shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <img
                  src={selectedImg || robotLineTracingImg}
                  alt={title || "Project Preview"}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] text-cyan-300 font-mono-tech">
                  PREVIEW
                </span>
              </div>

              <div className="space-y-3 flex-1 w-full">
                {/* Actions & Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono-tech shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                  >
                    <Upload size={13} />
                    <span>내 컴퓨터 사진으로 변경</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImg(robotLineTracingImg)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    라인트레이서 기본
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImg(zionLogoImg)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    사이버 로고
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImg('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-mono-tech transition-colors"
                  >
                    AI 휴머노이드
                  </button>
                </div>

                {/* Direct URL Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-500" />
                    <input
                      type="url"
                      placeholder="또는 이미지 웹 URL 직접 입력 (https://...)"
                      value={selectedImg.startsWith('data:') ? '' : selectedImg}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedImg(e.target.value);
                        }
                      }}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#01040a] border border-cyan-900/80 focus:border-cyan-400 text-slate-200 text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                  {selectedImg !== (project?.image || robotLineTracingImg) && (
                    <button
                      type="button"
                      onClick={() => setSelectedImg(project?.image || robotLineTracingImg)}
                      className="p-1.5 rounded bg-cyan-950 text-slate-400 hover:text-white border border-cyan-900"
                      title="원래 이미지로 되돌리기"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-mono-tech">
                  새 이미지를 선택하면 저장 시 데이터베이스에 실시간 반영됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Descriptions & AI Translation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
              <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <span>03. 프로젝트 상세 설명 & AI 번역 (Descriptions)</span>
              </div>


              <button
                type="button"
                onClick={handleAiAutoTranslate}
                disabled={isTranslating || !descriptionKo}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded-lg text-cyan-300 text-xs transition-all disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-cyan-400" />
                    <span>Gemini 번역 중...</span>
                  </>
                ) : translateSuccess ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">번역 완료!</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-amber-400" />
                    <span>AI 자동 영문 번역</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300">한국어 설명 (Korean Description)</label>
                <button
                  type="button"
                  onClick={() => handleSingleTranslate('desc')}
                  disabled={!descriptionKo || singleTranslatingField === 'desc'}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Languages size={12} />
                  <span>영문으로 번역</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={descriptionKo}
                onChange={(e) => setDescriptionKo(e.target.value)}
                placeholder="로봇의 메커니즘, 센서 제어 알고리즘, 제작 목적을 입력하세요..."
                className="w-full bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg p-3 text-white text-sm outline-none resize-y"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                영문 설명 (English Technical Description) - <span className="text-slate-500">글로벌 포트폴리오용</span>
              </label>
              <textarea
                rows={3}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Autonomous control logic, PID gains, sensor fusion details in English..."
                className="w-full bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg p-3 text-white text-sm outline-none resize-y text-slate-200"
              />
            </div>
          </div>

          {/* Section 3: Technical Tags */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-cyan-950 pb-2">
              <span>03. 기술 태그 (Technical Tags)</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="태그 입력 (예: pid-tuning, ros2, arduino, slam) 후 엔터"
                className="flex-1 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs"
              >
                + 태그 추가
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-950/50 border border-cyan-800/80 rounded-md text-xs text-cyan-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Hardware BOM */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-cyan-950 pb-2">
              <span>04. 하드웨어 부품 명세서 (Hardware BOM)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                placeholder="부품명 (예: ESP32 NodeMCU)"
                className="sm:col-span-5 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
              <input
                type="number"
                min={1}
                value={bomQty}
                onChange={(e) => setBomQty(parseInt(e.target.value) || 1)}
                placeholder="수량"
                className="sm:col-span-2 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
              <input
                type="text"
                value={bomDesc}
                onChange={(e) => setBomDesc(e.target.value)}
                placeholder="스펙/역할 (예: 240MHz 듀얼코어 MCU)"
                className="sm:col-span-3 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddBOM}
                className="sm:col-span-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs flex items-center justify-center gap-1 py-2"
              >
                <Plus size={14} /> 추가
              </button>
            </div>

            {hardwareBOM.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {hardwareBOM.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#02050e] border border-cyan-950 rounded-lg text-xs">
                    <span className="text-white font-bold">{item.name}</span>
                    <span className="text-cyan-400">x{item.qty}</span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[200px]">{item.description}</span>
                    <button type="button" onClick={() => handleRemoveBOM(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Control Algorithm Execution Pipeline */}
          <div className="space-y-3 p-4 rounded-xl bg-[#040c1e] border border-cyan-900/70 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-950 pb-2">
              <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <ListOrdered size={14} className="text-cyan-400" />
                <span>05. 제어 알고리즘 실행 파이프라인 (// CONTROL ALGORITHM EXECUTION PIPELINE)</span>
              </div>
              <button
                type="button"
                onClick={handleResetDefaultAlgoSteps}
                className="text-[11px] text-cyan-400/80 hover:text-cyan-300 hover:underline flex items-center gap-1 font-mono-tech"
              >
                <RotateCcw size={11} />
                <span>표준 4단계 알고리즘으로 채우기</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-mono-tech leading-relaxed">
              프로젝트 상세 모달에 표시되는 알고리즘 실행 단계입니다. 각 단계 텍스트를 직접 수정하거나 순서를 바꿀 수 있습니다.
            </p>

            {/* Existing Steps List */}
            {algorithmSteps.length > 0 ? (
              <div className="space-y-2 pt-1">
                {algorithmSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-[#02050e] border border-cyan-950 hover:border-cyan-800 transition-colors"
                  >
                    <span className="text-xs font-bold font-mono-tech text-cyan-400 w-6 flex-shrink-0 text-center">
                      {idx + 1}.
                    </span>

                    <input
                      type="text"
                      value={step.replace(/^\d+\.\s*/, '')}
                      onChange={(e) => handleUpdateAlgoStep(idx, `${idx + 1}. ${e.target.value}`)}
                      placeholder={`단계 ${idx + 1} 내용 (예: 타겟 오차 계산 및 피드백 제어 연산)`}
                      className="flex-1 bg-[#01040a] border border-cyan-900/60 focus:border-cyan-400 rounded-md px-3 py-1.5 text-xs text-slate-200 outline-none font-mono-tech"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveAlgoStep(idx, -1)}
                        disabled={idx === 0}
                        title="위로 이동"
                        className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveAlgoStep(idx, 1)}
                        disabled={idx === algorithmSteps.length - 1}
                        title="아래로 이동"
                        className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlgoStep(idx)}
                        title="삭제"
                        className="p-1 rounded bg-rose-950/40 text-rose-400 hover:text-rose-200 hover:bg-rose-900/60"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-lg bg-[#02050e] border border-dashed border-cyan-950 text-xs text-slate-500 font-mono-tech">
                등록된 파이프라인 단계가 없습니다. 아래에서 단계를 추가해주세요.
              </div>
            )}

            {/* Add New Step Input */}
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
                placeholder="새 알고리즘 단계 입력 후 추가 (예: 실시간 모터 속도 피드백 및 급커브 감속)"
                className="flex-1 bg-[#02050e] border border-cyan-900 focus:border-cyan-400 rounded-lg px-3 py-2 text-white text-xs outline-none font-mono-tech"
              />
              <button
                type="button"
                onClick={handleAddAlgoStep}
                className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg text-xs flex items-center gap-1 font-mono-tech shrink-0 font-bold"
              >
                <Plus size={14} />
                <span>+ 단계 추가</span>
              </button>
            </div>
          </div>

          {/* Section 6: Code Snippet */}
          <div className="space-y-3">
            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-cyan-950 pb-2">
              <span>06. 핵심 알고리즘 소스코드 (Core Code Snippet)</span>
            </div>

            <div className="flex gap-2 mb-2">
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="bg-[#02050e] border border-cyan-900 text-cyan-300 rounded-lg px-3 py-1.5 text-xs outline-none"
              >
                <option value="cpp">C / C++ (Embedded)</option>
                <option value="python">Python (ROS2 / OpenCV)</option>
                <option value="arduino">Arduino IDE (.ino)</option>
                <option value="block">Visual Block / Pseudo</option>
              </select>
            </div>

            <textarea
              rows={5}
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="// 핵심 제어 함수 또는 센서 처리 알고리즘 코드"
              className="w-full bg-[#01040a] border border-cyan-950 focus:border-cyan-400 rounded-lg p-3 text-cyan-300 font-mono text-xs outline-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-cyan-950 flex items-center justify-end gap-3 sticky bottom-0 bg-[#030712] py-2 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs transition-colors"
            >
              취소 (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              <Check size={16} />
              <span>수정 사항 저장 (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
