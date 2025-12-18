import { AppError } from "../../common/errors";
import * as viewsRepo from "./views.repository";

import { CreateViewRequest, UpdateChannelRequest, ViewListResponse, ViewResponse } from "./views.types";
export async function createViewService(data: CreateViewRequest): Promise<void> {
    await viewsRepo.createView({
        ...data,
        ipAddress: data.ipAddress === null ? "" : data.ipAddress
    });
}
export async function getViewByID(viewID: bigint): Promise<ViewResponse> {
    const view = await viewsRepo.getViewByID(viewID);
    if (!view) {
        throw new AppError("View not found", 404);
    }
    if (view.userID === null) {
        throw new AppError("View userID is null", 500);
    }
    return { 
        ...view, 
        userID: view.userID, 
        watchTime: view.watchTime === null ? 0 : view.watchTime,
        userAgent: view.userAgent === null ? "" : view.userAgent
    };
}
export async function updateViewService(
    viewID: bigint,
    data: Partial<{ watchTime?: number; ipAddress?: string; userAgent?: string; }>
): Promise<void> {
    const view = await viewsRepo.getViewByID(viewID);
    if (!view) {
        throw new AppError("View not found", 404);
    }
    await viewsRepo.updateView(viewID, data);
}
export async function deleteViewService(viewID: bigint): Promise<void> {
    const view = await viewsRepo.getViewByID(viewID);
    if (!view) {
        throw new AppError("View not found", 404);
    }
    await viewsRepo.deleteView(viewID);
}
export async function listViewsService(page: number, limit: number): Promise<ViewListResponse> {
    const { views, totalViews } = await viewsRepo.listViews(page, limit);
    const transformedViews: ViewResponse[] = views.map((view: any): ViewResponse => {
        if (view.userID === null) {
            throw new AppError("View userID is null", 500);
        }
        return {
            viewID: view.viewID,
            vidID: view.vidID,
            userID: view.userID as bigint,
            watchedAt: view.watchedAt,
            watchTime: view.watchTime === null ? 0 : view.watchTime,
            ipAddress: view.ipAddress === null ? "" : view.ipAddress,
            userAgent: view.userAgent === null ? "" : view.userAgent
        };
    });
    return { views: transformedViews, totalViews };
}

