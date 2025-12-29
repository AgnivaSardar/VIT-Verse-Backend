import { Request, Response } from "express";
import * as channelService from "./channel.service";
import { CreateChannelRequest, UpdateChannelRequest } from "./channel.types";
import { toJSON } from "../../common/utils";
import { sanitizeChannelForPublic } from '../../common/sanitize';
import { uploadToS3, isS3Configured } from "../../config/s3";
import crypto from "crypto";
import { AppError } from "../../common/errors"; // Added AppError import

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const createChannel = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(String(req.user!.id));
  const logoFile = (req as any).file;

  let channelImageUrl: string | undefined;

  // Upload logo to S3 if provided
  if (logoFile && isS3Configured()) {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = logoFile.originalname.split('.').pop();
    const s3Key = `channel-logos/${userID}/${timestamp}-${randomHash}.${ext}`;

    channelImageUrl = await uploadToS3({
      key: s3Key,
      body: logoFile.buffer,
      metadata: {
        originalName: logoFile.originalname,
        mimeType: logoFile.mimetype,
        size: logoFile.size,
        uploadedBy: userID.toString(),
      },
      contentType: logoFile.mimetype,
      isPublic: true,
    });
    console.log(`✅ Channel logo uploaded: ${channelImageUrl}`);
  } else if (logoFile) {
    // Fallback to local storage path (shouldn't happen with STORAGE_TYPE=s3)
    channelImageUrl = `uploads/channel-logos/${logoFile.originalname}`;
  }

  const input: CreateChannelRequest = {
    ...req.body,
    userID,
    channelImage: channelImageUrl,
    isPremium: req.body.isPremium === 'true' || req.body.isPremium === true,
  };
  await channelService.createChannel(input);
  res.status(201).json({ message: "Channel created successfully" });
}
);

export const getChannel = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.channelID;
  let channel;

  // Try finding by publicID first
  channel = await channelService.getChannelByPublicID(idParam);

  // Fallback to numeric ID for legacy support
  if (!channel && /^\d+$/.test(idParam)) {
    channel = await channelService.getChannelByID(BigInt(idParam));
  }

  if (!channel) {
    throw new AppError('Channel not found', 404);
  }
  res.json(toJSON(sanitizeChannelForPublic(channel)));
});

export const deleteChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const userID = BigInt(String(req.user!.id));
  await channelService.deleteChannel(channelID, userID);
  res.json({ message: "Channel deleted successfully" });
}
);

// Additional controller methods (updateChannel, listChannels, subscribeToChannel, unsubscribeFromChannel) can be added similarly.
export const updateChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const userID = BigInt(String(req.user!.id));
  const logoFile = (req as any).file;

  let channelImageUrl: string | undefined;

  // Upload new logo to S3 if provided
  if (logoFile && isS3Configured()) {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = logoFile.originalname.split('.').pop();
    const s3Key = `channel-logos/${userID}/${timestamp}-${randomHash}.${ext}`;

    channelImageUrl = await uploadToS3({
      key: s3Key,
      body: logoFile.buffer,
      metadata: {
        originalName: logoFile.originalname,
        mimeType: logoFile.mimetype,
        size: logoFile.size,
        uploadedBy: userID.toString(),
      },
      contentType: logoFile.mimetype,
      isPublic: true,
    });
    console.log(`✅ Channel logo updated: ${channelImageUrl}`);
  } else if (logoFile) {
    channelImageUrl = `uploads/channel-logos/${logoFile.originalname}`;
  }

  const input: UpdateChannelRequest = {
    ...req.body,
    channelImage: channelImageUrl,
    isPremium: req.body.isPremium === 'true' || req.body.isPremium === true ? true : req.body.isPremium === 'false' || req.body.isPremium === false ? false : undefined,
  };
  await channelService.updateChannelService(channelID, userID, input);
  res.json({ message: "Channel updated successfully" });
}

);

export const listChannels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await channelService.listChannelsService(page, limit);
  // sanitize each channel in the list
  const safe = Array.isArray(result) ? result.map((c: any) => sanitizeChannelForPublic(c)) : sanitizeChannelForPublic(result);
  res.json(toJSON(safe));
}
);

export const subscribeToChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const userID = BigInt(req.body.userID);
  await channelService.subscribeToChannelService(channelID, userID);
  res.json({ message: "Subscribed to channel successfully" });
}
);

export const unsubscribeFromChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const userID = BigInt(req.body.userID);
  await channelService.unsubscribeFromChannelService(channelID, userID);
  res.json({ message: "Unsubscribed from channel successfully" });
}

);

export const getChannelByNameAndUser = asyncHandler(async (req: Request, res: Response) => {
  const channelName = req.params.channelName;
  const userID = BigInt(req.params.userID);
  const channel = await channelService.getChannelByNameAndUserService(channelName, userID);
  res.json(toJSON(sanitizeChannelForPublic(channel)));
}
);

export const getMyChannel = asyncHandler(async (req: Request, res: Response) => {
  const userID = BigInt(String(req.user!.id));
  const channel = await channelService.getUserChannel(userID);
  if (!channel) {
    res.status(404).json({ message: "Channel not found" });
    return;
  }
  res.json(toJSON(sanitizeChannelForPublic(channel)));
});

export const getChannelStats = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.channelID;
  let channel;

  // Try finding by publicID first
  channel = await channelService.getChannelByPublicID(idParam);

  // Fallback to numeric ID for legacy support
  if (!channel && /^\d+$/.test(idParam)) {
    channel = await channelService.getChannelByID(BigInt(idParam));
  }

  if (!channel) {
    throw new AppError('Channel not found', 404);
  }

  const channelID = channel.channelID;
  // Only allow owner to see full statistics
  const requesterID = req.user?.id ? BigInt(String(req.user!.id)) : null;
  if (!requesterID || BigInt(channel.userID) !== requesterID) {
    res.status(403).json({ message: 'Forbidden: statistics are only available to the channel owner' });
    return;
  }
  const stats = await channelService.getChannelStats(channelID);
  res.json(toJSON(stats));
});

export const ChannelController = {
  createChannel,
  getChannel,
  deleteChannel,
  updateChannel,
  listChannels,
  subscribeToChannel,
  unsubscribeFromChannel,
  getChannelByNameAndUser,
  getMyChannel,
  getChannelStats,
};
