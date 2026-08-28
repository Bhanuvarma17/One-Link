import { ApiResponse, AuthResponse, LinkItem, PublicProfile, User } from '../types';

const TOKEN_KEY = 'onelink_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Network error or service unavailable';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export const authApi = {
  async signup(data: { email: string; password: string; username: string; displayName?: string }) {
    const res = await request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async login(identifier: string, password: string) {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    setStoredToken(null);
    return { success: true };
  },

  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  async checkUsername(username: string) {
    return request<{ available: boolean; error?: string }>(`/api/auth/check-username/${encodeURIComponent(username)}`);
  },
};

export const userApi = {
  async updateProfile(updates: Partial<User>) {
    return request<{ user: User }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getLinks() {
    return request<{ links: LinkItem[] }>('/api/user/links');
  },

  async createLink(data: { title: string; url: string; icon?: string }) {
    return request<{ link: LinkItem }>('/api/user/links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLink(id: string, updates: Partial<LinkItem>) {
    return request<{ link: LinkItem }>(`/api/user/links/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteLink(id: string) {
    return request(`/api/user/links/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async reorderLinks(linkIds: string[]) {
    return request<{ links: LinkItem[] }>('/api/user/links-reorder', {
      method: 'PUT',
      body: JSON.stringify({ linkIds }),
    });
  },
};

export const publicApi = {
  async getProfile(username: string) {
    return request<{ profile: PublicProfile['profile']; links: LinkItem[] }>(`/api/public/profile/${encodeURIComponent(username)}`);
  },

  async trackClick(linkId: string) {
    return request(`/api/public/links/${encodeURIComponent(linkId)}/click`, {
      method: 'POST',
    });
  },

  async getFeaturedCreators() {
    return request<{ creators: Array<Partial<User> & { linkCount: number }> }>('/api/public/featured-creators');
  },
};
