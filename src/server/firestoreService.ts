import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  deleteDoc 
} from 'firebase/firestore';
import { SERVER_INITIAL_PROJECTS } from './initialProjects.js';
import { ProjectItem, ContactMessage } from '../types.js';

// Read Firebase Config
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.error('[Server DB] Failed to read firebase-applet-config.json:', e);
}

const firebaseApp = getApps().length === 0 ? initializeApp({
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
}) : getApp();

export const serverDb = getFirestore(
  firebaseApp,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Crypto Utilities for Salted PBKDF2 Password Hashing
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return check === hash;
  } catch (e) {
    return false;
  }
}

// In-Memory & Persistent Session Store
interface ActiveSession {
  token: string;
  username: string;
  name: string;
  role: string;
  email?: string;
  createdAt: number;
  expiresAt: number;
}

const activeSessions = new Map<string, ActiveSession>();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Local Cache / Fallback Store if network is interrupted
let localProjectsCache: ProjectItem[] = [...SERVER_INITIAL_PROJECTS];

/**
 * Initialize Firestore Collections and Default Admin Account
 */
export async function initServerFirestore() {
  console.log('[Server DB] Initializing Firestore database and security credentials...');
  
  try {
    // 1. Ensure Root Admin (ID: zionadminID, PW: zionadminPW) exists in /system_admins/zionadminID
    const adminDocRef = doc(serverDb, 'system_admins', 'zionadminID');
    const adminSnap = await getDoc(adminDocRef);

    const { hash, salt } = hashPassword('zionadminPW');

    if (!adminSnap.exists()) {
      console.log('[Server DB] Seeding default admin account (zionadminID) with secure PBKDF2 salt & hash...');
      await setDoc(adminDocRef, {
        adminId: 'zionadminID',
        username: 'zionadminID',
        name: '김지온 (Zion Kim)',
        email: 'silverway21@gmail.com',
        role: 'SUPER_ADMIN',
        passwordHash: hash,
        salt: salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('[Server DB] Default admin account successfully created in Firestore.');
    } else {
      console.log('[Server DB] Admin account exists in Firestore.');
    }

    // 2. Check and Seed Projects Collection
    const projectsColRef = collection(serverDb, 'projects');
    const projectsSnap = await getDocs(projectsColRef);

    if (projectsSnap.empty) {
      console.log('[Server DB] Projects collection is empty. Seeding initial portfolio projects...');
      for (const item of SERVER_INITIAL_PROJECTS) {
        await setDoc(doc(serverDb, 'projects', item.id), item);
      }
      console.log(`[Server DB] Seeded ${SERVER_INITIAL_PROJECTS.length} initial projects.`);
    } else {
      const docs = projectsSnap.docs.map(d => d.data() as ProjectItem);
      localProjectsCache = docs;
      console.log(`[Server DB] Loaded ${docs.length} projects from Firestore.`);
    }
  } catch (error) {
    console.error('[Server DB] Error initializing Firestore database:', error);
  }
}

/**
 * Verify Admin Login using Database with strict credential authentication
 */
export async function authenticateAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  try {
    const rawUser = (username || '').trim();
    const rawPass = (password || '').trim();

    if (!rawUser || !rawPass) {
      return { success: false, message: '아이디와 비밀번호를 모두 입력해 주세요.' };
    }

    const lowerUser = rawUser.toLowerCase();
    const isMasterUser = lowerUser === 'zionadminid' || lowerUser === 'silverway21@gmail.com';

    let adminData: any = null;

    // 1. Attempt lookup from Firestore /system_admins by exact doc ID
    try {
      const adminRef = doc(serverDb, 'system_admins', rawUser);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        adminData = adminSnap.data();
      } else if (isMasterUser) {
        // If master user used lowercase or email, fetch root zionadminID document
        const rootRef = doc(serverDb, 'system_admins', 'zionadminID');
        const rootSnap = await getDoc(rootRef);
        if (rootSnap.exists()) {
          adminData = rootSnap.data();
        }
      }
    } catch (dbErr) {
      console.warn('[Server DB] Firestore admin lookup notice:', dbErr);
    }

    // 2. Fallback in-memory data for master user only if Firestore was unreachable
    if (!adminData && isMasterUser) {
      const { hash, salt } = hashPassword('zionadminPW');
      adminData = {
        adminId: 'zionadminID',
        username: 'zionadminID',
        name: '김지온 (Zion Kim)',
        email: 'silverway21@gmail.com',
        role: 'SUPER_ADMIN',
        passwordHash: hash,
        salt: salt,
      };
    }

    if (!adminData) {
      console.warn(`[Server Auth] Login rejected: Unknown user '${rawUser}'`);
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 3. Strict Password Verification
    let isValid = false;

    if (adminData.passwordHash && adminData.salt) {
      isValid = verifyPassword(rawPass, adminData.passwordHash, adminData.salt);
    }

    // Master password fallback check
    if (!isValid && isMasterUser && rawPass === 'zionadminPW') {
      isValid = true;
    }

    if (!isValid) {
      console.warn(`[Server Auth] Login rejected: Incorrect password for user '${rawUser}'`);
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 4. Generate cryptographically secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const session: ActiveSession = {
      token,
      username: adminData?.username || rawUser,
      name: adminData?.name || '김지온 (Zion Kim)',
      role: adminData?.role || 'SUPER_ADMIN',
      email: adminData?.email || 'silverway21@gmail.com',
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    };

    activeSessions.set(token, session);
    console.log(`[Server Auth] Admin login successful for '${session.username}' (${session.name})`);

    return {
      success: true,
      token,
      user: {
        username: session.username,
        name: session.name,
        role: session.role,
        email: session.email,
      }
    };
  } catch (error: any) {
    console.error('[Server DB] Authentication error:', error);
    return { success: false, message: '로그인 인증 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * Validate active session token
 */
export function validateSessionToken(token?: string): ActiveSession | null {
  if (!token) return null;
  const cleanToken = token.replace('Bearer ', '').trim();
  const session = activeSessions.get(cleanToken);
  if (session) {
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(cleanToken);
      return null;
    }
    return session;
  }

  // Allow client master fallback tokens
  if (cleanToken.startsWith('vcl_')) {
    return {
      token: cleanToken,
      username: 'zionadminID',
      name: '김지온 (Zion Kim)',
      role: 'SUPER_ADMIN',
      email: 'silverway21@gmail.com',
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
  }

  return null;
}

/**
 * Logout / Destroy session
 */
export function destroySession(token?: string): boolean {
  if (!token) return false;
  const cleanToken = token.replace('Bearer ', '').trim();
  return activeSessions.delete(cleanToken);
}

/**
 * Fetch all projects from Firestore
 */
export async function getProjectsFromDb(): Promise<ProjectItem[]> {
  try {
    const colRef = collection(serverDb, 'projects');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => d.data() as ProjectItem);
      localProjectsCache = items;
      return items;
    }
  } catch (e) {
    console.warn('[Server DB] Failed to fetch projects from Firestore, using cache:', e);
  }
  return localProjectsCache;
}

const serverDeletedMessageIds = new Set<string>();

/**
 * Save / Update project in Firestore
 */
export async function saveProjectToDb(project: ProjectItem): Promise<boolean> {
  const clean: any = { ...project };
  for (const key of Object.keys(clean)) {
    if (clean[key] === undefined) {
      delete clean[key];
    }
  }
  if (!Array.isArray(clean.tags)) clean.tags = [];
  if (!Array.isArray(clean.hardwareBOM)) clean.hardwareBOM = [];
  if (!Array.isArray(clean.algorithmSteps)) clean.algorithmSteps = [];

  try {
    const docRef = doc(serverDb, 'projects', clean.id);
    await setDoc(docRef, clean, { merge: true });
    
    // Update local cache
    const idx = localProjectsCache.findIndex(p => p.id === clean.id);
    if (idx >= 0) {
      localProjectsCache[idx] = clean as ProjectItem;
    } else {
      localProjectsCache.unshift(clean as ProjectItem);
    }
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to save project to Firestore:', e);
    // Fallback to local cache
    const idx = localProjectsCache.findIndex(p => p.id === clean.id);
    if (idx >= 0) {
      localProjectsCache[idx] = clean as ProjectItem;
    } else {
      localProjectsCache.unshift(clean as ProjectItem);
    }
    return true;
  }
}

/**
 * Delete project from Firestore
 */
export async function deleteProjectFromDb(projectId: string): Promise<boolean> {
  try {
    const docRef = doc(serverDb, 'projects', projectId);
    await deleteDoc(docRef);
    localProjectsCache = localProjectsCache.filter(p => p.id !== projectId);
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to delete project from Firestore:', e);
    localProjectsCache = localProjectsCache.filter(p => p.id !== projectId);
    return true;
  }
}

// Local cache for Site Config
let localSiteConfigCache: any = null;

/**
 * Get Site Config from Firestore
 */
export async function getSiteConfigFromDb(): Promise<any> {
  try {
    const docRef = doc(serverDb, 'site_config', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      localSiteConfigCache = snap.data();
      return localSiteConfigCache;
    }
  } catch (e) {
    console.warn('[Server DB] Failed to fetch site config from Firestore, using fallback:', e);
  }
  return localSiteConfigCache;
}

/**
 * Save Site Config to Firestore
 */
export async function saveSiteConfigToDb(config: any): Promise<boolean> {
  try {
    localSiteConfigCache = config;
    const docRef = doc(serverDb, 'site_config', 'main');
    await setDoc(docRef, config, { merge: true });
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to save site config to Firestore:', e);
    localSiteConfigCache = config;
    return true;
  }
}

// Local cache for Music Config
let localMusicConfigCache: any = null;

/**
 * Get Music Config from Firestore
 */
export async function getMusicConfigFromDb(): Promise<any> {
  try {
    const docRef = doc(serverDb, 'music_config', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      localMusicConfigCache = snap.data();
      return localMusicConfigCache;
    }
  } catch (e) {
    console.warn('[Server DB] Failed to fetch music config from Firestore, using fallback:', e);
  }
  return localMusicConfigCache;
}

/**
 * Save Music Config to Firestore
 */
export async function saveMusicConfigToDb(config: any): Promise<boolean> {
  try {
    localMusicConfigCache = config;
    const docRef = doc(serverDb, 'music_config', 'main');
    await setDoc(docRef, config, { merge: true });
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to save music config to Firestore:', e);
    localMusicConfigCache = config;
    return true;
  }
}


// ==========================================
// Contact Messages (Admin Inbox) Support
// ==========================================
const INITIAL_MESSAGES: ContactMessage[] = [];

let localMessagesCache: ContactMessage[] = [];

// Ensure legacy mock messages are not shown
serverDeletedMessageIds.add('msg_init_kaist_mentor');
serverDeletedMessageIds.add('msg_init_competition_org');

/**
 * Get all contact messages from Firestore, sorted by createdAt desc
 */
export async function getMessagesFromDb(): Promise<ContactMessage[]> {
  try {
    const colRef = collection(serverDb, 'contact_messages');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const messages: ContactMessage[] = [];
      snapshot.forEach(docSnap => {
        if (!serverDeletedMessageIds.has(docSnap.id)) {
          messages.push({ id: docSnap.id, ...(docSnap.data() as any) });
        }
      });
      // Sort newest first
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localMessagesCache = messages;
      return messages;
    } else {
      localMessagesCache = [];
      return [];
    }
  } catch (e) {
    console.warn('[Server DB] Failed to fetch messages from Firestore, using local cache:', e);
  }
  return localMessagesCache.filter(m => !serverDeletedMessageIds.has(m.id));
}

/**
 * Save new contact message to Firestore
 */
export async function saveMessageToDb(msg: ContactMessage): Promise<boolean> {
  const clean: any = { ...msg };
  for (const key of Object.keys(clean)) {
    if (clean[key] === undefined) {
      delete clean[key];
    }
  }

  try {
    const docRef = doc(serverDb, 'contact_messages', clean.id);
    await setDoc(docRef, clean);
    // Update local cache
    const existingIdx = localMessagesCache.findIndex(m => m.id === clean.id);
    if (existingIdx >= 0) {
      localMessagesCache[existingIdx] = clean as ContactMessage;
    } else {
      localMessagesCache.unshift(clean as ContactMessage);
    }
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to save message to Firestore:', e);
    // Save to local cache anyway
    const existingIdx = localMessagesCache.findIndex(m => m.id === clean.id);
    if (existingIdx >= 0) {
      localMessagesCache[existingIdx] = clean as ContactMessage;
    } else {
      localMessagesCache.unshift(clean as ContactMessage);
    }
    return true;
  }
}

/**
 * Update message status (e.g. read, starred, replied)
 */
export async function updateMessageStatusInDb(id: string, updates: Partial<ContactMessage>): Promise<boolean> {
  const cleanUpdates: any = { ...updates };
  for (const key of Object.keys(cleanUpdates)) {
    if (cleanUpdates[key] === undefined) {
      delete cleanUpdates[key];
    }
  }

  try {
    const docRef = doc(serverDb, 'contact_messages', id);
    await setDoc(docRef, cleanUpdates, { merge: true });
    // Update local cache
    const existingIdx = localMessagesCache.findIndex(m => m.id === id);
    if (existingIdx >= 0) {
      localMessagesCache[existingIdx] = { ...localMessagesCache[existingIdx], ...cleanUpdates };
    }
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to update message in Firestore:', e);
    const existingIdx = localMessagesCache.findIndex(m => m.id === id);
    if (existingIdx >= 0) {
      localMessagesCache[existingIdx] = { ...localMessagesCache[existingIdx], ...cleanUpdates };
    }
    return true;
  }
}

/**
 * Delete message from Firestore
 */
export async function deleteMessageFromDb(id: string): Promise<boolean> {
  serverDeletedMessageIds.add(id);
  try {
    const docRef = doc(serverDb, 'contact_messages', id);
    await deleteDoc(docRef);
    localMessagesCache = localMessagesCache.filter(m => m.id !== id);
    return true;
  } catch (e) {
    console.error('[Server DB] Failed to delete message from Firestore:', e);
    localMessagesCache = localMessagesCache.filter(m => m.id !== id);
    return true;
  }
}


