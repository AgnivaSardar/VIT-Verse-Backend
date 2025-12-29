import { Router } from "express";
import multer from "multer";
import { ChannelController } from "./channel.controller";
import { requireAuth, optionalAuth } from "../../middlewares/auth.middleware";

const router = Router();

// Use memory storage for S3 upload
const uploadLogo = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: (_req, file, cb) => {
		if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file.originalname)) return cb(null, true);
		return cb(new Error("Only image files allowed for logo"));
	},
});

const channelController = ChannelController;
router.post("/", requireAuth, uploadLogo.single("channelLogo"), channelController.createChannel);
router.get("/", channelController.listChannels);
router.get("/name/:channelName/user/:userID", optionalAuth, channelController.getChannelByNameAndUser);
router.get("/my", requireAuth, channelController.getMyChannel);
router.get("/:channelID", optionalAuth, channelController.getChannel);
// Stats are only available to the channel owner
router.get("/:channelID/stats", requireAuth, channelController.getChannelStats);
router.delete("/:channelID", requireAuth, channelController.deleteChannel);
router.put("/:channelID", requireAuth, uploadLogo.single("channelLogo"), channelController.updateChannel);
router.post("/:channelID/subscribe", requireAuth, channelController.subscribeToChannel);
router.post("/:channelID/unsubscribe", requireAuth, channelController.unsubscribeFromChannel);
export default router;
