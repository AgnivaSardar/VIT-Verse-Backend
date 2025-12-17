export interface Report {
    reportID: bigint;
    reporterID: bigint;
    reportedUserID: bigint;
    vidID: bigint;
    commID: bigint;
    reason: string;
    status: 'open' | 'in_review' | 'resolved' | 'dismissed';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateReportRequest {
    reporterID: bigint;
    reportedUserID: bigint;
    vidID?: bigint;
    commID?: bigint;
    reason: string;
}

export interface UpdateReportRequest {
    status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
    reason?: string;
}
