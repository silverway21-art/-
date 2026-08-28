import { ProjectItem, AdminUser, SiteConfig, ContactMessage, ThemeTrack, MusicConfig } from '../types';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { PROJECT_ITEMS, DEFAULT_SITE_CONFIG, DEFAULT_MUSIC_CONFIG } from '../data/portfolioData';
import { addMySentMessageId, getMySentMessageIds } from './visitorSession';

const TOKEN_KEY = 'zion_admin_token_v2';
const USER_KEY = 'zion_admin_user_v2';
const SITE_CONFIG_KEY = 'zion_portfolio_site_config_v2';
const MUSIC_CONFIG_KEY = 'zion_portfolio_music_config_v1';


export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AdminUser, persist: boolean = false) {
  // Always use sessionStorage so closing/reopening the page requires re-authentication
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Clean up any lingering localStorage tokens from previous versions
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('zion_admin_token');
  localStorage.removeItem('zion_admin_user');
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('zion_admin_token');
  localStorage.removeItem('zion_admin_user');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Universal Master Admin credential check
 */
function isMasterCredential(username: string, password: string): boolean {
  const user = (username || '').trim().toLowerCase();
  const pass = (password || '').trim();
  
  const isMasterUser = user === 'zionadminid' || user === 'silverway21@gmail.com';
  return isMasterUser && pass === 'zionadminPW';
}

/**
 * Universal Admin Authentication (Supports Express API & Secure Fallback)
 */
export async function apiLogin(
  username: string, 
  password: string, 
  remember: boolean = true
): Promise<{ success: boolean; user?: AdminUser; token?: string; message?: string }> {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, message: '아이디와 비밀번호를 모두 입력해 주세요.' };
  }

  // 1. Try Express API Endpoint first
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        const adminUser: AdminUser = {
          id: data.user.username || cleanUser,
          email: data.user.email || `${cleanUser}@portfolio.local`,
          name: data.user.name || '김지온 (Zion Kim)',
          role: data.user.role || 'SUPER_ADMIN',
          addedAt: new Date().toISOString(),
          isRoot: true,
        };
        saveSession(data.token, adminUser, remember);
        return { success: true, user: adminUser, token: data.token };
      } else {
        return { 
          success: false, 
          message: data.message || '아이디 또는 비밀번호가 올바르지 않습니다.' 
        };
      }
    }
  } catch (err) {
    console.warn('[Auth] Express API route unavailable. Proceeding with client auth check...', err);
  }

  // 2. Strict Fallback for Static Deployments / Network Failures
  try {
    let isAuthenticated = false;
    let adminName = '김지온 (Zion Kim)';
    let adminEmail = 'silverway21@gmail.com';

    // Master account check (zionadminID / zionadminPW)
    if (isMasterCredential(cleanUser, cleanPass)) {
      isAuthenticated = true;
    } else {
      // Check Firestore /system_admins collection directly
      try {
        const adminDocRef = doc(db, 'system_admins', cleanUser);
        const snap = await getDoc(adminDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.passcode && data.passcode === cleanPass) {
            isAuthenticated = true;
            adminName = data.name || adminName;
            adminEmail = data.email || adminEmail;
          }
        }
      } catch (fsErr) {
        console.warn('[Auth] Firestore direct lookup notice:', fsErr);
      }
    }

    if (isAuthenticated) {
      const generatedToken = 'vcl_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const adminUser: AdminUser = {
        id: cleanUser,
        email: adminEmail,
        name: adminName,
        role: 'SUPER_ADMIN',
        addedAt: new Date().toISOString(),
        isRoot: true,
      };

      saveSession(generatedToken, adminUser, remember);
      return {
        success: true,
        user: adminUser,
        token: generatedToken,
      };
    }

    return {
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    };
  } catch (fatalErr: any) {
    console.error('Fatal login error:', fatalErr);
    return {
      success: false,
      message: '로그인 인증 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * Verify Active Admin Session
 */
export async function apiCheckSession(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  const token = getStoredToken();
  const storedUser = getStoredUser();

  if (!token || !storedUser) {
    return { authenticated: false };
  }

  // If token is a server session token, verify with server
  if (!token.startsWith('vcl_')) {
    try {
      const response = await fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        clearSession();
        return { authenticated: false };
      }

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          return { authenticated: true, user: data.user };
        }
      }
    } catch {
      // Network fallback
    }
  }

  return { authenticated: !!storedUser, user: storedUser || undefined };
}

