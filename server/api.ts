import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword, DbUser } from './db.js';

export const apiRouter = Router();

// Extend express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: DbUser;
}

// Authentication Middleware
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = db.findSession(token);

  if (!session) {
    res.status(401).json({ success: false, error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'User account not found.' });
    return;
  }

  req.user = user;
  next();
}

// URL Validator Helper
function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  // Reject spaces or invalid characters in URL
  if (/\s/.test(trimmed)) return false;
  // If protocol was specified, ensure it is http or https
  if (/^[a-zA-Z0-9+-.]+:\/\//.test(trimmed)) {
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
  }

  try {
    const urlObj = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') return false;
    // Hostname must contain at least one dot or be localhost, and have valid domain characters
    const host = urlObj.hostname;
    if (!host || host.length < 3) return false;
    if (!host.includes('.') && host !== 'localhost') return false;
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) return false;
    if (host.startsWith('.') || host.endsWith('.') || host.includes('..')) return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

// Username format validation (alphanumeric and underscores, 3-20 chars)
const RESERVED_USERNAMES = new Set([
  'api', 'login', 'signup', 'register', 'dashboard', 'settings', 'admin',
  '404', 'not-found', 'profile', 'links', 'auth', 'home', 'explore', 'assets',
  'public', 'static', 'favicon.ico', 'sitemap.xml', 'robots.txt'
]);

function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const clean = username.trim();
  if (clean.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long.' };
  }
  if (clean.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  if (RESERVED_USERNAMES.has(clean.toLowerCase())) {
    return { valid: false, error: `"${clean}" is a reserved keyword and cannot be used as a username.` };
  }
  return { valid: true };
}

// Strip sensitive fields
function sanitizeUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    usernameLower: user.usernameLower,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    theme: user.theme,
    pageViews: user.pageViews || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ==========================================
// AUTH ROUTES
// ==========================================

// Check username availability
apiRouter.get('/auth/check-username/:username', (req: Request, res: Response) => {
  const { username } = req.params;
  const validation = validateUsernameFormat(username);
  if (!validation.valid) {
    res.json({ available: false, error: validation.error });
    return;
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    res.json({ available: false, error: 'Username is already taken.' });
    return;
  }

  res.json({ available: true, message: 'Username is available!' });
});

// Signup
apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { email, password, username, displayName } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    return;
  }

  if (!password || password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    return;
  }

  if (!username) {
    res.status(400).json({ success: false, error: 'Username is required.' });
    return;
  }

  const usernameVal = validateUsernameFormat(username);
  if (!usernameVal.valid) {
    res.status(400).json({ success: false, error: usernameVal.error });
    return;
  }

  // Check email collision
  const existingEmail = db.findUserByEmail(email);
  if (existingEmail) {
    res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    return;
  }

  // Check username collision (case-insensitive)
  const existingUsername = db.findUserByUsername(username);
  if (existingUsername) {
    res.status(400).json({ success: false, error: `The username "${username}" is already taken.` });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const cleanUsername = username.trim();

  // Create user
  const newUser = db.createUser({
    email: email.trim().toLowerCase(),
    username: cleanUsername,
    usernameLower: cleanUsername.toLowerCase(),
    passwordHash,
    salt,
    displayName: displayName?.trim() || cleanUsername,
    bio: `Hey there! Welcome to my OneLink page. Connect with me through the links below.`,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
    theme: 'minimal',
  });

  // Create initial starter link
  db.createLink({
    userId: newUser.id,
    title: 'My Website / Portfolio',
    url: 'https://example.com',
    icon: 'globe',
  });

  // Create session
  const session = db.createSession(newUser.id);

  res.status(201).json({
    success: true,
    data: {
      token: session.token,
      user: sanitizeUser(newUser),
    },
    message: 'Account created successfully!',
  });
});

// Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier can be email or username

  if (!identifier || !password) {
    res.status(400).json({ success: false, error: 'Please provide your email/username and password.' });
    return;
  }

  const cleanIdent = identifier.trim();
  // Find by email or username
  let user = db.findUserByEmail(cleanIdent);
  if (!user) {
    user = db.findUserByUsername(cleanIdent);
  }

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email/username or password.' });
    return;
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    res.status(401).json({ success: false, error: 'Invalid email/username or password.' });
    return;
  }

  const session = db.createSession(user.id);

  res.json({
    success: true,
    data: {
      token: session.token,
      user: sanitizeUser(user),
    },
    message: 'Logged in successfully.',
  });
});

// Logout
apiRouter.post('/auth/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Get current authenticated user
apiRouter.get('/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

// ==========================================
// USER PROFILE & DASHBOARD ROUTES
// ==========================================

// Update user profile (Strict ownership: only modifies req.user.id)
apiRouter.put('/user/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { displayName, bio, avatarUrl, theme, username } = req.body;

  const updates: Partial<DbUser> = {};

  if (displayName !== undefined) {
    updates.displayName = String(displayName).trim();
  }

  if (bio !== undefined) {
    updates.bio = String(bio).trim();
  }

  if (avatarUrl !== undefined) {
    updates.avatarUrl = String(avatarUrl).trim();
  }

  if (theme !== undefined) {
    updates.theme = String(theme).trim();
  }

  // Handle username update if requested
  if (username !== undefined && username.trim().toLowerCase() !== req.user.usernameLower) {
    const cleanUsername = username.trim();
    const val = validateUsernameFormat(cleanUsername);
    if (!val.valid) {
      res.status(400).json({ success: false, error: val.error });
      return;
    }

    const existing = db.findUserByUsername(cleanUsername);
    if (existing && existing.id !== req.user.id) {
      res.status(400).json({ success: false, error: `The username "${cleanUsername}" is already taken.` });
      return;
    }

    updates.username = cleanUsername;
    updates.usernameLower = cleanUsername.toLowerCase();
  }

  const updatedUser = db.updateUser(req.user.id, updates);
  if (!updatedUser) {
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
    return;
  }

  res.json({
    success: true,
    data: {
      user: sanitizeUser(updatedUser),
    },
    message: 'Profile updated successfully.',
  });
});

// ==========================================
// USER LINKS CRUD (Strict Ownership Verified)
// ==========================================

// Get user's links
apiRouter.get('/user/links', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const links = db.getUserLinks(req.user.id);
  res.json({ success: true, data: { links } });
});

// Add link (Max 20 limit, valid URL, non-empty title)
apiRouter.post('/user/links', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { title, url, icon } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ success: false, error: 'Link title cannot be empty.' });
    return;
  }

  if (!url || !url.trim()) {
    res.status(400).json({ success: false, error: 'Link URL cannot be empty.' });
    return;
  }

  const normalizedUrl = normalizeUrl(url);
  if (!isValidUrl(normalizedUrl)) {
    res.status(400).json({ success: false, error: 'Invalid URL format. Please provide a valid web address (e.g., https://example.com).' });
    return;
  }

  const userLinks = db.getUserLinks(req.user.id);
  if (userLinks.length >= 20) {
    res.status(400).json({ success: false, error: 'Maximum limit of 20 links reached for this profile.' });
    return;
  }

  const createdLink = db.createLink({
    userId: req.user.id,
    title: title.trim(),
    url: normalizedUrl,
    icon: icon || 'globe',
  });

  res.status(201).json({
    success: true,
    data: { link: createdLink },
    message: 'Link added successfully.',
  });
});

