import { Router } from "express";
import { ChannelController } from "./channel.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

const channelController = ChannelController;
router.post("/", requireAuth, channelController.createChannel);
router.get("/:channelID", channelController.getChannel);
router.delete("/:channelID", requireAuth, channelController.deleteChannel);
router.put("/:channelID", requireAuth, channelController.updateChannel);
router.get("/", channelController.listChannels);
router.post("/:channelID/subscribe", requireAuth, channelController.subscribeToChannel);
router.post("/:channelID/unsubscribe", requireAuth, channelController.unsubscribeFromChannel);
router.get("/name/:channelName/user/:userID", channelController.getChannelByNameAndUser);
export default router;