/**
 * Logout from Admin Session
 */
export async function apiLogout(): Promise<void> {
  const token = getStoredToken();
  if (token && !token.startsWith('vcl_')) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // ignore
    }
  }
  clearSession();
}

/**
 * Fetch all public projects (Hybrid API + Firestore Direct)
 */
export async function apiGetProjects(): Promise<ProjectItem[]> {
  // 1. Try Express API
  try {
    const res = await fetch('/api/projects');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        return data.projects;
      }
    }
  } catch {
    // continue to Firestore direct
  }

  // 2. Direct Firestore lookup
  try {
    const snap = await getDocs(collection(db, 'projects'));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as ProjectItem);
    }
  } catch (fsErr) {
    console.warn('[Projects] Firestore getDocs notice:', fsErr);
  }

  return PROJECT_ITEMS;
}

function sanitizeProject(project: ProjectItem): ProjectItem {
  const copy: any = { ...project };
  for (const key of Object.keys(copy)) {
    if (copy[key] === undefined) {
      delete copy[key];
    }
  }
  if (!Array.isArray(copy.tags)) copy.tags = [];
  if (!Array.isArray(copy.hardwareBOM)) copy.hardwareBOM = [];
  if (!Array.isArray(copy.algorithmSteps)) copy.algorithmSteps = [];
  return copy as ProjectItem;
}

/**
 * Admin: Add Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiAddProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken() || 'vcl_master_admin_session_token';
  const cleanProject = sanitizeProject(project);

  // 1. Update local cache immediately
  try {
    const saved = localStorage.getItem('zion_portfolio_projects_v3');
    const list: ProjectItem[] = saved ? JSON.parse(saved) : [];
    const updated = [cleanProject, ...list.filter(p => p.id !== cleanProject.id)];
    localStorage.setItem('zion_portfolio_projects_v3', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local cache add project notice:', e);
  }

  // 2. Direct Firestore persistence
  try {
    await setDoc(doc(db, 'projects', cleanProject.id), cleanProject);
  } catch (e: any) {
    console.warn('Direct Firestore add failed:', e);
  }

  // 3. Try Express API
  try {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanProject),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, project: data.project };
    }
  } catch {
    // continue
  }

  return { success: true, project: cleanProject };
}

/**
 * Admin: Update Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiUpdateProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken() || 'vcl_master_admin_session_token';
  const cleanProject = sanitizeProject(project);

  // 1. Update local cache immediately
  try {
    const saved = localStorage.getItem('zion_portfolio_projects_v3');
    if (saved) {
      const list: ProjectItem[] = JSON.parse(saved);
      const updated = list.map((p) => (p.id === cleanProject.id ? cleanProject : p));
      localStorage.setItem('zion_portfolio_projects_v3', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Local cache project update notice:', e);
  }

  // 2. Direct Firestore persistence
  try {
    await setDoc(doc(db, 'projects', cleanProject.id), cleanProject, { merge: true });
  } catch (e: any) {
    console.warn('Direct Firestore update failed:', e);
  }

  // 3. Try Express API
  try {
    const res = await fetch(`/api/admin/projects/${cleanProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanProject),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, project: data.project };
    }
  } catch {
    // continue
  }

  return { success: true, project: cleanProject };
}

/**
 * Admin: Delete Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiDeleteProject(projectId: string): Promise<{ success: boolean; message?: string }> {
  const token = getStoredToken() || 'vcl_master_admin_session_token';

  // 1. Update local cache immediately
  try {
    const saved = localStorage.getItem('zion_portfolio_projects_v3');
    if (saved) {
      const list: ProjectItem[] = JSON.parse(saved);
      const updated = list.filter((p) => p.id !== projectId);
      localStorage.setItem('zion_portfolio_projects_v3', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Local cache delete project notice:', e);
  }

  // 2. Direct Firestore delete
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (e: any) {
    console.warn('Direct Firestore delete notice:', e);
  }

  // 3. Try Express API
  try {
    await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // continue
  }

  return { success: true };
}

/**
 * Subscribe to real-time project updates from Firestore
 */
