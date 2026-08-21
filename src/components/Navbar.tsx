import React, { useState } from 'react';
import { Menu, X, Mail, Terminal } from 'lucide-react';
import zionLogoImg from '../assets/images/zion_robot_logo_1786709549858.jpg';

interface NavbarProps {
  onOpenConnect: () => void;
  onOpenTerminal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConnect,
  onOpenTerminal,
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

        {/* Right: Actions (Terminal, Connect) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
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
              <Mail size={14} /> Connect
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
