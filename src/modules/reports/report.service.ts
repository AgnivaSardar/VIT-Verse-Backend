import { AppError } from "../../common/errors.js";
import * as reportRepo from "./report.repository.js";
import { CreateReportRequest, UpdateReportRequest } from "./report.types.js";

export async function createReport(data: CreateReportRequest): Promise<void> {
    // Additional validation can be added here if needed
    await reportRepo.createReport(data);
}
export async function getReportByID(reportID: bigint) {
    const report = await reportRepo.getReportByID(reportID);
    if (!report) {
        throw new AppError('Report not found', 404);
    }
    return report;
}

export async function deleteReport(reportID: bigint): Promise<void> {
    const report = await reportRepo.getReportByID(reportID);
    if (!report) {
        throw new AppError('Report not found', 404);
    }
    await reportRepo.deleteReport(reportID);
}

export async function updateReport(reportID: bigint, data: UpdateReportRequest): Promise<void> {
    const report = await reportRepo.getReportByID(reportID);
    if (!report) {
        throw new AppError('Report not found', 404);
    }
    await reportRepo.updateReport(reportID, data);
}

export function createReportService(input: CreateReportRequest) {
    throw new Error('Function not implemented.');
}
export function getReportService(reportID: bigint) {
    throw new Error('Function not implemented.');
}
export function deleteReportService(reportID: bigint) {
    throw new Error('Function not implemented.');
}
export function updateReportService(reportID: bigint, input: UpdateReportRequest) {
    throw new Error('Function not implemented.');
}
