import { Request, Response } from "express";
import * as viewsService from "./views.service.js";
import { CreateViewRequest } from "./views.types.js";
import { toJSON } from "../../common/utils.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const createView = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateViewRequest = req.body;
    await viewsService.createViewService(input);
    res.status(201).json({ message: "View created successfully" });
});

export const getView = asyncHandler(async (req: Request, res: Response) => {
    const viewID = (() => {
  const { viewID } = req.params;
  if (!viewID) {
    throw new AppError("viewID is required", 400);
  }
  return BigInt(viewID);
})()
;
    const view = await viewsService.getViewByID(viewID);
    res.json(toJSON(view));
});

export const updateView = asyncHandler(async (req: Request, res: Response) => {
    const viewID = (() => {
  const { viewID } = req.params;
  if (!viewID) {
    throw new AppError("viewID is required", 400);
  }
  return BigInt(viewID);
})()
;
    const input: Partial<{ watchTime?: number; ipAddress?: string; userAgent?: string; }> = req.body;
    await viewsService.updateViewService(viewID, input);
    res.json({ message: "View updated successfully" });
});

export const deleteView = asyncHandler(async (req: Request, res: Response) => {
    const viewID = (() => {
  const { viewID } = req.params;
  if (!viewID) {
    throw new AppError("viewID is required", 400);
  }
  return BigInt(viewID);
})()
;
    await viewsService.deleteViewService(viewID);
    res.json({ message: "View deleted successfully" });
});

export const listViews = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await viewsService.listViewsService(page, limit);
    res.json(toJSON(result));
});

export const ViewsController = {
    createView,
    getView,
    updateView,
    deleteView,
    listViews,
};
