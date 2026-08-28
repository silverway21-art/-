/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
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
import { EditProjectModal } from './components/EditProjectModal';
import { InteractiveTerminalModal } from './components/InteractiveTerminalModal';
import { ConnectModal } from './components/ConnectModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminManagementModal } from './components/AdminManagementModal';
import { AdminPortalPage } from './components/AdminPortalPage';
import { PROJECT_ITEMS, DEFAULT_SITE_CONFIG } from './data/portfolioData';
import { ProjectItem, AdminUser, SiteConfig } from './types';
import { 
  apiCheckSession, 
  apiLogout, 
  apiGetProjects, 
  apiAddProject, 
  apiUpdateProject, 
  apiDeleteProject, 
  subscribeToProjects,
  apiGetSiteConfig,
  apiUpdateSiteConfig,
  subscribeToSiteConfig,
  getStoredUser,
  clearSession
} from './lib/api';
import { testFirebaseConnection } from './lib/firebase';

const STORAGE_KEY = 'zion_portfolio_projects_v3';
const SITE_CONFIG_STORAGE_KEY = 'zion_portfolio_site_config_v2';

export default function App() {
  // Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  // Projects state
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
      console.warn('Failed to load local projects cache', e);
    }
    return PROJECT_ITEMS;
  });

  // Full Site Configuration State (Hero, Directives, Journey, Skills, Awards, Footer)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.portfolioInfo) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load local site config cache', e);
    }
    return DEFAULT_SITE_CONFIG;
  });

  // Admin authentication state: Start as null to ensure admin login screen is always required on entry
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Modals state
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState<boolean>(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isConnectOpen, setIsConnectOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminManagementOpen, setIsAdminManagementOpen] = useState<boolean>(false);

  // Synchronize Browser History Navigation (SPA Routing)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Boot: Test connection and load projects & site config from Database
  useEffect(() => {
    testFirebaseConnection();

    // Load initial projects from server/Firestore
    apiGetProjects().then((items) => {
      if (items && items.length > 0) {
        setProjects(items);
      }
    });

    // Load initial site config from server/Firestore
    apiGetSiteConfig().then((cfg) => {
      if (cfg && cfg.portfolioInfo) {
        setSiteConfig(cfg);
      }
    });

    // Subscribe to real-time project updates from Firestore
    const unsubscribeProjects = subscribeToProjects((liveProjects) => {
      if (liveProjects && liveProjects.length > 0) {
        setProjects(liveProjects);
      }
    });

    // Subscribe to real-time site config updates from Firestore
    const unsubscribeConfig = subscribeToSiteConfig((liveConfig) => {
      if (liveConfig && liveConfig.portfolioInfo) {
        setSiteConfig(liveConfig);
      }
    });

    return () => {
      if (typeof unsubscribeProjects === 'function') unsubscribeProjects();
      if (typeof unsubscribeConfig === 'function') unsubscribeConfig();
    };
  }, []);

  // Save projects to local cache for instant reload
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to cache projects', e);
    }
  }, [projects]);

  // Save site config to local cache
  useEffect(() => {
    try {
      localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(siteConfig));
    } catch (e) {
      console.warn('Failed to cache site config', e);
    }
  }, [siteConfig]);

  // Project CRUD Operations (Immediate local state update + Server Firestore persistence)
  const handleAddProject = async (newProject: ProjectItem) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
    setIsAddProjectOpen(false);

    try {
      await apiAddProject(newProject);
    } catch (e) {
      console.error('Failed to sync new project with server:', e);
    }
  };

  const handleUpdateProject = async (updatedProject: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
    setIsEditProjectOpen(false);
    setEditingProject(null);

    try {
      await apiUpdateProject(updatedProject);
    } catch (e) {
      console.error('Failed to sync updated project with server:', e);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
    if (editingProject?.id === projectId) {
      setIsEditProjectOpen(false);
      setEditingProject(null);
    }

    try {
      await apiDeleteProject(projectId);
    } catch (e) {
      console.error('Failed to delete project from server:', e);
    }
  };

  // Site Configuration Update Handler
  const handleSaveSiteConfig = async (newConfig: Partial<SiteConfig>): Promise<boolean> => {
    let mergedConfig: SiteConfig = siteConfig;
    setSiteConfig((prev) => {
      mergedConfig = {
        ...prev,
        ...newConfig,
        portfolioInfo: {
          ...prev.portfolioInfo,
          ...(newConfig.portfolioInfo || {})
        },
        journeyItems: newConfig.journeyItems || prev.journeyItems,
        skillItems: newConfig.skillItems || prev.skillItems,
        awardsData: newConfig.awardsData || prev.awardsData
      };
      try {
        localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(mergedConfig));
        localStorage.setItem('zion_site_config_v2', JSON.stringify(mergedConfig));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      return mergedConfig;
    });

    try {
      const res = await apiUpdateSiteConfig(newConfig);
      return res.success;
    } catch (e) {
      console.error('Failed to update site config:', e);
      return false;
    }
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setIsAdminAuthOpen(false);
  };

  const handleLogout = useCallback(async () => {
    await apiLogout();
    setCurrentUser(null);
  }, []);

  // Automatically log out admin when navigating away from '/admin'
  useEffect(() => {
    if (currentPath !== '/admin' && currentUser) {
      handleLogout();
    }
  }, [currentPath, currentUser, handleLogout]);

  // Automatically clear session when tab is closed or window is navigated away
  useEffect(() => {
    const handleUnload = () => {
      clearSession();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setIsEditProjectOpen(true);
  };

  // ROUTE: /admin (Dedicated Admin Portal)
  if (currentPath === '/admin') {
    return (
      <>
        <AdminPortalPage
          currentUser={currentUser}
          projects={projects}
          siteConfig={siteConfig}
          onNavigateHome={() => navigateTo('/')}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onOpenAddProject={() => setIsAddProjectOpen(true)}
          onOpenEditProject={handleOpenEdit}
          onDeleteProject={handleDeleteProject}
          onSelectProjectPreview={(proj) => setSelectedProject(proj)}
          onSaveSiteConfig={handleSaveSiteConfig}
        />

        {/* Modals needed inside Admin Portal */}
        <AddProjectModal
          isOpen={isAddProjectOpen}
          onClose={() => setIsAddProjectOpen(false)}
          onAddProject={handleAddProject}
          nextProjectNumber={projects.length + 1}
        />

        <EditProjectModal
          isOpen={isEditProjectOpen}
          project={editingProject}
          onClose={() => {
            setIsEditProjectOpen(false);
            setEditingProject(null);
          }}
          onUpdateProject={handleUpdateProject}
        />

        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </>
    );
  }

  // ROUTE: / (Public Portfolio - viewable by everyone without login)
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Cybernetic Matrix Grid */}
      <div className="fixed inset-0 cyber-grid opacity-80 pointer-events-none z-0" />
      
      {/* Ambient Top Glow Spheres */}
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <Navbar 
          onOpenConnect={() => setIsConnectOpen(true)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenAdmin={() => navigateTo('/admin')}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section (Controlled via Admin CMS) */}
          <HeroSection portfolioInfo={siteConfig.portfolioInfo} />

          {/* Section Divider */}
          <CyberDivider />

          {/* Competition Journey Section (Controlled via Admin CMS) */}
          <JourneySection journeyItems={siteConfig.journeyItems} />

          {/* Section Divider */}
          <CyberDivider />

          {/* Technical Arsenal & Core Skills Section (Controlled via Admin CMS) */}
          <SkillsSection skillItems={siteConfig.skillItems} />

          {/* Section Divider */}
          <CyberDivider />

          {/* Project Showcase Section (Public View with Custom Images) */}
          <ProjectsSection 
            projects={projects}
            onSelectProject={(project) => setSelectedProject(project)}
          />

          {/* Section Divider */}
          <CyberDivider />

          {/* Certifications & Awards Section (Controlled via Admin CMS) */}
          <AwardsSection 
            awardsData={siteConfig.awardsData} 
            portfolioInfo={siteConfig.portfolioInfo}
          />
        </main>

        {/* Footer (Controlled via Admin CMS) */}
        <Footer 
          onOpenTerminal={() => setIsTerminalOpen(true)} 
          onOpenAdmin={() => navigateTo('/admin')}
          portfolioInfo={siteConfig.portfolioInfo}
        />
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

      <EditProjectModal
        isOpen={isEditProjectOpen}
        project={editingProject}
        onClose={() => {
          setIsEditProjectOpen(false);
          setEditingProject(null);
        }}
        onUpdateProject={handleUpdateProject}
      />

      <InteractiveTerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        projects={projects}
        currentUser={currentUser}
        onOpenAdminLogin={() => navigateTo('/admin')}
      />

      <ConnectModal 
        isOpen={isConnectOpen} 
        onClose={() => setIsConnectOpen(false)} 
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminManagementModal
        isOpen={isAdminManagementOpen}
        onClose={() => setIsAdminManagementOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
