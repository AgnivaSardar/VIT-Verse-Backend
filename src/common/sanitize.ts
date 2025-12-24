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
