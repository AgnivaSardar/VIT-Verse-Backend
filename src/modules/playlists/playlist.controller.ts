import { Request, Response } from "express";
import * as playlistService from "./playlist.service.js";
import { videoService } from "../videos/video.service.js";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "./playlist.types.js";
import { toJSON } from "../../common/utils.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../common/errors.js";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const createPlaylist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, isPublic, isPremium } = req.body;
    const userID = BigInt(req.user!.id);
    const playlist = await playlistService.createPlaylist({
        userID,
        name,
        description,
        isPublic,
        isPremium,
    });
    res.status(201).json({ data: toJSON(playlist), message: "Playlist created successfully" });
});

export const getPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.playlistID;
    if (!idParam) throw new AppError("Playlist ID is required", 400);
    let playlist;

    // Try finding by publicID first
    playlist = await playlistService.getPlaylistByPublicID(idParam);

    // Fallback to numeric ID for legacy support
    if (!playlist && /^\d+$/.test(idParam)) {
        playlist = await playlistService.getPlaylistByID(BigInt(idParam));
    }

    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }
    res.json(toJSON(playlist));
});

export const getMyPlaylists = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userID = BigInt(req.user!.id);
    const playlists = await playlistService.getPlaylistsByUserID(userID);
    res.json(toJSON(playlists));
});

export const getAllPublicPlaylists = asyncHandler(async (req: Request, res: Response) => {
    const playlists = await playlistService.getAllPublicPlaylists();
    res.json(toJSON(playlists));
});

export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.playlistID;
    if (!idParam) throw new AppError("Playlist ID is required", 400);
    let playlist;

    // Try finding by publicID first
    playlist = await playlistService.getPlaylistByPublicID(idParam);

    // Fallback to numeric ID for legacy support
    if (!playlist && /^\d+$/.test(idParam)) {
        playlist = await playlistService.getPlaylistByID(BigInt(idParam));
    }

    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }

    const input: UpdatePlaylistRequest = req.body;
    await playlistService.updatePlaylist(playlist.pID, input);
    res.json({ message: "Playlist updated successfully" });
});

export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const idParam = req.params.playlistID;
    if (!idParam) throw new AppError("Playlist ID is required", 400);
    let playlist;

    // Try finding by publicID first
    playlist = await playlistService.getPlaylistByPublicID(idParam);

    // Fallback to numeric ID for legacy support
    if (!playlist && /^\d+$/.test(idParam)) {
        playlist = await playlistService.getPlaylistByID(BigInt(idParam));
    }

    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }

    await playlistService.deletePlaylist(playlist.pID);
    res.json({ message: "Playlist deleted successfully" });
});

export const addVideoToPlaylist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { videoID } = req.body;

    if (!videoID) {
        res.status(400).json({ message: "videoID is required" });
        return;
    }

    // Resolve playlistID from params robustly
    const resolvedPlaylistID = await playlistService.resolvePlaylistID(String(req.params.playlistID));
    if (!resolvedPlaylistID) throw new AppError("Playlist not found", 404);

    // Resolve videoID from body robustly
    const resolvedVideoID = await videoService.resolveVideoID(String(videoID));
    if (!resolvedVideoID) throw new AppError("Video not found", 404);

    await playlistService.addVideoToPlaylist(resolvedPlaylistID, resolvedVideoID);
    res.status(201).json({ message: "Video added to playlist" });
});

export const removeVideoFromPlaylist = asyncHandler(async (req: AuthRequest, res: Response) => {
    const playlistVideoID = (() => {
  const { playlistVideoID } = req.params;
  if (!playlistVideoID) {
    throw new AppError("playlistVideoID is required", 400);
  }
  return BigInt(playlistVideoID);
})()
;
    await playlistService.removeVideoFromPlaylist(playlistVideoID);
    res.json({ message: "Video removed from playlist" });
});

export const PlaylistController = {
    createPlaylist,
    getPlaylist,
    getMyPlaylists,
    getAllPublicPlaylists,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
};
