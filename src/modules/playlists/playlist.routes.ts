import { Router } from "express";
import { PlaylistController } from "./playlist.controller";

const router = Router();
const playlistController = PlaylistController;
router.post("/", playlistController.createPlaylist);
router.get("/:playlistID", playlistController.getPlaylist);
router.delete("/:playlistID", playlistController.deletePlaylist);
router.put("/:playlistID", playlistController.updatePlaylist);
export default router;
