import React, { useState } from 'react';
import { 
  Code2, 
  Radio, 
  Settings, 
  Layers, 
  Lightbulb, 
  Eye, 
  Cpu, 
  Terminal,
  Hammer
} from 'lucide-react';
import { SKILL_ITEMS as DEFAULT_SKILL_ITEMS } from '../data/portfolioData';
import { SkillItem } from '../types';

interface SkillsSectionProps {
  skillItems?: SkillItem[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skillItems }) => {
  const allSkills = skillItems && skillItems.length > 0 ? skillItems : DEFAULT_SKILL_ITEMS;
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const filterChips = ['ALL', 'Code', 'Control', 'Logic'];

  const getSkillIcon = (iconType: SkillItem['iconType']) => {
    switch (iconType) {
      case 'code':
      case 'python':
        return <Code2 size={24} className="text-cyan-400" />;
      case 'sensor':
        return <Radio size={24} className="text-cyan-400" />;
      case 'motor':
        return <Settings size={24} className="text-cyan-400" />;
      case 'block':
        return <Layers size={24} className="text-cyan-400" />;
      case 'problem':
        return <Lightbulb size={24} className="text-cyan-400" />;
      case 'vision':
        return <Eye size={24} className="text-cyan-400" />;
      case 'ros':
        return <Cpu size={24} className="text-cyan-400" />;
      case 'mechatronics':
        return <Hammer size={24} className="text-cyan-400" />;
      default:
        return <Terminal size={24} className="text-cyan-400" />;
    }
  };

  const filteredSkills = allSkills.filter((skill) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'Code') return skill.category === 'code';
    if (activeFilter === 'Control') return skill.category === 'control';
    if (activeFilter === 'Logic') return skill.category === 'logic';
    return true;
  });


  return (
    <section id="skills" className="max-w-4xl mx-auto px-4 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Terminal size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Technical Arsenal
              <span className="text-xs font-mono-tech font-normal text-cyan-500 border border-cyan-900/60 px-2 py-0.5 rounded">
                CORE_SKILLS
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              로봇 하드웨어 제어 및 소프트웨어 알고리즘 스택
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech transition-all ${
                activeFilter === chip
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'bg-[#060e1b] text-slate-400 border border-cyan-900/60 hover:text-cyan-300 hover:border-cyan-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Skill Cards matching Image 1 and Image 3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            onClick={() => setSelectedSkill(skill)}
            className="group relative bg-[#050b16]/90 hover:bg-[#081426] border border-cyan-900/50 hover:border-cyan-400/80 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:-translate-y-0.5"
          >
            {/* Top Corner Glow Decor */}
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 group-hover:shadow-[0_0_6px_#22d3ee] transition-all" />

            {/* Icon Container */}
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-cyan-400/60 transition-transform duration-300">
              {getSkillIcon(skill.iconType)}
            </div>

            {/* Title */}
            <h3 className="font-mono-tech text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 mb-1 tracking-wide">
              {skill.name}
            </h3>

            {/* Sub-label */}
            <p className="text-[11px] text-slate-400 line-clamp-1 font-mono-tech">
              {skill.description}
            </p>

            {/* Hover bar indicator */}
            <div className="w-full bg-cyan-950/80 h-1 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-500 group-hover:shadow-[0_0_6px_#22d3ee]"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Skill Detail Popup / Drawer */}
      {selectedSkill && (
        <div className="mt-4 p-4 rounded-xl bg-[#061122] border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-tech text-xs font-bold text-cyan-400">// {selectedSkill.name}</span>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PRO_LEVEL: {selectedSkill.proficiency}%
              </span>
            </div>
            <p className="text-xs text-slate-300">{selectedSkill.details || selectedSkill.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedSkill.tags.map(t => (
                <span key={t} className="text-[10px] font-mono-tech text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900">
                  #{t}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSelectedSkill(null)}
            className="self-end sm:self-center px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-white border border-cyan-800 text-xs font-mono-tech rounded transition-colors"
          >
            Close [x]
          </button>
        </div>
      )}
    </section>
  );
};
