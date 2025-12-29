import { Request, Response } from "express";
import * as imageService from "./image.service";
import { CreateImageRequest, UpdateImageRequest } from "./image.types";
import { toJSON } from "../../common/utils";
import { sanitizeImageForPublic } from '../../common/sanitize';

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    }
};

export const createImage = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateImageRequest = req.body;
    await imageService.createImage(input);
    res.status(201).json({ message: "Image created successfully" });
});

export const getImage = asyncHandler(async (req: Request, res: Response) => {
    const imgID = BigInt(req.params.imgID);
    const image = await imageService.getImageByID(imgID);
    res.json(toJSON(sanitizeImageForPublic(image)));
});

export const updateImage = asyncHandler(async (req: Request, res: Response) => {
    const imgID = BigInt(req.params.imgID);
    const input: UpdateImageRequest = req.body;
    await imageService.updateImage(imgID, input);
    res.json({ message: "Image updated successfully" });
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const imgID = BigInt(req.params.imgID);
    await imageService.deleteImage(imgID);
    res.json({ message: "Image deleted successfully" });
});

export const ImageController = {
    createImage,
    getImage,
    updateImage,
    deleteImage,
};