export interface Image {
    imgID: bigint;
    vidID: bigint;
    s3Bucket: string;
    s3Key: string;
    imgURL: string;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Request helpers
type ImageInput = Pick<Image, 'vidID' | 's3Bucket' | 's3Key' | 'imgURL' | 'isPrimary'>;
export interface CreateImageRequest extends ImageInput {}
export type UpdateImageRequest = Partial<ImageInput>;
