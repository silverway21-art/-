import React, { useState } from 'react';
import { Menu, X, Mail, Terminal, Bot, Shield, ShieldCheck, LogOut, Users, Key } from 'lucide-react';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';
import { AdminUser } from '../types';

interface NavbarProps {
  currentUser: AdminUser | null;
  onOpenConnect: () => void;
  onOpenTerminal: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminManagement: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenConnect,
  onOpenTerminal,
  onOpenAdminLogin,
  onOpenAdminManagement,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Journey', href: '#journey' },
    { label: 'Skills', href: '#skills' },
    { label: 'Awards', href: '#awards' },
    { label: 'Portfolio', href: '#projects' },
    { label: 'Experience', href: '#journey' },
  ];

  const handleScroll = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAdmin = !!currentUser;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/90 backdrop-blur-md border-b border-cyan-950/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Badge */}
          <a href="#about" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center bg-black">
              <img 
                src={zionLogoImg} 
                alt="Zion Robot Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-cyber text-xs sm:text-sm tracking-wider font-bold text-white group-hover:text-cyan-400 transition-colors">
                ZION&apos;S ROBOT PORTFOLIO
              </span>
              <span className="text-[10px] font-mono-tech text-cyan-500 hidden sm:inline-block">
                SYS.VER // 2026.08
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleScroll(link.href)}
              className="text-xs lg:text-sm font-mono-tech text-slate-300 hover:text-cyan-400 transition-colors relative py-1 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions (Admin Controls, Terminal, Connect) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Admin Status & Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-[#041426] border border-cyan-500/70 px-2 py-1 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <button
                id="admin-management-btn"
                onClick={onOpenAdminManagement}
                className="flex items-center gap-1.5 text-xs font-mono-tech text-cyan-300 hover:text-white transition-colors"
                title="관리자 권한 관리 및 다른 사람에게 권한 부여"
              >
                <ShieldCheck size={14} className="text-emerald-400 animate-pulse" />
                <span className="hidden lg:inline text-[11px] font-bold text-white">
                  {currentUser.name}
                </span>
                <span className="text-[9px] font-mono-tech px-1.5 py-0.2 bg-cyan-900 text-cyan-300 rounded border border-cyan-700">
                  {currentUser.role}
                </span>
                <Users size={12} className="text-cyan-400 ml-0.5 hover:scale-110" />
              </button>

              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 border-l border-cyan-900 pl-1.5"
                title="관리자 로그아웃"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              id="admin-login-btn"
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-400 hover:text-white rounded-lg text-xs font-mono-tech transition-all"
              title="관리자 로그인 (프로젝트 추가/수정 권한)"
            >
              <Key size={13} />
              <span className="hidden sm:inline text-[11px]">Admin</span>
            </button>
          )}

          {/* Terminal button */}
          <button
            id="terminal-open-btn"
            onClick={onOpenTerminal}
            className="p-2 text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg text-xs font-mono-tech flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(6,182,212,0.15)]"
            title="Open Interactive Cyber Terminal"
          >
            <Terminal size={15} />
            <span className="hidden sm:inline text-[11px]">CLI</span>
          </button>

          {/* Connect / Message Button */}
          <button
            id="connect-modal-btn"
            onClick={onOpenConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 text-black font-semibold text-xs sm:text-sm rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_14px_rgba(34,211,238,0.5)] active:scale-95"
          >
            <Mail size={14} />
            <span>Connect</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050b14]/95 border-b border-cyan-900/80 px-4 py-4 space-y-3 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleScroll(link.href)}
                className="text-left px-3 py-2 text-sm font-mono-tech text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/50 rounded border border-transparent hover:border-cyan-900 transition-colors"
              >
                // {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Admin Section */}
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 flex items-center justify-between">
            {isAdmin ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-xs text-white font-bold">{currentUser.name} ({currentUser.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminManagement();
                    }}
                    className="px-2 py-1 bg-cyan-500 text-black text-[11px] font-bold rounded"
                  >
                    권한 관리
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-1 text-rose-400"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-mono-tech text-cyan-300 bg-cyan-900/50 rounded border border-cyan-700"
              >
                <Key size={14} />
                <span>관리자 로그인 (Owner & Admin Access)</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-cyan-950 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerminal();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono-tech text-cyan-400 bg-cyan-950/60 rounded border border-cyan-800/80"
            >
              <Terminal size={14} /> Terminal CLI
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConnect();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono-tech text-black bg-cyan-400 font-bold rounded shadow-[0_0_10px_rgba(34,211,238,0.4)]"
            >
              <Bot size={14} /> Send Message
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
