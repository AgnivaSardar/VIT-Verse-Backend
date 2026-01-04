// src/modules/jobs/job.worker.ts
import { prisma } from '../../config/prisma.js';
import { jobRepository } from './job.repository.js';

import { exec } from 'child_process';
import util from 'util';
import { setVideoProcessingProgress, clearVideoProcessingProgress } from '../videos/video.progress.util.js';

const execPromise = util.promisify(exec);

async function processTranscodeJob(job: any): Promise<void> {
  const payload = job.payload;
  // Expect userId and uploadId in payload for progress tracking
  const userId = payload.userId;
  const uploadId = payload.uploadId;
  const inputPath = payload.inputPath;
  const outputPath = payload.outputPath;
  try {
    // Set initial progress (start processing)
    if (userId && uploadId) {
      await setVideoProcessingProgress(userId, uploadId, { percent: 0, status: 'processing' });
    }
    // Example ffmpeg command to transcode video
    const command = `ffmpeg -i ${inputPath} -vcodec h264 -acodec mp2 ${outputPath}`;
    // Simulate progress updates (in real use, parse ffmpeg output for progress)
    if (userId && uploadId) {
      await setVideoProcessingProgress(userId, uploadId, { percent: 10, status: 'processing' });
    }
    await execPromise(command);
    if (userId && uploadId) {
      await setVideoProcessingProgress(userId, uploadId, { percent: 100, status: 'completed' });
    }
    // Update job status to COMPLETED
    await prisma.jobs.update({
      where: { jobID: job.jobID },
      data: { status: 'COMPLETED' },
    });
    // Cleanup progress key
    if (userId && uploadId) {
      setTimeout(() => clearVideoProcessingProgress(userId, uploadId), 60 * 5 * 1000); // Remove after 5 min
    }
  } catch (error) {
    // Update job status to FAILED
    await prisma.jobs.update({
      where: { jobID: job.jobID },
      data: { status: 'FAILED' },
    });
    if (userId && uploadId) {
      await setVideoProcessingProgress(userId, uploadId, { percent: 100, status: 'failed', error: (error as Error)?.message || 'Processing failed' });
    }
    console.error(`Failed to process job ${job.id}:`, error);
  }
}

export async function processPendingJobs(): Promise<void> {
  const pendingJobs = await prisma.jobs.findMany({
    where: { status: 'PENDING', type: 'TRANSCODE_VIDEO' },
  });
    for (const job of pendingJobs) {
    await processTranscodeJob(job);
  }
}

