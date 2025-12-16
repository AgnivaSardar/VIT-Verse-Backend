import { AppError } from "../../common/errors";
import * as imageRepo from "./image.repository";
import { CreateImageRequest, UpdateImageRequest } from "./image.types";

export async function createImage(data: CreateImageRequest): Promise<void> {
    // Additional validation can be added here if needed
    await imageRepo.createImage(data);
}

export async function getImageByID(imgID: bigint) {
    const image = await imageRepo.getImageByID(imgID);
    if (!image) {
        throw new AppError("Image not found", 404);
    }
    return image;
}

export async function updateImage(imgID: bigint, data: UpdateImageRequest): Promise<void> {
    const image = await imageRepo.getImageByID(imgID);
    if (!image) {
        throw new AppError("Image not found", 404);
    }
    await imageRepo.updateImage(imgID, data);
}

export async function deleteImage(imgID: bigint): Promise<void> {
    const image = await imageRepo.getImageByID(imgID);
    if (!image) {
        throw new AppError("Image not found", 404);
    }
    await imageRepo.deleteImage(imgID);
}

