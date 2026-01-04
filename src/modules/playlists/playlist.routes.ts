import { Router } from "express";
import { PlaylistController } from "./playlist.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
const playlistController = PlaylistController;
router.get("/", playlistController.getAllPublicPlaylists);
router.post("/", requireAuth, playlistController.createPlaylist);
router.get("/my", requireAuth, playlistController.getMyPlaylists);
router.get("/:playlistID", playlistController.getPlaylist);
router.put("/:playlistID", requireAuth, playlistController.updatePlaylist);
router.delete("/:playlistID", requireAuth, playlistController.deletePlaylist);
router.post("/:playlistID/videos", requireAuth, playlistController.addVideoToPlaylist);
router.delete("/:playlistID/videos/:playlistVideoID", requireAuth, playlistController.removeVideoFromPlaylist);
export default router;