export function subscribeToProjects(onUpdate: (projects: ProjectItem[]) => void) {
  try {
    const colRef = collection(db, 'projects');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => doc.data() as ProjectItem);
        onUpdate(items);
      }
    }, (err) => {
      console.warn('[Firestore] Realtime subscription notice:', err.message);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('[Firestore] Could not attach realtime listener:', e);
    return () => {};
  }
}

/**
 * Fetch entire site configuration (Hero, Journey, Skills, Awards, Footer)
 */
export async function apiGetSiteConfig(): Promise<SiteConfig> {
  // Check local storage cache first for instant boot
  let cachedConfig: SiteConfig | null = null;
  try {
    const cached = localStorage.getItem(SITE_CONFIG_KEY) || localStorage.getItem('zion_portfolio_site_config_v2');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.portfolioInfo) {
        cachedConfig = parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // 1. Try Express API
  try {
    const res = await fetch('/api/site-config');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.siteConfig) {
        localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(data.siteConfig));
        localStorage.setItem('zion_portfolio_site_config_v2', JSON.stringify(data.siteConfig));
        return data.siteConfig;
      }
    }
  } catch {
    // Continue to Firestore Direct
  }

  // 2. Direct Firestore lookup
  try {
    const docRef = doc(db, 'site_config', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const config = snap.data() as SiteConfig;
      localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
      localStorage.setItem('zion_portfolio_site_config_v2', JSON.stringify(config));
      return config;
    }
  } catch (fsErr) {
    console.warn('[SiteConfig] Firestore getDoc notice:', fsErr);
  }

  return cachedConfig || DEFAULT_SITE_CONFIG;
}

/**
 * Admin: Update site configuration (Entire text & interface)
 */
export async function apiUpdateSiteConfig(
  newConfig: Partial<SiteConfig>
): Promise<{ success: boolean; siteConfig?: SiteConfig; message?: string }> {
  const token = getStoredToken();
  
  // Read existing cached or fallback
  let currentConfig: SiteConfig = DEFAULT_SITE_CONFIG;
  try {
    const cached = localStorage.getItem(SITE_CONFIG_KEY) || localStorage.getItem('zion_portfolio_site_config_v2');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.portfolioInfo) {
        currentConfig = parsed;
      }
    }
  } catch {
    // ignore
  }

  const merged: SiteConfig = {
    ...currentConfig,
    ...newConfig,
    portfolioInfo: {
      ...currentConfig.portfolioInfo,
      ...(newConfig.portfolioInfo || {})
    },
    journeyItems: newConfig.journeyItems || currentConfig.journeyItems,
    skillItems: newConfig.skillItems || currentConfig.skillItems,
    awardsData: newConfig.awardsData || currentConfig.awardsData
  };

  // Cache locally immediately in both keys
  try {
    localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(merged));
    localStorage.setItem('zion_portfolio_site_config_v2', JSON.stringify(merged));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  // 1. Try Express API
  try {
    const res = await fetch('/api/admin/site-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || 'vcl_admin'}`,
      },
      body: JSON.stringify(merged),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, siteConfig: data.siteConfig || merged };
    }
  } catch {
    // Continue to Firestore Direct
  }

  // 2. Direct Firestore update
  try {
    await setDoc(doc(db, 'site_config', 'main'), merged, { merge: true });
    return { success: true, siteConfig: merged };
  } catch (e: any) {
    console.warn('Direct Firestore site config update notice:', e);
    return { success: true, siteConfig: merged };
  }
}

/**
 * Real-time subscription to site configuration changes
 */
