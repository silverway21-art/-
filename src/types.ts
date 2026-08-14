export interface JourneyItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  team?: string;
  roles?: string[];
  tags: string[];
  status: 'completed' | 'active' | 'upcoming';
  strength?: string;
  weakness?: string;
  review?: string;
  rank?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'code' | 'hardware' | 'control' | 'logic';
  iconType: 'code' | 'sensor' | 'motor' | 'block' | 'problem' | 'python' | 'vision' | 'mechatronics' | 'ros';
  description: string;
  proficiency: number;
  tags: string[];
  details?: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  title: string;
  category: string;
  descriptionEn: string;
  descriptionKo: string;
  image: string;
  tags: string[];
  status: 'ACTIVE' | 'ARCHIVED' | 'IN_DEVELOPMENT';
  featured: boolean;
  hardwareBOM?: {
    name: string;
    qty: number;
    description: string;
  }[];
  algorithmSteps?: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface AwardItem {
  id: string;
  title: string;
  date: string;
  organization: string;
  category: string;
  status: 'PENDING' | 'AWARDED' | 'TARGET_GOAL';
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MENTOR' | 'COLLABORATOR';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  addedAt: string;
  passcode?: string;
  isRoot?: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
}
