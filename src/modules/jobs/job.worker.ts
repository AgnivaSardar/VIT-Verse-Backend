// src/modules/jobs/job.worker.ts
import { prisma } from '../../config/prisma';
import { jobRepository } from './job.repository';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

async function processTranscodeJob(job: any): Promise<void> {
  const payload = job.payload;
  const inputPath = payload.inputPath;
  const outputPath = payload.outputPath;
    try {
    // Example ffmpeg command to transcode video
    const command = `ffmpeg -i ${inputPath} -vcodec h264 -acodec mp2 ${outputPath}`;
    await execPromise(command);
    // Update job status to COMPLETED
    await prisma.jobs.update({
      where: { jobID: job.jobID },
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    // Update job status to FAILED
    await prisma.jobs.update({
      where: { jobID: job.jobID },
      data: { status: 'FAILED' },
    });
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

