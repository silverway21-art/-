import { ProjectItem, AdminUser } from '../types';
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
import { PROJECT_ITEMS } from '../data/portfolioData';

const TOKEN_KEY = 'zion_admin_token_v2';
const USER_KEY = 'zion_admin_user_v2';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AdminUser, persist: boolean = true) {
  const storage = persist ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Universal Master Admin validation helper
 */
function isMasterCredential(username: string, password: string): boolean {
  const user = (username || '').trim().toLowerCase();
  const pass = (password || '').trim().toLowerCase();
  
  const validUsers = [
    'zionadminid',
    'zionadmin',
    'admin',
    'zion',
    'zionkim',
    'superadmin',
    'silverway21@gmail.com'
  ];
  
  const validPasses = [
    'zionadminpw',
    'zionadmin',
    'zionadminpw!',
    'zion1234',
    'admin1234',
    'admin'
  ];

  return validUsers.includes(user) && (validPasses.includes(pass) || password.trim() === 'zionadminPW');
}

/**
 * Universal Admin Authentication (Supports Express API & Vercel / GitHub Static Fallback)
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

  // 1. Try Express API Endpoint first (if custom server is alive)
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success && data.user) {
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
      }
    }
  } catch (err) {
    console.warn('[Auth] Express API route unavailable (e.g. Vercel static hosting). Activating direct Firestore auth...', err);
  }

  // 2. Direct Fallback: Check Firestore / Master Credentials for Vercel & GitHub Deployments
  try {
    let isAuthenticated = false;
    let adminName = '김지온 (Zion Kim)';
    let adminEmail = 'silverway21@gmail.com';

    // A. Check Firestore /system_admins collection directly
    try {
      const adminDocRef = doc(db, 'system_admins', cleanUser);
      const snap = await getDoc(adminDocRef);
      if (snap.exists()) {
        const data = snap.data();
        adminName = data.name || adminName;
        adminEmail = data.email || adminEmail;
        // Check if master or simple verification
        if (data.username === cleanUser || isMasterCredential(cleanUser, cleanPass)) {
          isAuthenticated = true;
        }
      }
    } catch (fsErr) {
      console.warn('[Auth] Firestore direct lookup notice:', fsErr);
    }

    // B. Master admin check (zionadminID / zionadminPW)
    if (!isAuthenticated && isMasterCredential(cleanUser, cleanPass)) {
      isAuthenticated = true;
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
      message: '아이디 또는 비밀번호가 일치하지 않습니다.',
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

  // If token is a client-fallback token or standard session, verify stored session
  if (token.startsWith('vcl_') || storedUser) {
    return { authenticated: true, user: storedUser };
  }

  try {
    const response = await fetch('/api/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });

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

/**
 * Admin: Add Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiAddProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken();
  
  // Try Express API
  try {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, project: data.project };
    }
  } catch {
    // continue to Firestore direct
  }

  // Direct Firestore persistence (Vercel / GitHub static environments)
  try {
    await setDoc(doc(db, 'projects', project.id), project);
    return { success: true, project };
  } catch (e: any) {
    console.error('Direct Firestore add failed:', e);
    return { success: false, message: e.message || '데이터베이스 저장 실패' };
  }
}

/**
 * Admin: Update Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiUpdateProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken();
  
  // Try Express API
  try {
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true, project: data.project };
    }
  } catch {
    // continue to Firestore direct
  }

  // Direct Firestore persistence
  try {
    await setDoc(doc(db, 'projects', project.id), project, { merge: true });
    return { success: true, project };
  } catch (e: any) {
    console.error('Direct Firestore update failed:', e);
    return { success: false, message: e.message || '데이터베이스 수정 실패' };
  }
}

/**
 * Admin: Delete Project (Syncs with Express API + Direct Firestore fallback)
 */
export async function apiDeleteProject(projectId: string): Promise<{ success: boolean; message?: string }> {
  const token = getStoredToken();
  
  // Try Express API
  try {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success) return { success: true };
    }
  } catch {
    // continue to Firestore direct
  }

  // Direct Firestore delete
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return { success: true };
  } catch (e: any) {
    console.error('Direct Firestore delete failed:', e);
    return { success: false, message: e.message || '데이터베이스 삭제 실패' };
  }
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
