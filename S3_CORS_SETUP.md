# S3 CORS Configuration for Video Playback

## Problem
Videos are uploaded to S3 and accessible via CloudFront, but the browser blocks playback due to missing CORS headers.

## Solution
Configure CORS (Cross-Origin Resource Sharing) on your S3 bucket to allow video playback from your frontend.

## Steps to Fix

### Option 1: Configure CORS via AWS Console (Recommended)

1. **Go to AWS S3 Console**
   - Navigate to: https://s3.console.aws.amazon.com/s3/buckets/vit-verse-videos-agniva
   - Or search for "S3" in AWS Console

2. **Select Your Bucket**
   - Click on `vit-verse-videos-agniva`

3. **Configure CORS**
   - Go to the **Permissions** tab
   - Scroll down to **Cross-origin resource sharing (CORS)**
   - Click **Edit**

4. **Add CORS Configuration**
   - Paste this JSON configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:3001",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Type"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

5. **Save Changes**
   - Click **Save changes**

6. **Test**
   - Refresh your frontend page
   - The video should now play!

### Option 2: Configure via AWS CLI

```bash
# Create a CORS configuration file
cat > cors-config.json << 'EOF'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:3001"
            ],
            "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
            "MaxAgeSeconds": 3600
        }
    ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
    --bucket vit-verse-videos-agniva \
    --cors-configuration file://cors-config.json \
    --region ap-south-2
```

### Option 3: Configure via PowerShell

```powershell
# Create CORS configuration
$corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:3001"
            ],
            "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
            "MaxAgeSeconds": 3600
        }
    ]
}
"@

# Save to file
$corsConfig | Out-File -FilePath cors-config.json -Encoding utf8

# Apply CORS configuration
aws s3api put-bucket-cors `
    --bucket vit-verse-videos-agniva `
    --cors-configuration file://cors-config.json `
    --region ap-south-2
```

## What This Does

- **AllowedOrigins**: Specifies which domains can access your S3 content
  - Currently set to `localhost` ports for development
  - Add your production domain when deploying (e.g., `https://vitvverse.com`)

- **AllowedMethods**: Allows GET and HEAD requests (read-only access)

- **AllowedHeaders**: Allows all headers in requests

- **ExposeHeaders**: Allows browser to access specific response headers

- **MaxAgeSeconds**: Browser caches CORS preflight for 1 hour

## Production Considerations

When deploying to production:

1. **Update AllowedOrigins** to include your production domain:
   ```json
   "AllowedOrigins": [
       "https://vitvverse.com",
       "https://www.vitvverse.com"
   ]
   ```

2. **Consider CloudFront CORS** (alternative approach):
   - Configure CloudFront to add CORS headers instead
   - Go to CloudFront → Your distribution → Behaviors
   - Edit the behavior and enable CORS headers

## Verification

After applying CORS configuration, verify it works:

```powershell
# Test CORS headers
Invoke-WebRequest -Uri "https://d3itybp34u69n5.cloudfront.net/videos/1/1766505984154-dbcb9fa560e0bdd7.mp4" `
    -Method Head `
    -Headers @{"Origin"="http://localhost:5173"} `
    -UseBasicParsing | Select-Object -ExpandProperty Headers
```

You should see `Access-Control-Allow-Origin: http://localhost:5173` in the response.

## Troubleshooting

### Video still not playing?

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check browser console**: Look for CORS errors
3. **Wait for CloudFront**: Cache may take 5-10 minutes to update
4. **Invalidate CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation \
       --distribution-id YOUR_DISTRIBUTION_ID \
       --paths "/*"
   ```

### CORS configuration not saving?

- Ensure your AWS credentials have `s3:PutBucketCORS` permission
- Check bucket policy doesn't deny CORS configuration

## Current Status

✅ Video uploaded to S3: `videos/1/1766505984154-dbcb9fa560e0bdd7.mp4`
✅ Thumbnail uploaded: `thumbnails/1/1-1766506401029-e864cb0938a9f962.jpg`
✅ CloudFront URL accessible: Status 200 OK
❌ CORS headers missing: Video blocked by browser
🔧 **Action Required**: Configure CORS as shown above

## Quick Fix (Console Method)

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/vit-verse-videos-agniva?region=ap-south-2&tab=permissions
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit"
4. Paste the JSON from above
5. Click "Save changes"
6. Refresh your frontend - video should play!