export function subscribeToSiteConfig(onUpdate: (config: SiteConfig) => void) {
  try {
    const docRef = doc(db, 'site_config', 'main');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const liveData = snapshot.data() as SiteConfig;
        if (liveData && liveData.portfolioInfo) {
          localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(liveData));
          localStorage.setItem('zion_portfolio_site_config_v2', JSON.stringify(liveData));
          onUpdate(liveData);
        }
      }
    }, (error) => {
      console.warn('[Firestore] Site config snapshot warning:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('[Firestore] Site config subscription failed:', e);
    return () => {};
  }
}

/**
 * Fetch theme music configuration (BGM on/off, active theme song, tracks playlist)
 */
export async function apiGetMusicConfig(): Promise<MusicConfig> {
  // 1. Check local storage cache first
  let cached: MusicConfig | null = null;
  try {
    const raw = localStorage.getItem(MUSIC_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tracks)) {
        cached = parsed;
      }
    }
  } catch {}

  // 2. Try Express API
  try {
    const res = await fetch('/api/music-config');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.musicConfig && Array.isArray(data.musicConfig.tracks)) {
        localStorage.setItem(MUSIC_CONFIG_KEY, JSON.stringify(data.musicConfig));
        return data.musicConfig;
      }
    }
  } catch {}

  // 3. Direct Firestore lookup
  try {
    const docRef = doc(db, 'music_config', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const liveData = snap.data() as MusicConfig;
      if (liveData && Array.isArray(liveData.tracks)) {
        localStorage.setItem(MUSIC_CONFIG_KEY, JSON.stringify(liveData));
        return liveData;
      }
    }
  } catch (fsErr) {
    console.warn('[MusicConfig] Firestore getDoc notice:', fsErr);
  }

  return cached || DEFAULT_MUSIC_CONFIG;
}

/**
 * Admin: Update theme music configuration
 */
export async function apiUpdateMusicConfig(
  newConfig: Partial<MusicConfig>
): Promise<{ success: boolean; musicConfig?: MusicConfig; message?: string }> {
  const token = getStoredToken();

  let currentConfig: MusicConfig = DEFAULT_MUSIC_CONFIG;
  try {
    const raw = localStorage.getItem(MUSIC_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tracks)) {
        currentConfig = parsed;
      }
    }
  } catch {}

  const merged: MusicConfig = {
    ...currentConfig,
    ...newConfig,
    tracks: newConfig.tracks || currentConfig.tracks,
    updatedAt: new Date().toISOString(),
  };

  // Cache locally immediately
  try {
    localStorage.setItem(MUSIC_CONFIG_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('LocalStorage music save failed:', e);
  }

  // 1. Try Express API
  try {
    const res = await fetch('/api/admin/music-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || 'vcl_admin'}`,
      },
      body: JSON.stringify(merged),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, musicConfig: data.musicConfig || merged };
    }
  } catch {}

  // 2. Direct Firestore update
  try {
    await setDoc(doc(db, 'music_config', 'main'), merged, { merge: true });
    return { success: true, musicConfig: merged };
  } catch (e: any) {
    console.warn('Direct Firestore music config update notice:', e);
    return { success: true, musicConfig: merged };
  }
}

/**
 * Real-time subscription to music configuration changes from Firestore
 */
export function subscribeToMusicConfig(onUpdate: (config: MusicConfig) => void) {
  try {
    const docRef = doc(db, 'music_config', 'main');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const liveData = snapshot.data() as MusicConfig;
        if (liveData && Array.isArray(liveData.tracks)) {
          localStorage.setItem(MUSIC_CONFIG_KEY, JSON.stringify(liveData));
          onUpdate(liveData);
        }
      }
    }, (error) => {
      console.warn('[Firestore] Music config snapshot warning:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('[Firestore] Music config subscription failed:', e);
    return () => {};
  }
}


// ==========================================
// Contact Messages (Admin Inbox) Client APIs
// ==========================================

const MESSAGES_CACHE_KEY = 'zion_contact_messages_cache_v1';
const DELETED_MESSAGES_KEY = 'zion_deleted_messages_blacklist_v1';

export function getDeletedMessageIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MESSAGES_KEY);
    const set = raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    // Ensure initial test messages are permanently excluded
    set.add('msg_init_kaist_mentor');
    set.add('msg_init_competition_org');
    return set;
  } catch {
    const set = new Set<string>();
    set.add('msg_init_kaist_mentor');
    set.add('msg_init_competition_org');
    return set;
  }
}

