// src/modules/jobs/job.service.ts
import { jobRepository } from './job.repository';
import { AppError } from '../../common/errors';

export async function createTranscodeJobService(payload: object): Promise<void> {
  try {
    await jobRepository.createTranscodeJob(payload);
  } catch (error) {
    throw new AppError('Failed to create transcode job', 500);
  }
}

