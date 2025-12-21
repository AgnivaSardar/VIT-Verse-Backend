# VIT-Verse Admin System Setup Guide

## Overview

The admin system provides comprehensive content management capabilities for super admins to monitor and control all platform content including users, channels, videos, and playlists.

## Features

### 1. **Email Verification with OTP**
- Users receive a 6-digit OTP via email upon registration
- OTP valid for 5 minutes with 3 attempt limit
- SendGrid integration for reliable email delivery
- Welcome email after successful verification

### 2. **Super Admin User**
A seed script creates a super admin account with:
- **Email:** `superadmin@vitvverse.com`
- **Password:** Randomly generated (stored in `SUPER_ADMIN_CREDENTIALS.txt`)
- **Flags:** `isSuperAdmin=true`, `isEmailVerified=true`, `role='admin'`

### 3. **Admin Dashboard**
Web-based admin panel at `http://localhost:5173/admin` with:
- **Overview Tab:** Real-time statistics dashboard
  - Total users, channels, videos, playlists
  - Public vs. hidden content counts
  - Recent user list
  
- **Users Management Tab:**
  - Search and filter users by name/email/role
  - View user status and verification status
  - Activate/deactivate users (except super admin)
  - Pagination with 10 items per page
  
- **Channels Management Tab:**
  - List all channels with search
  - View owner, video count, subscriber count
  - Toggle channel visibility (hide/restore)
  - Soft delete without removing data
  
- **Videos Management Tab:**
  - Search videos by title
  - View video stats (views, likes, comments)
  - Toggle video visibility
  - Soft delete capability
  
- **Playlists Management Tab:**
  - List all playlists
  - View owner and video count
  - Toggle visibility
  - Soft delete capability

### 4. **Soft Delete System**
Content is never permanently deleted, just marked as unavailable:
- `isAvailableToPublic` boolean flag on Channel, Video, Playlist models
- Admin toggle actions hide/restore content
- Email notifications sent for all admin actions

## Setup Instructions

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment Variables
Add to `.env`:
```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=admin@vitvverse.com
FROM_NAME=VIT-Verse
ADMIN_EMAIL=admin@vitvverse.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db?schema=public&pool_size=20&statement_cache_size=250&connect_timeout=10
```

#### 3. Run Database Migrations
```bash
npx prisma migrate dev
```

#### 4. Create Super Admin
```bash
npm run seed:admin
```

**Important:** This generates random credentials and saves them to `SUPER_ADMIN_CREDENTIALS.txt`. **Never commit this file to version control.**

