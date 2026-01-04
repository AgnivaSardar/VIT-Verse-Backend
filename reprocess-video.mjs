import { PrismaClient } from '@prisma/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { uploadToS3 } from "./src/config/s3";
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();
const execFilePromise = util.promisify(execFile);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function downloadFromS3(bucket, key) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(cmd);
  const stream = response.Body;
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function computeDuration(filePath) {
  try {
    const { stdout } = await execFilePromise('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);
    const val = parseFloat(stdout.trim());
    return Number.isFinite(val) ? Math.round(val) : null;
  } catch (err) {
    console.warn('ffprobe failed:', err.message);
    return null;
  }
}

async function generateThumbnail(filePath, outputDir) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const base = path.basename(filePath).split('.')[0];
    const outName = `${base}-thumb.jpg`;
    const outPath = path.join(outputDir, outName);
    await execFilePromise('ffmpeg', ['-ss', '2', '-i', filePath, '-frames:v', '1', '-q:v', '2', outPath]);
    return outPath;
  } catch (err) {
    console.warn('ffmpeg failed:', err.message);
    return null;
  }
}

async function reprocessVideo(vidID) {
  console.log(`\n🔄 Reprocessing video ${vidID}...`);
  
  const video = await prisma.video.findUnique({
    where: { vidID: BigInt(vidID) },
    include: { channel: true }
  });
  
  if (!video) {
    console.error('❌ Video not found');
    return;
  }
  
  if (!video.s3Bucket || !video.s3KeyOriginal) {
    console.error('❌ Video not on S3');
    return;
  }
  
  // Redact S3 key in logs (show only the tail) to avoid leaking secrets
  const keyTail = video.s3KeyOriginal.slice(-12);
  console.log(`📥 Downloading from S3: bucket=${video.s3Bucket} key=*...${keyTail}`);
  const videoBuffer = await downloadFromS3(video.s3Bucket, video.s3KeyOriginal);
  
  const tempDir = path.join(process.cwd(), 'uploads', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const ext = video.s3KeyOriginal.split('.').pop();
  const tempVideoPath = path.join(tempDir, `temp-${vidID}-${Date.now()}.${ext}`);
  fs.writeFileSync(tempVideoPath, videoBuffer);
  console.log(`✅ Video downloaded to ${tempVideoPath}`);
  
  // Compute duration
  console.log('⏱️  Computing duration...');
  const duration = await computeDuration(tempVideoPath);
  if (duration) {
    await prisma.video.update({
      where: { vidID: BigInt(vidID) },
      data: { duration }
    });
    console.log(`✅ Duration: ${duration}s`);
  } else {
    console.warn('⚠️  Could not compute duration');
  }
  
  // Generate thumbnail
  console.log('🖼️  Generating thumbnail...');
  const thumbDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  const thumbPath = await generateThumbnail(tempVideoPath, thumbDir);
  
  if (thumbPath) {
    console.log('☁️  Uploading thumbnail to S3...');
    const thumbBuffer = fs.readFileSync(thumbPath);
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const s3Key = `thumbnails/${video.channel.userID}/${vidID}-${timestamp}-${randomHash}.jpg`;
    
    const publicUrl = await uploadToS3({
      key: s3Key,
      body: thumbBuffer,
      metadata: {
        originalName: path.basename(thumbPath),
        mimeType: 'image/jpeg',
        size: thumbBuffer.length,
        uploadedBy: video.channel.userID.toString(),
        videoID: vidID.toString(),
      },
      contentType: 'image/jpeg',
      isPublic: true,
    });
    
    // Save thumbnail record
    await prisma.image.create({
      data: {
        vidID: BigInt(vidID),
        imgURL: publicUrl,
        s3Key: s3Key,
        s3Bucket: process.env.S3_BUCKET_NAME || null,
        isPrimary: true,
      }
    });
    
    console.log(`✅ Thumbnail uploaded: ${publicUrl}`);
    
    // Cleanup
    fs.unlinkSync(thumbPath);
  } else {
    console.warn('⚠️  Could not generate thumbnail');
  }
  
  // Cleanup temp video
  fs.unlinkSync(tempVideoPath);
  console.log('🧹 Cleaned up temp files');
  
  console.log(`✅ Video ${vidID} reprocessed successfully!`);
}

const videoId = process.argv[2] || 1;
reprocessVideo(videoId)
  .then(() => {
    console.log('\n✅ Done!');
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
