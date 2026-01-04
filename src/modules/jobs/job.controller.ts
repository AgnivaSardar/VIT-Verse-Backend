import type { Request, Response } from 'express';
// Adjust the import to match the actual export from job.service
import * as jobService from './job.service.js';

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) { 
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}
export const createTranscodeJob = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body;
    await jobService.createTranscodeJobService(payload);
    res.status(201).json({ message: 'Transcode job created successfully' });
});

export const JobController = {
    createTranscodeJob,
};
