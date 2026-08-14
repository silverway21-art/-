/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CyberDivider } from './components/CyberDivider';
import { JourneySection } from './components/JourneySection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AwardsSection } from './components/AwardsSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AddProjectModal } from './components/AddProjectModal';
import { InteractiveTerminalModal } from './components/InteractiveTerminalModal';
import { ConnectModal } from './components/ConnectModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminManagementModal } from './components/AdminManagementModal';
import { PROJECT_ITEMS } from './data/portfolioData';
import { ProjectItem, AdminUser } from './types';
import { getCurrentSession, setActiveSession, ROOT_ADMIN_USER } from './data/adminAuth';

const STORAGE_KEY = 'zion_portfolio_projects_v1';

export default function App() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load projects from localStorage', e);
    }
    return PROJECT_ITEMS;
  });

  // Admin authentication state (Defaults to stored session or Root Super Admin)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const session = getCurrentSession();
    if (session.isAuthenticated && session.currentUser) {
      return session.currentUser;
    }
    // Default to ROOT_ADMIN_USER for the owner's active session
    setActiveSession(ROOT_ADMIN_USER);
    return ROOT_ADMIN_USER;
  });

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isConnectOpen, setIsConnectOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminManagementOpen, setIsAdminManagementOpen] = useState<boolean>(false);

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  const handleAddProject = (newProject: ProjectItem) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject); // automatically open detail view for the newly created project
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setActiveSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSession(null);
  };

  const isAdmin = !!currentUser;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Cybernetic Matrix Grid */}
      <div className="fixed inset-0 cyber-grid opacity-80 pointer-events-none z-0" />
      
      {/* Ambient Top Glow Spheres */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar with Admin Status */}
        <Navbar 
          currentUser={currentUser}
          onOpenConnect={() => setIsConnectOpen(true)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenAdminLogin={() => setIsAdminAuthOpen(true)}
          onOpenAdminManagement={() => setIsAdminManagementOpen(true)}
          onLogout={handleLogout}
        />

        {/* Hero Section */}
        <main className="flex-1">
          <HeroSection />

          {/* Section Divider */}
          <CyberDivider />

          {/* Competition Journey Section */}
          <JourneySection />

          {/* Section Divider */}
          <CyberDivider />

          {/* Technical Arsenal & Core Skills Section */}
          <SkillsSection />

          {/* Section Divider */}
          <CyberDivider />

          {/* Project Showcase Section */}
          <ProjectsSection 
            projects={projects}
            isAdmin={isAdmin}
            onSelectProject={(project) => setSelectedProject(project)}
            onOpenAddProject={() => setIsAddProjectOpen(true)}
            onRequireAdmin={() => setIsAdminAuthOpen(true)}
            onDeleteProject={handleDeleteProject}
          />

          {/* Section Divider */}
          <CyberDivider />

          {/* Certifications & Awards Section */}
          <AwardsSection />
        </main>

        {/* Footer */}
        <Footer onOpenTerminal={() => setIsTerminalOpen(true)} />
      </div>

      {/* Modals and Overlays */}
      <ProjectDetailModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={handleAddProject}
        nextProjectNumber={projects.length + 1}
      />

      <InteractiveTerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        projects={projects}
        currentUser={currentUser}
        onOpenAdminLogin={() => setIsAdminAuthOpen(true)}
      />

      <ConnectModal 
        isOpen={isConnectOpen} 
        onClose={() => setIsConnectOpen(false)} 
      />

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Privilege & User Management Modal */}
      <AdminManagementModal
        isOpen={isAdminManagementOpen}
        onClose={() => setIsAdminManagementOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