Credentials output:
```
🔐 SUPER ADMIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    superadmin@vitvverse.com
Password: [random-hex-string]
User ID:  1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 5. Start Backend Server
```bash
npm run dev
```

### Frontend Setup

#### 1. Update AuthContext
Already updated with new fields:
- `isEmailVerified`: Boolean flag for email verification status
- `isSuperAdmin`: Boolean flag for super admin privileges
- `isAuthenticated`: Computed property from token

#### 2. Access Admin Dashboard
1. Login with super admin credentials
2. Navigate to `/admin`
3. Dashboard will load automatically

## API Endpoints

All admin endpoints require:
- Authentication (JWT token)
- Super admin privileges (`isSuperAdmin=true`)

### Users Management
- `GET /api/admin/users?page=1&limit=10&search=name&role=student`
- `PATCH /api/admin/users/:id/toggle-status`

### Channels Management
- `GET /api/admin/channels?page=1&limit=10&search=name`
- `PATCH /api/admin/channels/:id/toggle-visibility`

### Videos Management
- `GET /api/admin/videos?page=1&limit=10&search=title`
- `PATCH /api/admin/videos/:id/toggle-visibility`

### Playlists Management
- `GET /api/admin/playlists?page=1&limit=10&search=name`
- `PATCH /api/admin/playlists/:id/toggle-visibility`

### Dashboard
- `GET /api/admin/stats`

## Email Verification Flow

### For New Users (Registration)

1. User registers with email and password
2. Backend calls `sendOTP()`:
   - Generates 6-digit OTP
   - Stores in in-memory map with 5-minute expiry
   - Sends HTML email with OTP
3. User receives email: "VIT-Verse Email Verification"
4. User enters OTP in frontend form
5. Frontend calls `POST /api/auth/verify-otp`:
   - Body: `{ email, otp }`
   - Backend validates OTP
   - Sets `isEmailVerified=true`
   - Sends welcome email
   - Returns JWT token
6. User is now fully authenticated

### For Existing Users (Resend OTP)

Users can resend OTP if needed:
```bash
POST /api/auth/resend-otp
{ "email": "user@example.com" }
```

Returns:
```json
{ "message": "OTP sent successfully" }
```

## Admin Notifications

When admins perform actions, automated emails are sent to `ADMIN_EMAIL`:

**Examples:**
- User deactivated/activated
- Channel hidden/restored
- Video hidden/restored
- Playlist hidden/restored

Email format:
```
Subject: [VIT-Verse Admin] [Action Type]
Message: Detailed description of what was changed
```

## Soft Delete Examples

### Hide a Video
```bash
PATCH /api/admin/videos/123/toggle-visibility
```

Result:
```json
{
  "message": "Video hidden successfully",
  "isAvailableToPublic": false
}
```

### Restore a Video
```bash
PATCH /api/admin/videos/123/toggle-visibility
```

Result:
```json
{
  "message": "Video restored successfully",
  "isAvailableToPublic": true
}
```

## Security Features

### OTP Security
- In-memory storage (upgrade to Redis for production)
- 5-minute expiry
- 3 failed attempt limit before OTP deletion
- Random 6-digit generation

### Admin Access Control
- Super admin middleware validates `isSuperAdmin` flag
- All admin routes require valid JWT token
- Super admin cannot be deactivated
- Admin actions trigger audit trail via email

### Email Security
- SendGrid API key in environment variables
- HTML email templates prevent injection
- No sensitive data in email logs

## Production Checklist

- [ ] Move OTP store from memory to Redis
- [ ] Configure production SendGrid credentials
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/TLS for all connections
- [ ] Set appropriate CORS origins
- [ ] Regular database backups
- [ ] Monitor admin actions in logs
- [ ] Use different passwords for super admin in different environments
- [ ] Enable rate limiting on auth endpoints
- [ ] Implement 2FA for super admin (future)

## Troubleshooting

### "OTP not found or expired"
- OTP is only valid for 5 minutes
- User must request a new OTP via resend endpoint

### "Email sending failed"
- Check SENDGRID_API_KEY in `.env`
- Verify FROM_EMAIL is verified in SendGrid
- Check SendGrid API status

### "Cannot access admin dashboard"
- Verify user is logged in: `useAuth().isAuthenticated === true`
- Verify user has `isSuperAdmin === true`
- Check JWT token expiration

### "Admin button disabled for super admin"
- Super admin cannot be deactivated for security
- This is intentional to prevent lockout

## File Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts (Updated: +verifyOTP, +resendOTP)
│   │   │   ├── auth.service.ts (Updated: email verification flow)
│   │   │   └── auth.routes.ts (Updated: +/verify-otp, +/resend-otp)
│   │   └── admin/
│   │       ├── admin.controller.ts (NEW)
│   │       ├── admin.service.ts (NEW)
│   │       └── admin.routes.ts (NEW)
│   ├── middlewares/
│   │   ├── admin.middleware.ts (NEW: requireSuperAdmin)
│   │   └── auth.middleware.ts (Existing)
│   ├── services/
│   │   └── email.service.ts (Updated: +sendAdminNotification)
│   └── app.ts (Updated: +admin routes)
├── prisma/
│   ├── schema.prisma (Updated: +soft delete fields, +email/admin fields)
│   ├── seed-admin.ts (NEW)
│   └── migrations/
│       └── add_email_verification_and_admin_features/
└── package.json (Updated: +seed script)

frontend/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminDashboard.tsx (NEW)
│   │       └── AdminDashboard.css (NEW)
│   ├── features/auth/
│   │   └── AuthContext.tsx (Updated: +isEmailVerified, +isSuperAdmin, +isAuthenticated)
│   ├── hooks/
│   │   └── useAuth.ts (Existing)
│   └── App.tsx (Updated: +/admin route)
```

## Next Steps

1. ✅ Email verification implemented
2. ✅ Super admin seed created
3. ✅ Admin API endpoints built
4. ✅ Admin dashboard UI created
5. Future: Email verification frontend form
6. Future: OTP verification page
7. Future: Advanced filtering/sorting in admin tables
8. Future: Bulk operations (delete multiple items)
9. Future: Admin audit logs with timeline view
10. Future: 2FA for super admin accounts

---

**Documentation Created:** 2025-01-01
**Last Updated:** 2025-01-01
**Version:** 1.0.0