// Update specific link (STRICT OWNERSHIP CHECK: verified req.user.id === link.userId)
apiRouter.put('/user/links/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { id } = req.params;
  const { title, url, icon, isActive } = req.body;

  const existingLink = db.findLinkById(id);
  if (!existingLink) {
    res.status(404).json({ success: false, error: 'Link not found.' });
    return;
  }

  // CRITICAL SECURITY OWNERSHIP CHECK
  if (existingLink.userId !== req.user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to modify this link.' });
    return;
  }

  const updates: { title?: string; url?: string; icon?: string; isActive?: boolean } = {};

  if (title !== undefined) {
    if (!title.trim()) {
      res.status(400).json({ success: false, error: 'Link title cannot be empty.' });
      return;
    }
    updates.title = title.trim();
  }

  if (url !== undefined) {
    if (!url.trim()) {
      res.status(400).json({ success: false, error: 'Link URL cannot be empty.' });
      return;
    }
    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
      res.status(400).json({ success: false, error: 'Invalid URL format. Please provide a valid web address.' });
      return;
    }
    updates.url = normalizedUrl;
  }

  if (icon !== undefined) {
    updates.icon = icon;
  }

  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }

  const updated = db.updateLink(id, updates);

  res.json({
    success: true,
    data: { link: updated },
    message: 'Link updated successfully.',
  });
});

// Delete link (STRICT OWNERSHIP CHECK: verified req.user.id === link.userId)
apiRouter.delete('/user/links/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { id } = req.params;

  const existingLink = db.findLinkById(id);
  if (!existingLink) {
    res.status(404).json({ success: false, error: 'Link not found.' });
    return;
  }

  // CRITICAL SECURITY OWNERSHIP CHECK
  if (existingLink.userId !== req.user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to delete this link.' });
    return;
  }

  db.deleteLink(id);

  res.json({
    success: true,
    message: 'Link deleted successfully.',
  });
});

// Reorder links (STRICT OWNERSHIP CHECK: verifies all IDs belong to req.user.id)
apiRouter.put('/user/links-reorder', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { linkIds } = req.body;

  if (!Array.isArray(linkIds)) {
    res.status(400).json({ success: false, error: 'linkIds must be an array of link IDs.' });
    return;
  }

  // Verify ownership of every link in the reorder request
  for (const id of linkIds) {
    const link = db.findLinkById(id);
    if (link && link.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Forbidden: Attempted to reorder links you do not own.' });
      return;
    }
  }

  const updatedLinks = db.reorderUserLinks(req.user.id, linkIds);

  res.json({
    success: true,
    data: { links: updatedLinks },
    message: 'Link order saved successfully.',
  });
});

// ==========================================
// PUBLIC PROFILE & VISITOR ROUTES (No Auth)
// ==========================================

// Get public profile by username (case-insensitive lookup e.g. /bhanu or /BHANU or /Bhanu)
apiRouter.get('/public/profile/:username', (req: Request, res: Response) => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ success: false, error: 'Username is required.' });
    return;
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    res.status(404).json({
      success: false,
      error: `The creator profile "@${username}" was not found.`,
      notFound: true,
      requestedUsername: username,
    });
    return;
  }

  // Increment page view count
  db.incrementUserViews(user.id);

  // Retrieve user's links (only active links for public visitors)
  const links = db.getUserLinks(user.id).filter(l => l.isActive);

  res.json({
    success: true,
    data: {
      profile: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
        pageViews: (user.pageViews || 0) + 1,
      },
      links,
    },
  });
});

// Track link click count
apiRouter.post('/public/links/:id/click', (req: Request, res: Response) => {
  const { id } = req.params;
  db.incrementLinkClicks(id);
  res.json({ success: true });
});

// Get featured creators list for homepage showcase
apiRouter.get('/public/featured-creators', (_req: Request, res: Response) => {
  const users = db.getUsers().slice(0, 6);
  const featured = users.map(u => {
    const userLinks = db.getUserLinks(u.id).filter(l => l.isActive);
    return {
      username: u.username,
      displayName: u.displayName,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      theme: u.theme,
      linkCount: userLinks.length,
      pageViews: u.pageViews || 0,
    };
  });

  res.json({ success: true, data: { creators: featured } });
});
