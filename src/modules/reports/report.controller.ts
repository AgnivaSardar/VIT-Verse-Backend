import { Request, Response } from "express";
import * as reportService from "./report.service";
import { CreateReportRequest, UpdateReportRequest } from "./report.types";
import { toJSON } from "../../common/utils";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}
export const createReport = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateReportRequest = req.body;
    await reportService.createReport(input);
    res.status(201).json({ message: "Report created successfully" });
});

export const getReport = asyncHandler(async (req: Request, res: Response) => {
    const reportID = BigInt(req.params.reportID);
    const report = await reportService.getReportByID(reportID);
    res.json(toJSON(report));
});

export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
    const reportID = BigInt(req.params.reportID);
    await reportService.deleteReport(reportID);
    res.json({ message: "Report deleted successfully" });
});

export const updateReport = asyncHandler(async (req: Request, res: Response) => {
    const reportID = BigInt(req.params.reportID);
    const input: UpdateReportRequest = req.body;
    await reportService.updateReport(reportID, input);
    res.json({ message: "Report updated successfully" });
});

export const ReportController = {
    createReport,
    getReport,
    deleteReport,
    updateReport,
};