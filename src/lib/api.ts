import { ProjectItem, AdminUser } from '../types';
import { db } from './firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

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
 * Server-Side Admin Authentication (PBKDF2 Salted Hash verification on server)
 */
export async function apiLogin(username: string, password: string, remember: boolean = true): Promise<{ success: boolean; user?: AdminUser; token?: string; message?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || '아이디 또는 비밀번호가 일치하지 않습니다.',
      };
    }

    const adminUser: AdminUser = {
      id: data.user.username || 'admin',
      email: data.user.email || `${data.user.username}@portfolio.local`,
      name: data.user.name || 'Zion Admin',
      role: data.user.role || 'SUPER_ADMIN',
      addedAt: new Date().toISOString(),
      isRoot: data.user.username === 'zionadminID',
    };

    saveSession(data.token, adminUser, remember);

    return {
      success: true,
      user: adminUser,
      token: data.token,
    };
  } catch (error: any) {
    console.error('API login failed:', error);
    return {
      success: false,
      message: '서버 인증 통신 중 오류가 발생했습니다.',
    };
  }
}

/**
 * Verify Active Admin Session with Server
 */
export async function apiCheckSession(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  const token = getStoredToken();
  if (!token) return { authenticated: false };

  try {
    const response = await fetch('/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearSession();
      return { authenticated: false };
    }

    const data = await response.json();
    if (data.authenticated && data.user) {
      const user: AdminUser = {
        id: data.user.username,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        addedAt: new Date().toISOString(),
        isRoot: data.user.username === 'zionadminID',
      };
      return { authenticated: true, user };
    }
    return { authenticated: false };
  } catch (e) {
    console.warn('Session check network error, using stored session if present:', e);
    const stored = getStoredUser();
    return stored ? { authenticated: true, user: stored } : { authenticated: false };
  }
}

/**
 * Logout from Admin Session
 */
export async function apiLogout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
  }
  clearSession();
}

/**
 * Fetch all public projects
 */
export async function apiGetProjects(): Promise<ProjectItem[]> {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        return data.projects;
      }
    }
  } catch (e) {
    console.warn('Fetch projects API failed, attempting Firestore direct sync:', e);
  }
  return [];
}

/**
 * Admin: Add Project
 */
export async function apiAddProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken();
  try {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || '프로젝트 등록 실패' };
    }
    return { success: true, project: data.project };
  } catch (e: any) {
    console.error('apiAddProject error:', e);
    return { success: false, message: e.message || '프로젝트 등록 중 오류 발생' };
  }
}

/**
 * Admin: Update Project
 */
export async function apiUpdateProject(project: ProjectItem): Promise<{ success: boolean; project?: ProjectItem; message?: string }> {
  const token = getStoredToken();
  try {
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || '프로젝트 수정 실패' };
    }
    return { success: true, project: data.project };
  } catch (e: any) {
    console.error('apiUpdateProject error:', e);
    return { success: false, message: e.message || '프로젝트 수정 중 오류 발생' };
  }
}

/**
 * Admin: Delete Project
 */
export async function apiDeleteProject(projectId: string): Promise<{ success: boolean; message?: string }> {
  const token = getStoredToken();
  try {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || '프로젝트 삭제 실패' };
    }
    return { success: true };
  } catch (e: any) {
    console.error('apiDeleteProject error:', e);
    return { success: false, message: e.message || '프로젝트 삭제 중 오류 발생' };
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
