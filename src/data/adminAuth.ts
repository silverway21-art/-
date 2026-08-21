import { AdminUser, AuthSession } from '../types';

export const ROOT_ADMIN_EMAIL = 'silverway21@gmail.com';
export const ROOT_ADMIN_USERNAME = 'zionadminID';
export const MASTER_SECURITY_PIN = 'zionadminPW';

export const ROOT_ADMIN_USER: AdminUser = {
  id: 'admin-root-01',
  email: ROOT_ADMIN_EMAIL,
  name: '김지온 (Zion Kim)',
  role: 'SUPER_ADMIN',
  addedAt: '2026-08-14',
  passcode: MASTER_SECURITY_PIN,
  isRoot: true,
};

const ADMINS_STORAGE_KEY = 'zion_admin_users_v2';
const SESSION_STORAGE_KEY = 'zion_active_admin_session_v2';

/**
 * Retrieve list of authorized administrators.
 * Always ensures ROOT_ADMIN_USER is included.
 */
export function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ensure root admin is present
        const hasRoot = parsed.some(
          (u) => u.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()
        );
        if (!hasRoot) {
          return [ROOT_ADMIN_USER, ...parsed];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load admin users from storage', e);
  }
  return [ROOT_ADMIN_USER];
}

/**
 * Persist admin list
 */
export function saveAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to save admin users to storage', e);
  }
}

/**
 * Add a new administrator
 */
export function addAdminUser(newAdmin: Omit<AdminUser, 'id' | 'addedAt' | 'isRoot'>): {
  success: boolean;
  message: string;
  user?: AdminUser;
} {
  const currentList = getAdminUsers();
  const normalizedEmail = newAdmin.email.trim().toLowerCase();

  if (currentList.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return {
      success: false,
      message: '이미 관리자 권한이 부여된 이메일 계정입니다.',
    };
  }

  const createdUser: AdminUser = {
    id: `admin-${Date.now()}`,
    email: normalizedEmail,
    name: newAdmin.name.trim() || 'Co-Admin',
    role: newAdmin.role || 'ADMIN',
    addedAt: new Date().toISOString().split('T')[0],
    passcode: newAdmin.passcode?.trim() || Math.random().toString(36).slice(2, 8).toUpperCase(),
    isRoot: false,
  };

  const updatedList = [...currentList, createdUser];
  saveAdminUsers(updatedList);

  return {
    success: true,
    message: `${createdUser.name} (${createdUser.email}) 님에게 ${createdUser.role} 권한이 부여되었습니다.`,
    user: createdUser,
  };
}

/**
 * Revoke admin rights (Root admin cannot be removed)
 */
export function removeAdminUser(userId: string): { success: boolean; message: string } {
  const currentList = getAdminUsers();
  const target = currentList.find((u) => u.id === userId);

  if (!target) {
    return { success: false, message: '해당 사용자를 찾을 수 없습니다.' };
  }

  if (target.isRoot || target.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: '최고 관리자(Root Super Admin)의 권한은 삭제할 수 없습니다.' };
  }

  const filtered = currentList.filter((u) => u.id !== userId);
  saveAdminUsers(filtered);

  return { success: true, message: `${target.name} 님의 관리자 권한이 회수되었습니다.` };
}

/**
 * Check and load current active admin session
 */
export function getCurrentSession(): AuthSession {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.currentUser) {
        // Verify user still exists in admin list
        const admins = getAdminUsers();
        const validUser = admins.find(
          (a) => a.email.toLowerCase() === parsed.currentUser.email?.toLowerCase()
        );
        if (validUser) {
          return { isAuthenticated: true, currentUser: validUser };
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load session', e);
  }
  return { isAuthenticated: false, currentUser: null };
}

/**
 * Set active session
 */
export function setActiveSession(user: AdminUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ isAuthenticated: true, currentUser: user })
      );
    }
  } catch (e) {
    console.warn('Failed to set active session', e);
  }
}

/**
 * Authenticate login attempt
 */
export function authenticateAdmin(
  identifier: string,
  passcode?: string
): { success: boolean; user?: AdminUser; message: string } {
  const cleanId = (identifier || '').trim();
  const cleanPass = (passcode || '').trim();

  if (!cleanId || !cleanPass) {
    return {
      success: false,
      message: '아이디와 비밀번호를 모두 입력해 주세요.',
    };
  }

  const normalizedId = cleanId.toLowerCase();
  const isMasterUser = normalizedId === ROOT_ADMIN_USERNAME.toLowerCase() || normalizedId === ROOT_ADMIN_EMAIL.toLowerCase();

  // 1. Root Admin strictly requires MASTER_SECURITY_PIN ('zionadminPW')
  if (isMasterUser) {
    if (cleanPass === MASTER_SECURITY_PIN) {
      setActiveSession(ROOT_ADMIN_USER);
      return {
        success: true,
        user: ROOT_ADMIN_USER,
        message: `최고 관리자(Super Admin) ${ROOT_ADMIN_USER.name} 로그인 완료`,
      };
    }
    return {
      success: false,
      message: '비밀번호가 일치하지 않습니다.',
    };
  }

  // 2. Lookup in registered admins list
  const admins = getAdminUsers();
  const matchedUser = admins.find(
    (u) =>
      u.email.toLowerCase() === normalizedId ||
      u.id.toLowerCase() === normalizedId
  );

  if (matchedUser) {
    if (matchedUser.passcode && matchedUser.passcode === cleanPass) {
      setActiveSession(matchedUser);
      return {
        success: true,
        user: matchedUser,
        message: `${matchedUser.name} (${matchedUser.role}) 로그인 완료`,
      };
    }
    return { success: false, message: '비밀번호가 일치하지 않습니다.' };
  }

  return {
    success: false,
    message: '등록되지 않은 관리자 아이디이거나 비밀번호가 일치하지 않습니다.',
  };
}
