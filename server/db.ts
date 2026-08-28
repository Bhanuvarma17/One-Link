import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbUser {
  id: string;
  email: string;
  username: string;
  usernameLower: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  pageViews: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbLink {
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

export interface DbSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  links: DbLink[];
  sessions: DbSession[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function seedDatabase(): DatabaseSchema {
  const bhanuId = crypto.randomUUID();
  const sarahId = crypto.randomUUID();
  const alexId = crypto.randomUUID();

  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');
  const salt3 = crypto.randomBytes(16).toString('hex');

  const now = new Date().toISOString();

  const users: DbUser[] = [
    {
      id: bhanuId,
      email: 'bhanu@example.com',
      username: 'bhanu',
      usernameLower: 'bhanu',
      passwordHash: hashPassword('password123', salt1),
      salt: salt1,
      displayName: 'Bhanu Varma',
      bio: 'Full-stack builder, open-source enthusiast & tech explorer. Building the next generation of web tools 🚀',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      theme: 'midnight',
      pageViews: 142,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: sarahId,
      email: 'sarah@example.com',
      username: 'sarah_design',
      usernameLower: 'sarah_design',
      passwordHash: hashPassword('password123', salt2),
      salt: salt2,
      displayName: 'Sarah Chen',
      bio: 'Product Designer & Design System Architect. Creating joyful digital interfaces and mentoring designers ✨',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      theme: 'lavender',
      pageViews: 98,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: alexId,
      email: 'alex@example.com',
      username: 'alex_photo',
      usernameLower: 'alex_photo',
      passwordHash: hashPassword('password123', salt3),
      salt: salt3,
      displayName: 'Alex Rivera',
      bio: 'Landscape & Street Photographer. Capturing moody golden hour light around the globe 📷',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      theme: 'sunset',
      pageViews: 215,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const links: DbLink[] = [
    // Bhanu's links
    {
      id: crypto.randomUUID(),
      userId: bhanuId,
      title: 'GitHub Projects & Repositories',
      url: 'https://github.com',
      order: 0,
      icon: 'github',
      isActive: true,
      clicks: 45,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: bhanuId,
      title: 'Personal Portfolio & Case Studies',
      url: 'https://example.com/portfolio',
      order: 1,
      icon: 'globe',
      isActive: true,
      clicks: 38,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: bhanuId,
      title: 'Connect on LinkedIn',
      url: 'https://linkedin.com',
      order: 2,
      icon: 'linkedin',
      isActive: true,
      clicks: 29,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: bhanuId,
      title: 'Read my Tech Blog on Dev.to',
      url: 'https://dev.to',
      order: 3,
      icon: 'book',
      isActive: true,
      clicks: 19,
      createdAt: now,
      updatedAt: now,
    },

    // Sarah's links
    {
      id: crypto.randomUUID(),
      userId: sarahId,
      title: 'Figma Community UI Kits',
      url: 'https://figma.com/@sarah',
      order: 0,
      icon: 'figma',
      isActive: true,
      clicks: 52,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: sarahId,
      title: 'Dribbble Design Shots',
      url: 'https://dribbble.com',
      order: 1,
      icon: 'dribbble',
      isActive: true,
      clicks: 34,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: sarahId,
      title: 'Design Mentorship on ADPList',
      url: 'https://adplist.org',
      order: 2,
      icon: 'sparkles',
      isActive: true,
      clicks: 12,
      createdAt: now,
      updatedAt: now,
    },

    // Alex's links
    {
      id: crypto.randomUUID(),
      userId: alexId,
      title: '2026 Print Shop & Lightroom Presets',
      url: 'https://unsplash.com',
      order: 0,
      icon: 'shopping-bag',
      isActive: true,
      clicks: 87,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: alexId,
      title: 'Instagram Photo Feed',
      url: 'https://instagram.com',
      order: 1,
      icon: 'instagram',
      isActive: true,
      clicks: 64,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId: alexId,
      title: 'Book a Photo Shoot',
      url: 'https://calendly.com',
      order: 2,
      icon: 'calendar',
      isActive: true,
      clicks: 22,
      createdAt: now,
      updatedAt: now,
    }
  ];

  return {
    users,
    links,
    sessions: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.links)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading database, initializing fresh seed:', e);
    }
    const seed = seedDatabase();
    this.saveDirect(seed);
    return seed;
  }

  private saveDirect(data: DatabaseSchema): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  private save(): void {
    this.saveDirect(this.data);
  }

  // Users
  getUsers(): DbUser[] {
    return this.data.users;
  }

  findUserById(id: string): DbUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email: string): DbUser | undefined {
    const lower = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === lower);
  }

  findUserByUsername(username: string): DbUser | undefined {
    const lower = username.trim().toLowerCase();
    return this.data.users.find(u => u.usernameLower === lower);
  }

  createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt' | 'pageViews'>): DbUser {
    const now = new Date().toISOString();
    const newUser: DbUser = {
      ...user,
      id: crypto.randomUUID(),
      pageViews: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<DbUser, 'id' | 'createdAt'>>): DbUser | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString();
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: now,
    };
    this.save();
    return this.data.users[index];
  }

  incrementUserViews(id: string): void {
    const user = this.findUserById(id);
    if (user) {
      user.pageViews = (user.pageViews || 0) + 1;
      this.save();
    }
  }

  // Links
  getUserLinks(userId: string): DbLink[] {
    return this.data.links
      .filter(l => l.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  findLinkById(id: string): DbLink | undefined {
    return this.data.links.find(l => l.id === id);
  }

  createLink(linkData: { userId: string; title: string; url: string; icon?: string }): DbLink {
    const userLinks = this.getUserLinks(linkData.userId);
    const now = new Date().toISOString();
    const nextOrder = userLinks.length;

    const newLink: DbLink = {
      id: crypto.randomUUID(),
      userId: linkData.userId,
      title: linkData.title.trim(),
      url: linkData.url.trim(),
      order: nextOrder,
      icon: linkData.icon || 'globe',
      isActive: true,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.data.links.push(newLink);
    this.save();
    return newLink;
  }

  updateLink(id: string, updates: Partial<Omit<DbLink, 'id' | 'userId' | 'createdAt'>>): DbLink | null {
    const index = this.data.links.findIndex(l => l.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString();
    this.data.links[index] = {
      ...this.data.links[index],
      ...updates,
      updatedAt: now,
    };
    this.save();
    return this.data.links[index];
  }

  deleteLink(id: string): boolean {
    const link = this.findLinkById(id);
    if (!link) return false;

    const userId = link.userId;
    this.data.links = this.data.links.filter(l => l.id !== id);

    // Re-index remaining links for the user
    const remaining = this.data.links
      .filter(l => l.userId === userId)
      .sort((a, b) => a.order - b.order);

    remaining.forEach((l, idx) => {
      l.order = idx;
    });

    this.save();
    return true;
  }

  reorderUserLinks(userId: string, linkIdsInOrder: string[]): DbLink[] {
    const userLinks = this.getUserLinks(userId);
    const linkMap = new Map(userLinks.map(l => [l.id, l]));

    let order = 0;
    for (const id of linkIdsInOrder) {
      const link = linkMap.get(id);
      if (link) {
        link.order = order++;
      }
    }

    // Handle any links not in the list
    for (const link of userLinks) {
      if (!linkIdsInOrder.includes(link.id)) {
        link.order = order++;
      }
    }

    this.save();
    return this.getUserLinks(userId);
  }

  incrementLinkClicks(id: string): void {
    const link = this.findLinkById(id);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      this.save();
    }
  }

  // Sessions
  createSession(userId: string): DbSession {
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const session: DbSession = {
      token,
      userId,
      createdAt: now.toISOString(),
      expiresAt,
    };

    // Remove expired sessions
    this.data.sessions = this.data.sessions.filter(s => new Date(s.expiresAt) > new Date());
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  findSession(token: string): DbSession | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) <= new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }
}

export const db = new Database();
export { hashPassword };
