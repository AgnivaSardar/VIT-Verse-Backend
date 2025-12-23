# Storage Configuration Guide

## Overview
Your VIT-Verse backend is now configured to use **AWS S3 + CloudFront** for ALL media storage and delivery:
- ✅ **Videos** → S3 + CloudFront
- ✅ **Thumbnails** → S3 + CloudFront  
- ✅ **Channel Logos** → S3 + CloudFront

## What's Configured

### 1. **AWS S3 Storage**
- **Bucket**: `vit-verse-videos-agniva`
- **Region**: `ap-south-1` (Mumbai)
- **Purpose**: Primary storage for all media files
- **Features**:
  - Server-side AES-256 encryption
  - MD5 checksum validation
  - Custom metadata (uploader, title, timestamps)
  - Organized folder structure:
    - Videos: `videos/{userID}/{timestamp}-{hash}.{ext}`
    - Thumbnails: `thumbnails/{userID}/{vidID}-{timestamp}-{hash}.jpg`
    - Channel Logos: `channel-logos/{userID}/{timestamp}-{hash}.{ext}`

### 2. **AWS CloudFront CDN**
- **Distribution URL**: `https://d3itybp34u69n5.cloudfront.net`
- **Purpose**: Fast global content delivery for all media
- **Benefits**:
  - Reduced S3 bandwidth costs
  - Lower latency for users worldwide
  - Edge caching for better performance
  - HTTPS by default
  - Single CDN for videos, thumbnails, and logos

### 3. **Supabase Storage** (Optional Backup)
- **Bucket**: `vit-verse-files`
- **URL**: `https://hwurfozhizrhzkcfcdrq.supabase.co`
- **Purpose**: Alternative storage for thumbnails or small files
- **Status**: Configured but not actively used yet

### 4. **Local Storage** (Development Fallback)
- **Directory**: `./uploads`
- **Purpose**: Development and testing
- **Note**: Switch to S3 by setting `STORAGE_TYPE=s3` in `.env`

## How It Works

### Video Upload Flow (S3 Mode)

```
1. User uploads video → Backend receives file
2. File is temporarily stored in memory/disk
3. Backend uploads to S3: videos/{userID}/{timestamp}-{hash}.mp4
4. S3 returns success
5. Backend stores metadata in PostgreSQL:
   - s3KeyOriginal: S3 object key
   - s3Bucket: Bucket name
   - storageType: 's3'
6. CloudFront URL is generated: https://d3itybp34u69n5.cloudfront.net/videos/...
7. Thumbnail generated locally (ffmpeg)
8. Thumbnail uploaded to S3: thumbnails/{userID}/{vidID}-{timestamp}.jpg
9. Thumbnail CloudFront URL saved to database
10. Frontend receives CloudFront URLs for video + thumbnail
11. Temp files deleted from backend
```

### Channel Logo Upload Flow (S3 Mode)

```
1. User uploads logo → Backend receives via multer (memoryStorage)
2. Logo buffer uploaded to S3: channel-logos/{userID}/{timestamp}-{hash}.{ext}
3. CloudFront URL generated and saved to database
4. Frontend receives CloudFront URL for logo
5. Old logo deleted from S3 if updating
```

### Video Playback Flow

```
1. Frontend requests video details from backend API
2. Backend decorates video with CloudFront URLs:
   - Video: CloudFront URL (if storageType='s3')
   - Thumbnail: CloudFront URL (if starts with http)
   - Logo: CloudFront URL (if starts with http)
3. Frontend <video> player and <img> tags load from CloudFront
4. CloudFront caches media at edge locations
5. Users get fast playback from nearest edge
```

## Environment Variables

### Required for S3/CloudFront
```env
STORAGE_TYPE=s3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID={}
AWS_SECRET_ACCESS_KEY={}
S3_BUCKET_NAME=vit-verse-videos-agniva
AWS_CLOUDFRONT_URL=https://d3itybp34u69n5.cloudfront.net
```

### Required for Supabase (Optional)
```env
SUPABASE_ENABLED=true
SUPABASE_URL=https://hwurfozhizrhzkcfcdrq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_STORAGE_BUCKET=vit-verse-files
```

