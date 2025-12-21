// src/config/s3.ts
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET = process.env.S3_BUCKET_NAME!;
const MAX_FILE_SIZE = (Number(process.env.MAX_VIDEO_SIZE_MB) || 500) * 1024 * 1024;

if (!BUCKET) {
  console.warn('⚠️  S3_BUCKET_NAME not configured. S3 uploads will fail.');
}

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface UploadMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  videoID?: string;
  title?: string;
  description?: string;
}

export interface UploadToS3Options {
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  metadata: UploadMetadata;
  contentType?: string;
  isPublic?: boolean;
}

/**
 * Upload file to S3 with security headers, encryption, and metadata
 */
export async function uploadToS3(options: UploadToS3Options): Promise<string> {
  const { key, body, metadata, contentType, isPublic = false } = options;

  // Validate file size
  const size = Buffer.isBuffer(body) ? body.length : 
               body instanceof Uint8Array ? body.length : 
               typeof body === 'string' ? Buffer.byteLength(body) : 0;
  
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed ${process.env.MAX_VIDEO_SIZE_MB}MB`);
  }

  // Generate checksum for data integrity
  const checksum = crypto.createHash('md5').update(body as any).digest('base64');

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType || 'video/mp4',
    ContentMD5: checksum,
    // Server-side encryption
    ServerSideEncryption: 'AES256',
    // Metadata (custom headers with x-amz-meta- prefix)
    Metadata: {
      'original-name': metadata.originalName,
      'mime-type': metadata.mimeType,
      'size': metadata.size.toString(),
      'uploaded-by': metadata.uploadedBy,
      'video-id': metadata.videoID || '',
      'title': metadata.title || '',
      'upload-date': new Date().toISOString(),
    },
    // Security headers
    CacheControl: 'max-age=31536000', // 1 year cache
    // ACL for public or private access
    ...(isPublic ? { ACL: 'public-read' } : {}),
  });

  try {
    await s3Client.send(cmd);
    return `s3://${BUCKET}/${key}`;
  } catch (error: any) {
    console.error('🔴 S3 Upload Error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Generate presigned URL for secure temporary access
 */
export async function getSignedDownloadUrl(
  key: string, 
  expiresInSeconds = 3600,
  downloadFilename?: string
): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ...(downloadFilename ? { 
      ResponseContentDisposition: `attachment; filename="${downloadFilename}"` 
    } : {}),
  });
  
  try {
    return await getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
  } catch (error: any) {
    console.error('🔴 S3 Presigned URL Error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Generate presigned URL for direct browser upload (for large files)
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });
  
  try {
    return await getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
  } catch (error: any) {
    console.error('🔴 S3 Presigned Upload URL Error:', error);
    throw new Error(`Failed to generate presigned upload URL: ${error.message}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const cmd = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  try {
    await s3Client.send(cmd);
  } catch (error: any) {
    console.error('🔴 S3 Delete Error:', error);
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

/**
 * Get file metadata from S3
 */
export async function getS3Metadata(key: string): Promise<any> {
  const cmd = new HeadObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  try {
    const response = await s3Client.send(cmd);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
      etag: response.ETag,
    };
  } catch (error: any) {
    console.error('🔴 S3 Metadata Error:', error);
    throw new Error(`Failed to get S3 metadata: ${error.message}`);
  }
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
