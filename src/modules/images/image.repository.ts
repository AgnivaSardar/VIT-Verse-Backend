import { prisma } from "../../config/prisma";

export async function getImageByID(id: bigint) {
  return prisma.image.findUnique({
    where: { imgID: id },
  });
}

export async function createImage(data: {
  vidID: bigint;
  s3Bucket: string;
    s3Key: string;
    imgURL: string;
    isPrimary: boolean;
}) {
    return prisma.image.create({
    data: {
      vidID: data.vidID,
      s3Bucket: data.s3Bucket,
        s3Key: data.s3Key,
        imgURL: data.imgURL,
        isPrimary: data.isPrimary,
    },
  });
}

export async function updateImage(id: bigint, data: {
    s3Bucket?: string;
    s3Key?: string;
    imgURL?: string;
    isPrimary?: boolean;
}) {
    return prisma.image.update({
    where: { imgID: id },
    data: data,
  });
}

export async function deleteImage(id: bigint) {
    return prisma.image.delete({
    where: { imgID: id },
  });
}

