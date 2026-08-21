import React, { useState } from 'react';
import { Bot, ArrowRight, ExternalLink, Sparkles, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onSelectProject,
}) => {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Safe featured project lookup
  const currentFeatured = projects[featuredIndex] || projects[0];
  const otherProjects = projects.filter((_, idx) => idx !== featuredIndex);

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % projects.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section id="projects" className="max-w-4xl mx-auto px-4 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Project Showcase
              <span className="text-xs font-mono-tech font-normal text-cyan-500 border border-cyan-900/60 px-2 py-0.5 rounded">
                ROBOT_HARDWARE ({projects.length})
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              직접 설계 및 프로그래밍한 지능형 로봇 하드웨어 & 자율주행 결과물
            </p>
          </div>
        </div>
      </div>

      {/* Featured Primary Card */}
      {currentFeatured && (
        <div className="relative bg-[#060e1b]/95 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 group mb-6">
          {/* Top Image Banner */}
          <div
            className="relative h-60 sm:h-80 w-full overflow-hidden bg-black cursor-pointer"
            onClick={() => onSelectProject(currentFeatured)}
          >
            <img
              src={currentFeatured.image}
              alt={currentFeatured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Subtle Cyber Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e1b] via-transparent to-black/40" />

            {/* Badge Top Left */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded bg-black/80 text-cyan-400 border border-cyan-500/80 font-mono-tech text-xs font-bold tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                {currentFeatured.code}
              </span>
            </div>

            {/* Interactive Hint */}
            <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono-tech text-xs backdrop-blur-md">
              <Sparkles size={12} className="text-cyan-400 animate-spin" />
              <span>클릭하여 상세 스펙 및 시뮬레이터 실행</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono-tech text-cyan-400 tracking-wider font-semibold block mb-0.5">
                  {currentFeatured.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {currentFeatured.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => onSelectProject(currentFeatured)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 hover:text-white rounded-lg text-xs font-mono-tech font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  <span>VIEW DETAILS</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {/* Dual Description (Korean & English) */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <p className="line-clamp-2 sm:line-clamp-3">{currentFeatured.descriptionKo}</p>
              {currentFeatured.descriptionEn && (
                <p className="text-slate-400 text-xs font-mono-tech">{currentFeatured.descriptionEn}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentFeatured.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-mono-tech rounded bg-cyan-950/60 text-cyan-400 border border-cyan-900/80"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Bottom Indicators & Navigation Arrows */}
            <div className="flex items-center justify-between pt-4 border-t border-cyan-950/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevFeatured}
                  className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white hover:bg-cyan-900 transition-colors"
                  title="Previous project"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1.5">
                  {projects.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                        featuredIndex === idx
                          ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                          : 'w-2 bg-cyan-950 hover:bg-cyan-800'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextFeatured}
                  className="p-1 rounded bg-cyan-950/60 text-cyan-400 hover:text-white hover:bg-cyan-900 transition-colors"
                  title="Next project"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={() => onSelectProject(currentFeatured)}
                className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 hover:text-white hover:bg-cyan-900 border border-cyan-800/80 transition-colors flex items-center gap-1.5 text-xs font-mono-tech"
              >
                <span>Interactive Model</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Other Projects */}
      {otherProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {otherProjects.map((proj) => {
            const originalIdx = projects.findIndex((p) => p.id === proj.id);
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="p-4 rounded-xl bg-[#050b16]/90 border border-cyan-900/50 hover:border-cyan-400/80 cursor-pointer transition-all hover:-translate-y-0.5 space-y-2 group relative"
              >
                <div className="flex items-center justify-between text-[10px] font-mono-tech text-cyan-400">
                  <span className="truncate">{proj.code}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeaturedIndex(originalIdx);
                      }}
                      className="text-[10px] text-cyan-500 hover:text-cyan-300 underline font-mono-tech"
                      title="Set as featured main card"
                    >
                      Feature
                    </button>
                    <Layers size={13} />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 line-clamp-1">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.descriptionKo}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] font-mono-tech text-cyan-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
