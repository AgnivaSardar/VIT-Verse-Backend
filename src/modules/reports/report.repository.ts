import { prisma } from "../../config/prisma.js";

export async function getReportByID(id: bigint) {
  return prisma.reports.findUnique({
    where: { reportID: id },
  });
}

export async function createReport(data: {
  reporterID: bigint;
  reportedUserID: bigint;
    vidID?: bigint;
    commID?: bigint;
    reason: string;
}) {
    return prisma.reports.create({
        data: {
            reporterID: data.reporterID,
            reportedUserID: data.reportedUserID,
            vidID: data.vidID,
            commID: data.commID,
            reason: data.reason,
        },
    });
}

export async function updateReport(id: bigint, data: {
    status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
    reason?: string;
}) {
  return prisma.reports.update({
    where: { reportID: id },
    data: data,
  });
}

export async function deleteReport(id: bigint) {
  return prisma.reports.delete({
    where: { reportID: id },
  });
}