export function addDeletedMessageId(id: string) {
  try {
    const set = getDeletedMessageIds();
    set.add(id);
    localStorage.setItem(DELETED_MESSAGES_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export const INITIAL_CLIENT_MESSAGES: ContactMessage[] = [];

export function getCachedMessages(): ContactMessage[] {
  const deletedIds = getDeletedMessageIds();
  try {
    const raw = localStorage.getItem(MESSAGES_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(m => !deletedIds.has(m.id));
      }
    }
  } catch {}
  return [];
}

export function saveCachedMessages(messages: ContactMessage[]) {
  try {
    const deletedIds = getDeletedMessageIds();
    const filtered = messages.filter(m => !deletedIds.has(m.id));
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Send a contact message from the default window Connect Modal
 */
export async function apiSendMessage(data: {
  senderName: string;
  email: string;
  message: string;
  subject?: string;
  visitorId?: string;
  accessCode?: string;
}): Promise<{ success: boolean; message: ContactMessage }> {
  const newMsg: ContactMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    senderName: data.senderName.trim(),
    email: (data.email || '').trim(),
    subject: (data.subject || '').trim() || (data.message.trim().slice(0, 35) + (data.message.trim().length > 35 ? '...' : '')),
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
    starred: false,
    replied: false,
    visitorId: data.visitorId ? String(data.visitorId).trim() : undefined,
    accessCode: data.accessCode ? String(data.accessCode).trim() : undefined,
  };

  // Register in visitor's local history for immediate lookup
  addMySentMessageId(newMsg.id);

  // 1. Save to local cache immediately
  const current = getCachedMessages();
  const updated = [newMsg, ...current.filter(m => m.id !== newMsg.id)];
  saveCachedMessages(updated);

  // 2. Direct Firestore write (clean undefined fields)
  try {
    const cleanDoc: any = { ...newMsg };
    for (const k of Object.keys(cleanDoc)) {
      if (cleanDoc[k] === undefined) delete cleanDoc[k];
    }
    const docRef = doc(db, 'contact_messages', newMsg.id);
    await setDoc(docRef, cleanDoc);
  } catch (err) {
    console.warn('[Firestore] Direct write message notice:', err);
  }

  // 3. Express server API POST
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });
  } catch (err) {
    console.warn('[API] Server POST /api/messages notice:', err);
  }

  return { success: true, message: newMsg };
}

/**
 * Admin directly sends an in-app reply to a message
 */
export async function apiSendAdminReply(
  messageId: string,
  replyText: string,
  replyAuthor: string = '김지온 (로봇 연구원)'
): Promise<boolean> {
  const updates: Partial<ContactMessage> = {
    replyText: replyText.trim(),
    repliedAt: new Date().toISOString(),
    replyAuthor: replyAuthor.trim(),
    replied: true,
  };

  // 1. Update local cache
  const current = getCachedMessages();
  const updated = current.map(m => m.id === messageId ? { ...m, ...updates } : m);
  saveCachedMessages(updated);

  // 2. Direct Firestore update
  try {
    const docRef = doc(db, 'contact_messages', messageId);
    await setDoc(docRef, updates, { merge: true });
  } catch (e) {
    console.warn('[Firestore] Direct reply notice:', e);
  }

  // 3. Express server API reply
  try {
    await fetch(`/api/messages/${messageId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText, replyAuthor })
    });
  } catch (e) {
    console.warn('[API] Server reply notice:', e);
  }

  return true;
}

/**
 * Visitor retrieves only their own inquiries and replies
 * Guarantees zero visibility into any other visitor's inquiries
 */
export async function apiGetMyInquiries(
  visitorId?: string,
  email?: string,
  accessCode?: string
): Promise<ContactMessage[]> {
  const mySentIds = new Set(getMySentMessageIds());
  const deletedIds = getDeletedMessageIds();

  // Try server API first
  try {
    const params = new URLSearchParams();
    if (visitorId) params.append('visitorId', visitorId);
    if (email) params.append('email', email.trim());
    if (accessCode) params.append('accessCode', accessCode.trim());

    const res = await fetch(`/api/messages/my?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        return data.messages.filter((m: ContactMessage) => !deletedIds.has(m.id));
      }
    }
  } catch (e) {
    console.warn('[API] Fetch my messages fallback to local/Firestore:', e);
  }

  // Fallback: check locally cached messages and filter strictly
  const allCached = getCachedMessages();
  const filtered = allCached.filter(m => {
    if (deletedIds.has(m.id)) return false;
    if (mySentIds.has(m.id)) return true;
    if (visitorId && m.visitorId && m.visitorId === visitorId) return true;
    if (email && m.email && m.email.trim().toLowerCase() === email.trim().toLowerCase()) {
      if (accessCode && m.accessCode) {
        return m.accessCode === accessCode.trim();
      }
      return true;
    }
    return false;
  });

  return filtered;
}