## Code Changes Made

### 1. `src/config/s3.ts`
- ✅ Added `getS3PublicUrl()` - Returns CloudFront URL if configured
- ✅ Updated `uploadToS3()` - Returns public CloudFront URL instead of s3:// URI
- ✅ Added `isS3Configured()` - Check if credentials are set

### 2. `src/config/supabase.ts` (NEW)
- ✅ Created Supabase client wrapper
- ✅ `uploadToSupabase()` - Upload files to Supabase Storage
- ✅ `getSupabasePublicUrl()` - Get public URLs
- ✅ `deleteFromSupabase()` - Delete files
- ✅ `getSupabaseSignedUrl()` - Temporary private access URLs

### 3. `src/modules/videos/video.service.ts`
- ✅ Updated `createVideo()` - Store CloudFront URL in database
- ✅ Added `uploadThumbnailToS3()` - Upload generated/custom thumbnails to S3
- ✅ Import `getS3PublicUrl` and thumbnail upload helpers
- ✅ Log CDN URLs after upload for debugging
- ✅ Clean up local temp files after S3 upload

### 4. `src/modules/videos/video.controller.ts`
- ✅ Updated `decorateVideoMedia()` - Use CloudFront URLs for S3 videos and images
- ✅ Updated `uploadVideoHandler()` - Upload thumbnails to S3 after generation
- ✅ Check `storageType='s3'` to determine URL strategy
- ✅ Fallback to local URLs for old videos

### 5. `src/modules/channels/channel.routes.ts`
- ✅ Changed to `multer.memoryStorage()` for S3 upload (no local disk storage)
- ✅ Increased file size limit to 10MB for logos

### 6. `src/modules/channels/channel.controller.ts`
- ✅ Added S3 upload logic for channel logos (create + update)
- ✅ Generate S3 keys: `channel-logos/{userID}/{timestamp}-{hash}.{ext}`
- ✅ Return CloudFront URLs for logos

### 7. `src/modules/channels/channel.service.ts`
- ✅ Added S3 logo deletion in `deleteChannel()`
- ✅ Added S3 old logo deletion in `updateChannelService()`
- ✅ Extract S3 key from CloudFront URL and delete from bucket
- ✅ Fallback to local file deletion for backwards compatibility

### 8. `.env`
- ✅ Changed `STORAGE_TYPE=s3` (was 'local')
- ✅ Fixed AWS region consistency
- ✅ Added CloudFront URL

## Testing

### 1. Check Configuration
```bash
# In backend directory
node -e "console.log(require('./src/config/s3').isS3Configured())"
# Should output: true
```

### 2. Upload Test Video
```bash
curl -X POST http://localhost:5000/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@test-video.mp4" \
  -F "title=Test Upload" \
  -F "visibility=public"
```

### 3. Verify CloudFront URL
- Check backend logs for: `📡 CDN URL: https://d3itybp34u69n5.cloudfront.net/videos/...`
- Frontend should receive CloudFront URL in API response
- Video player should load from CloudFront

### 4. Check S3 Console
- Go to: https://s3.console.aws.amazon.com/s3/buckets/vit-verse-videos-agniva
- Navigate to `videos/{userID}/` folder
- Verify file exists and metadata is correct

## Switching Between Local and S3

### Use Local Storage (Development)
```env
STORAGE_TYPE=local
```
- Videos stored in `./uploads/`
- Served directly by Express static middleware
- No AWS charges

### Use S3 Storage (Production)
```env
STORAGE_TYPE=s3
```
- Videos stored in S3 bucket
- Served via CloudFront CDN
- Better performance, scalability
- AWS charges apply

## Cost Optimization Tips

1. **Use CloudFront** (not direct S3)
   - CloudFront bandwidth is cheaper than S3
   - Reduces S3 GET requests
   - Caches at edge = faster + cheaper

2. **Set Proper Cache Headers**
   - Videos: `Cache-Control: max-age=31536000` (1 year)
   - Already configured in `uploadToS3()`

3. **Enable S3 Lifecycle Policies**
   - Move old videos to Glacier after 90 days
   - Delete temp/failed uploads after 7 days

