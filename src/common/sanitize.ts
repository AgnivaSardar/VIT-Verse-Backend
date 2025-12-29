// Public sanitization helpers
export function sanitizeVideoForPublic(video: any) {
  if (!video || typeof video !== 'object') return video;

  // Make a shallow copy so we don't mutate the DB object
  const safe = { ...video };

  // Remove storage/internal fields that should not be exposed publicly
  delete safe.s3Bucket;
  delete safe.s3KeyOriginal;
  delete safe.s3Key;
  delete safe.cloudflareVID;
  delete safe.processingStatus;
  delete safe.codec;

  // Remove internal ids from nested objects where not needed
  if (safe.channel && typeof safe.channel === 'object') {
    const ch = { ...safe.channel };
    delete ch.userID; // avoid exposing channel owner's internal userID
    delete ch.s3Key;
    delete ch.channelLogoS3Key;
    safe.channel = ch;
  }

  // Remove any other obviously sensitive fields
  delete safe.internalNotes;
  delete safe.adminOnly;

  return safe;
}

export function sanitizeUserForPublic(user: any) {
  if (!user || typeof user !== 'object') return user;
  const safe = { ...user };
  delete safe.passwordHash;
  delete safe.resetToken;
  delete safe.emailVerificationToken;
  delete safe.userPhone;
  delete safe.userEmail;
  return safe;
}

export function sanitizeImageForPublic(image: any) {
  if (!image || typeof image !== 'object') return image;
  const safe = { ...image };
  delete safe.s3Key;
  delete safe.s3Bucket;
  // preserve imgURL (public) but ensure internal names aren't exposed
  delete safe.internalNotes;
  return safe;
}

export function sanitizeChannelForPublic(channel: any) {
  if (!channel || typeof channel !== 'object') return channel;
  const safe = { ...channel };
  // hide internal owner id and storage keys
  delete safe.userID;
  delete safe.s3Key;
  delete safe.channelLogoS3Key;
  delete safe.internalNotes;
  // Trim subscribers list if present
  if (Array.isArray(safe.subscribers)) {
    safe.subscribers = safe.subscribers.map((s: any) => {
      if (s && typeof s === 'object') {
        const copy = { ...s };
        delete copy.email;
        delete copy.phone;
        return copy;
      }
      return s;
    });
  }
  return safe;
}
/**
 * Security: Data Sanitization Module
 * Removes sensitive fields from user responses to prevent data leaks
 */

// Fields that should NEVER be returned in API responses
const SENSITIVE_FIELDS = [
  'userPassword',
  'password',
  'passwordHash',
  'apiKey',
  'apiSecret',
  'refreshToken',
  'accessToken',
];

// Safe fields for public user profiles
export const SAFE_USER_FIELDS = {
  userID: true,
  userName: true,
  userEmail: true,
  userPhone: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  isSuperAdmin: true,
  createdAt: true,
};

// Even safer fields for public profiles (minimal info)
export const PUBLIC_USER_FIELDS = {
  userID: true,
  userName: true,
  userEmail: true,
  role: true,
  isActive: true,
};

/**
 * Remove sensitive fields from a single object
 */
export function sanitizeUser(user: any): any {
  if (!user) return null;

  const sanitized = { ...user };

  SENSITIVE_FIELDS.forEach((field) => {
    delete sanitized[field];
  });

  return sanitized;
}

/**
 * Remove sensitive fields from an array of objects
 */
export function sanitizeUsers(users: any[]): any[] {
  if (!Array.isArray(users)) return [];
  return users.map(sanitizeUser);
}

/**
 * Remove sensitive fields from a nested response
 */
export function sanitizeResponse(data: any): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item));
  }

  if (typeof data !== 'object') {
    return data;
  }

  // Handle users array in response
  if (data.users && Array.isArray(data.users)) {
    data.users = data.users.map(sanitizeUser);
  }

  // Handle single user in response
  if (data.user && typeof data.user === 'object') {
    data.user = sanitizeUser(data.user);
  }

  // Handle nested user objects
  Object.keys(data).forEach((key) => {
    if (
      typeof data[key] === 'object' &&
      data[key] !== null &&
      (key.includes('user') || data[key].userPassword)
    ) {
      data[key] = sanitizeUser(data[key]);
    }
  });

  return data;
}

/**
 * Middleware to automatically sanitize response
 */
export function sanitizeMiddleware(req: any, res: any, next: any) {
  const originalJson = res.json;

  res.json = function (data: any) {
    const sanitized = sanitizeResponse(data);
    return originalJson.call(this, sanitized);
  };

  next();
}

/**
 * Verify password fields are never exposed in logs
 */
export function isSensitiveData(key: string): boolean {
  return SENSITIVE_FIELDS.some(
    (field) => key.toLowerCase().includes(field.toLowerCase())
  );
}

/**
 * Safe logging - excludes sensitive fields
 */
export function safeLog(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const safe = { ...obj };
  Object.keys(safe).forEach((key) => {
    if (isSensitiveData(key)) {
      safe[key] = '[REDACTED]';
    }
  });

  return safe;
}
