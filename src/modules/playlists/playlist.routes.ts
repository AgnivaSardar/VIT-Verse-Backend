import { Router } from "express";
import { PlaylistController } from "./playlist.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const playlistController = PlaylistController;
router.post("/", requireAuth, playlistController.createPlaylist);
router.get("/:playlistID", playlistController.getPlaylist);
router.delete("/:playlistID", requireAuth, playlistController.deletePlaylist);
router.put("/:playlistID", requireAuth, playlistController.updatePlaylist);
export default router;
