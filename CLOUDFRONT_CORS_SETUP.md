# CloudFront CORS Configuration

## Issue
CORS is configured on S3, but CloudFront is caching responses without CORS headers.

## Solution
Add CORS headers to CloudFront distribution.

## Steps

### Option 1: CloudFront Response Headers Policy (Recommended)

1. **Go to CloudFront Console**
   - https://console.aws.amazon.com/cloudfront/v4/home

2. **Find Your Distribution**
   - Distribution ID: Find yours (starts with E...)
   - Domain: `d3itybp34u69n5.cloudfront.net`

3. **Create Response Headers Policy**
   - Go to "Policies" → "Response headers"
   - Click "Create policy"
   - Name: `vit-verse-cors-policy`

4. **Configure CORS Settings**
   - **Access control allow origins**: 
     - Add: `http://localhost:5173`
     - Add: `http://localhost:3000`
     - Add: `http://localhost:3001`
   - **Access control allow methods**: GET, HEAD
   - **Access control allow headers**: All
   - **Access control expose headers**: ETag, Content-Length, Content-Type
   - **Access control max age**: 3600

5. **Attach Policy to Behavior**
   - Go back to your distribution
   - Edit the default behavior
   - Under "Response headers policy", select `vit-verse-cors-policy`
   - Save changes

6. **Wait for Deployment** (5-10 minutes)
   - Status will show "In Progress" then "Deployed"

### Option 2: Quick Fix - Add Cache Behavior with Origin Request Policy

If above is too complex, try this simpler approach:

1. **Go to your CloudFront Distribution**
2. **Behaviors** tab
3. **Edit** the default behavior
4. **Cache key and origin requests**:
   - Select "CachingOptimized"
   - Origin request policy: "CORS-CustomOrigin" (if available)
5. **Save changes**

### Option 3: Invalidate CloudFront Cache (Temporary)

While waiting for CORS headers:

```bash
# Get your distribution ID from CloudFront console
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/videos/*" "/thumbnails/*"
```

Or use the console:
1. Go to CloudFront distribution
2. "Invalidations" tab
3. Create invalidation with paths: `/videos/*` and `/thumbnails/*`

### Option 4: Use S3 Direct Access (Development Only)

For now, temporarily bypass CloudFront and use S3 direct URLs:

**Update backend/.env**:
```env
# Comment out CloudFront temporarily
# AWS_CLOUDFRONT_URL=https://d3itybp34u69n5.cloudfront.net
```

This will make the backend return S3 direct URLs instead of CloudFront URLs.
You'll also need to make the S3 bucket publicly accessible (not recommended for production).

## Recommended Path

**For Development**: Use Option 1 or 2 above to configure CloudFront CORS properly.

**For Production**: 
- Keep CloudFront with proper CORS headers
- Add your production domain to allowed origins
- Enable signed URLs for private videos

## Current Status

✅ S3 CORS configured correctly
✅ Video uploaded and accessible
❌ CloudFront caching responses without CORS headers
🔧 **Action**: Configure CORS on CloudFront distribution (Option 1 above)

## Quick Test After Configuration

Once CloudFront is configured, test with:

```powershell
Invoke-WebRequest `
    -Uri "https://d3itybp34u69n5.cloudfront.net/videos/1/1766505984154-dbcb9fa560e0bdd7.mp4" `
    -Method Head `
    -Headers @{"Origin"="http://localhost:5173"} `
    -UseBasicParsing | 
    Select-Object -ExpandProperty Headers | 
    Where-Object { $_.Key -like "*Access-Control*" }
```

You should see `Access-Control-Allow-Origin: http://localhost:5173`
