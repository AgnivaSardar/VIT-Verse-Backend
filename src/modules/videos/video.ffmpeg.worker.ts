// src/modules/videos/video.ffmpeg.worker.ts
import { prisma } from '../../config/prisma.js';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function processTranscodeJob(jobID: bigint) {
  const job = await prisma.jobs.findUnique({ where: { jobID } });
  if (!job) return;

  const payload = job.payload as any;
  const vidID = BigInt(payload.vidID);
  const filePath = payload.filePath as string;

  try {
    await prisma.jobs.update({
      where: { jobID },
      data: { status: 'RUNNING', attempts: { increment: 1 } },
    });

    // TODO: Run FFmpeg commands here to generate multiple resolutions + thumbnail.
    // Example (very simplified, replace with real commands):
    // await execAsync(`ffmpeg -i ${filePath} -c:v libx264 -preset fast -crf 23 output_720p.mp4`);

    // TODO: Upload processed outputs to Cloudflare Stream / S3.

    await prisma.video.update({
      where: { vidID },
      data: {
        processingStatus: 'READY',
        // set duration, resolution, sizeBytes, cloudflareVID, etc.
      },
    });

    await prisma.jobs.update({
      where: { jobID },
      data: { status: 'DONE' },
    });
  } catch (err) {
    console.error('Error processing transcode job', jobID, err);
    await prisma.jobs.update({
      where: { jobID },
      data: { status: 'FAILED' },
    });
  }
}

// Example polling loop (run in separate process)
async function pollJobs() {
  while (true) {
    const job = await prisma.jobs.findFirst({
      where: { type: 'TRANSCODE_VIDEO', status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (job) {
      await processTranscodeJob(job.jobID);
    } else {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Only call pollJobs() from a separate worker entrypoint, not from main server.
