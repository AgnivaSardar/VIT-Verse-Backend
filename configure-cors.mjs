import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function configureCORS() {
  try {
    console.log('🔧 Configuring CORS for S3 bucket...');
    
    const command = new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    
    console.log('✅ CORS configuration applied successfully!');
    console.log('\nCORS Rules:');
    console.log(JSON.stringify(corsConfiguration, null, 2));
    console.log('\n📝 Next steps:');
    console.log('1. Hard refresh your browser (Ctrl+Shift+R)');
    console.log('2. Try playing the video again');
    console.log('3. Check browser console - CORS error should be gone!');
  } catch (error) {
    console.error('❌ Failed to configure CORS:', error);
    console.error('\nPlease configure CORS manually via AWS Console:');
    console.error('https://s3.console.aws.amazon.com/s3/buckets/vit-verse-videos-agniva?region=ap-south-2&tab=permissions');
  }
}

configureCORS();
