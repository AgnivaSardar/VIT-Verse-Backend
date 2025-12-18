// src/modules/jobs/job.repository.ts
import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const jobRepository = {
  createTranscodeJob(payload: object) {
    return prisma.jobs.create({
      data: {
        type: 'TRANSCODE_VIDEO',
        payload: payload as Prisma.JsonObject,
        status: 'PENDING',
        attempts: 0,
      },
    });
  },
};