4. **Monitor CloudFront Usage**
   - Check AWS Cost Explorer monthly
   - Set billing alerts for $10, $50, $100

## Security

### S3 Bucket Permissions
- ✅ Private by default
- ✅ Public-read only for `visibility='public'` videos
- ✅ Access via CloudFront (not direct S3)
- ✅ Server-side encryption enabled

### CloudFront
- ✅ HTTPS only
- ✅ Origin Access Identity (OAI) recommended
- ⚠️ TODO: Configure signed URLs for private videos

### Credentials
- ✅ IAM user with S3-only permissions
- ⚠️ Keep `.env` out of Git (already in `.gitignore`)
- ⚠️ Rotate keys quarterly

## Troubleshooting

### Video Upload Fails
```
Error: S3 upload failed: Access Denied
```
**Fix**: Check IAM permissions for S3 bucket

### Videos Not Playing
```
Error: CORS policy blocked
```
**Fix**: Configure S3/CloudFront CORS headers
```json
{
  "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

### CloudFront Not Serving Files
```
Error: 403 Forbidden from CloudFront
```
**Fix**: 
1. Check CloudFront distribution is deployed (can take 15-20 min)
2. Verify Origin Access Identity (OAI) permissions
3. Check S3 bucket policy allows CloudFront

### High AWS Costs
- Enable CloudFront caching (TTL > 3600s)
- Use S3 Lifecycle policies
- Consider compression (H.264 instead of uncompressed)
- Set CloudFront price class to "Use Only North America and Europe" if users are regional

## Cloudflare (Skipped for Now)

You mentioned wanting to skip Cloudflare initially. Here's when to add it:

### When to Add Cloudflare
- Need additional DDoS protection
- Want global DNS management
- Need rate limiting at edge
- Want to add another caching layer
- Ready to migrate domain to Cloudflare

### How to Add Later
1. Point domain to Cloudflare nameservers
2. Add CNAME: `cdn.yourdomain.com` → `d3itybp34u69n5.cloudfront.net`
3. Enable Cloudflare proxy (orange cloud)
4. Configure Page Rules for caching
5. Update `.env`: `CLOUDFLARE_ENABLED=true`

## Next Steps

1. ✅ **Configuration complete**
2. ✅ **S3 + CloudFront active for ALL media**
3. ✅ **Backend running in S3 mode**
4. ⏳ **Test uploads:**
   - Upload a video → Check for CloudFront video URL
   - Verify thumbnail generation → Check for CloudFront thumbnail URL
   - Create/update channel → Check for CloudFront logo URL
5. ⏳ **Verify S3 Console:**
   - Videos in `videos/{userID}/` folder
   - Thumbnails in `thumbnails/{userID}/` folder
   - Logos in `channel-logos/{userID}/` folder
6. ⏳ **Monitor CloudFront cache hits**
7. ⏳ **Monitor first AWS bill**
8. ⏳ **(Optional)** Add Cloudflare later for additional security
9. ⏳ **(Optional)** Configure signed URLs for private videos

## Current Status

✅ **COMPLETE - All media now uses S3 + CloudFront:**

**Videos:**
- Upload: Memory → S3 bucket → CloudFront URL
- Playback: CloudFront CDN
- Path: `videos/{userID}/{timestamp}-{hash}.mp4`

**Thumbnails:**
- Generation: ffmpeg locally → buffer
- Upload: Buffer → S3 bucket → CloudFront URL
- Display: CloudFront CDN
- Path: `thumbnails/{userID}/{vidID}-{timestamp}-{hash}.jpg`

**Channel Logos:**
- Upload: Memory storage → S3 bucket → CloudFront URL
- Display: CloudFront CDN
- Path: `channel-logos/{userID}/{timestamp}-{hash}.{ext}`
- Delete: Old logos removed from S3 on update/delete

**Supabase:**
- Status: Configured but not in use
- Available for future features (real-time, vector DB, etc.)

## Support

- AWS S3 Docs: https://docs.aws.amazon.com/s3/
- CloudFront Docs: https://docs.aws.amazon.com/cloudfront/
- Supabase Docs: https://supabase.com/docs/guides/storage
- Contact: agniva.sardar2024@vitstudent.ac.in
