import { Router } from "express";
import { ChannelController } from "./channel.controller";

const router = Router();

const channelController = ChannelController;
router.post("/", channelController.createChannel);
router.get("/:channelID", channelController.getChannel);
router.delete("/:channelID", channelController.deleteChannel);
router.put("/:channelID", channelController.updateChannel);
router.get("/", channelController.listChannels);
router.post("/:channelID/subscribe", channelController.subscribeToChannel);
router.post("/:channelID/unsubscribe", channelController.unsubscribeFromChannel);
router.get("/name/:channelName/user/:userID", channelController.getChannelByNameAndUser);
export default router;
