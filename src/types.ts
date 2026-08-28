export type ThemePreset =
  | 'vibrant'
  | 'minimal'
  | 'midnight'
  | 'sunset'
  | 'emerald'
  | 'ocean'
  | 'lavender'
  | 'cyber'
  | 'rose';

export interface User {
  id: string;
  email: string;
  username: string;
  usernameLower: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: ThemePreset;
  createdAt: string;
  updatedAt: string;
}

export interface LinkItem {
  id: string;
  userId: string;
  title: string;
  url: string;
  order: number;
  icon?: string;
  isActive: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: ThemePreset;
  pageViews: number;
}

export interface PublicProfile {
  profile: ProfileData;
  links: LinkItem[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
