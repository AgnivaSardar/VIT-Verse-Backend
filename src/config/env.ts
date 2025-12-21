import dotenv from 'dotenv';
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbUrl: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/vit_verse_db',
  
  // Storage
  storageType: (process.env.STORAGE_TYPE || 'local') as 'local' | 's3',
  maxVideoSizeMB: Number(process.env.MAX_VIDEO_SIZE_MB) || 500,
  
  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.S3_BUCKET_NAME || '',
  },
  
  // Security
  corsOrigins: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
  
  // Node environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};
