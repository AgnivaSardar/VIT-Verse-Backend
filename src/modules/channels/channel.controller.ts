import { Request, Response } from "express";
import * as channelService from "./channel.service";
import { CreateChannelRequest, UpdateChannelRequest } from "./channel.types";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (err: any) => void) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

export const createChannel = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateChannelRequest = req.body;
  await channelService.createChannel(input);
  res.status(201).json({ message: "Channel created successfully" });
}
);

export const getChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const channel = await channelService.getChannelByID(channelID);
  res.json(channel);
});

export const deleteChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  await channelService.deleteChannel(channelID);
  res.json({ message: "Channel deleted successfully" });
}
);

// Additional controller methods (updateChannel, listChannels, subscribeToChannel, unsubscribeFromChannel) can be added similarly.
export const updateChannel = asyncHandler(async (req: Request, res: Response) => {
  const channelID = BigInt(req.params.channelID);
  const input: UpdateChannelRequest = req.body;
  await channelService.updateChannelService(channelID, input);
  res.json({ message: "Channel updated successfully" });
}

);

export const listChannels = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await channelService.listChannelsService(page, limit);
  res.json(result);
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
  res.json(channel);
}
);

export const ChannelController = {
  createChannel,
  getChannel,
  deleteChannel,
  updateChannel,
  listChannels,
  subscribeToChannel,
  unsubscribeFromChannel,
  getChannelByNameAndUser,
};