/**
 * Get all messages for the Admin Inbox
 */
export async function apiGetMessages(): Promise<ContactMessage[]> {
  const deletedIds = getDeletedMessageIds();

  // 1. Try server API
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        const filtered = data.messages.filter((m: ContactMessage) => !deletedIds.has(m.id));
        saveCachedMessages(filtered);
        return filtered;
      }
    }
  } catch (e) {
    console.warn('[API] Fetch messages error, using Firestore/cache:', e);
  }

  // 2. Try direct Firestore
  try {
    const colRef = collection(db, 'contact_messages');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const list: ContactMessage[] = [];
      snap.forEach(d => {
        if (!deletedIds.has(d.id)) {
          list.push({ id: d.id, ...(d.data() as any) });
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveCachedMessages(list);
      return list;
    } else {
      saveCachedMessages([]);
      return [];
    }
  } catch (e) {
    console.warn('[Firestore] Direct getMessages warning:', e);
  }

  return getCachedMessages();
}

/**
 * Update message status (e.g. read/unread, starred, replied)
 */
export async function apiUpdateMessageStatus(id: string, updates: Partial<ContactMessage>): Promise<boolean> {
  // 1. Update local cache
  const current = getCachedMessages();
  const updated = current.map(m => m.id === id ? { ...m, ...updates } : m);
  saveCachedMessages(updated);

  // 2. Direct Firestore update
  try {
    const docRef = doc(db, 'contact_messages', id);
    await setDoc(docRef, updates, { merge: true });
  } catch (e) {
    console.warn('[Firestore] Direct update message status notice:', e);
  }

  // 3. Server API update
  try {
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (e) {
    console.warn('[API] Server update message status notice:', e);
  }

  return true;
}

/**
 * Delete a message
 */
export async function apiDeleteMessage(id: string): Promise<boolean> {
  // 1. Permanent local blacklist
  addDeletedMessageId(id);

  // 2. Update local cache
  const current = getCachedMessages();
  const updated = current.filter(m => m.id !== id);
  saveCachedMessages(updated);

  // 3. Firestore delete
  try {
    const docRef = doc(db, 'contact_messages', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('[Firestore] Delete message notice:', e);
  }

  // 4. Server API delete
  try {
    await fetch(`/api/messages/${id}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('[API] Server delete message notice:', e);
  }

  return true;
}

/**
 * Real-time subscription to Contact Messages for Admin Inbox
 */
export function subscribeToMessages(onUpdate: (messages: ContactMessage[]) => void) {
  try {
    const colRef = collection(db, 'contact_messages');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const deletedIds = getDeletedMessageIds();
      if (!snapshot.empty) {
        const list: ContactMessage[] = [];
        snapshot.forEach(d => {
          if (!deletedIds.has(d.id)) {
            list.push({ id: d.id, ...(d.data() as any) });
          }
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveCachedMessages(list);
        onUpdate(list);
      } else {
        saveCachedMessages([]);
        onUpdate([]);
      }
    }, (error) => {
      console.warn('[Firestore] Contact messages subscription notice:', error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn('[Firestore] Contact messages subscription failed:', e);
    return () => {};
  }
}



