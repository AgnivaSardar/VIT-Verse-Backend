# AWS S3 Video Upload Setup Guide

## Overview
This project now supports uploading videos directly to AWS S3 with server-side encryption, metadata, and presigned URLs for secure streaming.

## Features
- ✅ **Server-side encryption (AES256)** for all uploaded videos
- ✅ **Metadata tracking** (original filename, uploader, upload date, video details)
- ✅ **MD5 checksums** for data integrity verification
- ✅ **Presigned URLs** for secure temporary access (1 hour expiry)
- ✅ **Automatic cleanup** of local temp files after S3 upload
- ✅ **Connection pool optimization** for handling concurrent uploads
- ✅ **Caching** for faster API responses

## Prerequisites
1. AWS Account
2. S3 Bucket created
3. IAM User with S3 access

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **Create bucket**
3. Configure:
   - **Bucket name**: `vit-verse-videos` (must be globally unique)
   - **Region**: `ap-south-1` (Mumbai) or your preferred region
   - **Block Public Access**: Keep enabled (we'll use presigned URLs)
   - **Bucket Versioning**: Optional (recommended for backups)
   - **Default encryption**: Enable with **SSE-S3** (AES-256)
4. Click **Create bucket**

## Step 2: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add users**
3. User name: `vit-verse-uploader`
4. Access type: **Programmatic access** (for API access)
5. Click **Next: Permissions**
6. Attach policies:
   - Create inline policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:HeadObject"
      ],
      "Resource": [
        "arn:aws:s3:::vit-verse-videos",
        "arn:aws:s3:::vit-verse-videos/*"
      ]
    }
  ]
}
```

7. Complete user creation and **save the credentials**:
   - Access Key ID
   - Secret Access Key

## Step 3: Configure Environment Variables

Update your `.env` file in the backend:

```env
# Storage Configuration
STORAGE_TYPE=s3
# Options: 'local' for disk storage, 's3' for AWS S3

# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
S3_BUCKET_NAME=vit-verse-videos
S3_PUBLIC_URL=https://vit-verse-videos.s3.ap-south-1.amazonaws.com

# Video Upload Limits
MAX_VIDEO_SIZE_MB=500
ALLOWED_VIDEO_FORMATS=mp4,mov,avi,wmv,flv,webm,mkv
```

**Important**: 
- Replace `your-access-key-id-here` and `your-secret-access-key-here` with your actual IAM credentials
- Never commit `.env` file to version control
- Use different credentials for development and production

## Step 4: Test S3 Upload

1. Start the backend:
```powershell
cd backend
npm run dev
```

2. Upload a video through the frontend or API:
```bash
POST /api/videos/upload
Content-Type: multipart/form-data

{
  "video": [file],
  "title": "Test Video",
  "description": "Testing S3 upload"
}
```

3. Check your S3 bucket - you should see the video under `videos/{userID}/{timestamp}-{hash}.ext`

## Step 5: Video Streaming

Videos are served via presigned URLs for security:

```bash
GET /api/videos/:id/stream
```

Response:
```json
{
  "streamUrl": "https://vit-verse-videos.s3.ap-south-1.amazonaws.com/videos/...",
  "expiresIn": 3600
}
```

The URL is valid for 1 hour and automatically expires for security.

## Security Features

### 1. Server-Side Encryption
All videos are encrypted at rest with AES-256:
```typescript
ServerSideEncryption: 'AES256'
```

### 2. Presigned URLs
Videos are never publicly accessible. Each stream request generates a temporary URL:
- Valid for 1 hour
- Cannot be shared permanently
- Automatic expiration

### 3. Metadata Tracking
Every upload includes:
- Original filename
- MIME type
- File size
- Uploader ID
- Video ID
- Upload timestamp
- MD5 checksum

### 4. File Size Validation
```typescript
MAX_VIDEO_SIZE_MB=500  // Configurable limit
```

### 5. Content Type Validation
Only video files are accepted:
```typescript
ContentType: mimeType || 'video/mp4'
```

## Cost Optimization

### S3 Storage Pricing (ap-south-1 Mumbai region):
- First 50 TB/month: $0.023 per GB
- Example: 100 videos × 100MB each = 10GB = ~$0.23/month

### S3 Request Pricing:
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.004 per 10,000 requests

### Data Transfer:
- First 10 TB/month to internet: $0.109 per GB
- CloudFront CDN recommended for production

### Cost Reduction Tips:
1. **Enable S3 Intelligent-Tiering** for automatic cost savings
2. **Use CloudFront CDN** for cheaper data transfer
3. **Set lifecycle policies** to move old videos to Glacier
4. **Enable compression** for smaller file sizes

## Switching Between Local and S3

To use local storage:
```env
STORAGE_TYPE=local
```

To use S3:
```env
STORAGE_TYPE=s3
```

No code changes required - the system automatically handles both.

## Troubleshooting

### Error: "S3 is not properly configured"
- Check `.env` file has all required AWS variables
- Verify IAM credentials are correct
- Ensure S3 bucket exists and region matches

### Error: "Access Denied"
- Verify IAM policy includes required permissions
- Check bucket name matches environment variable
- Ensure credentials are for the correct AWS account

### Error: "File size exceeds maximum"
- Check `MAX_VIDEO_SIZE_MB` in `.env`
- Verify multer file size limit in `video.routes.ts`

### Videos not playing
- Check presigned URL expiry (1 hour default)
- Verify CORS settings on S3 bucket
- Ensure browser supports video format

## Production Checklist

- [ ] Use separate S3 bucket for production
- [ ] Create dedicated IAM user for production
- [ ] Enable S3 bucket versioning
- [ ] Set up S3 lifecycle policies
- [ ] Configure CloudFront CDN
- [ ] Enable S3 access logging
- [ ] Set up CloudWatch alarms
- [ ] Rotate IAM credentials regularly
- [ ] Use AWS Secrets Manager for credentials
- [ ] Enable MFA for IAM users

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Pricing Calculator](https://calculator.aws/#/addService/S3)
