import { Request, Response } from "express";
import * as reportService from "./report.service.js";
import { CreateReportRequest, UpdateReportRequest } from "./report.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

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
    const reportID = (() => {
  const { reportID } = req.params;
  if (!reportID) {
    throw new AppError("reportID is required", 400);
  }
  return BigInt(reportID);
})()
;
    const report = await reportService.getReportByID(reportID);
    res.json(toJSON(report));
});

export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
    const reportID = (() => {
  const { reportID } = req.params;
  if (!reportID) {
    throw new AppError("reportID is required", 400);
  }
  return BigInt(reportID);
})()
;
    await reportService.deleteReport(reportID);
    res.json({ message: "Report deleted successfully" });
});

export const updateReport = asyncHandler(async (req: Request, res: Response) => {
    const reportID = (() => {
  const { reportID } = req.params;
  if (!reportID) {
    throw new AppError("reportID is required", 400);
  }
  return BigInt(reportID);
})()
;
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
