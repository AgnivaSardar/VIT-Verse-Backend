# Video Upload Compression & Scaling

## Overview
All uploaded videos are automatically compressed and scaled before storage to optimize file size and maintain good quality. This is handled server-side using ffmpeg.

## Default Compression Settings
The following defaults are used (see `backend/src/config/videoCompression.ts`):
- **maxWidth**: 1280
- **maxHeight**: 720
- **videoBitrate**: '1500k'
- **crf**: 23
- **preset**: 'medium'

## Customizing Compression Per Upload
You can override these defaults by including any of the following fields in your upload request body:
- `maxWidth` (number): Maximum video width (pixels)
- `maxHeight` (number): Maximum video height (pixels)
- `videoBitrate` (string): Target video bitrate (e.g., '1000k', '2M')
- `crf` (number): Constant Rate Factor (lower = better quality, higher = smaller size)
- `preset` (string): ffmpeg preset (e.g., 'ultrafast', 'fast', 'medium', 'slow')

### Example (multipart/form-data)
```
POST /api/videos/upload
Content-Type: multipart/form-data

Fields:
  video: <file>
  title: My Video
  ...other fields...
  maxWidth: 854
  maxHeight: 480
  videoBitrate: 800k
  crf: 28
  preset: fast
```

If a field is omitted, the default from config is used.

## How It Works
- The server compresses/scales the video before uploading to S3 or local storage.
- If compression fails, the original file is used as a fallback.
- All temp files are cleaned up after processing.

## Notes
- Compression is performed synchronously during upload.
- Ensure ffmpeg is installed and available in the server environment.
- For best results, use MP4/H.264 input files.
