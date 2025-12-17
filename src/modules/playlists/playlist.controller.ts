import { Request,Response } from "express";
import * as playlistService from "./playlist.repository";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "./playlist.types";

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: (err: any) => void) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
}

export const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const input: CreatePlaylistRequest = req.body;
    await playlistService.createPlaylist(input);
    res.status(201).json({ message: "Playlist created successfully" });
});

export const getPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const playlistID = BigInt(req.params.playlistID);
    const playlist = await playlistService.getPlaylistByID(playlistID);
    res.json(playlist);
});

export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const playlistID = BigInt(req.params.playlistID);
    const input: UpdatePlaylistRequest = req.body;
    await playlistService.updatePlaylist(playlistID, input);
    res.json({ message: "Playlist updated successfully" });
});

export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const playlistID = BigInt(req.params.playlistID);
    await playlistService.deletePlaylist(playlistID);
    res.json({ message: "Playlist deleted successfully" });
});

export const PlaylistController = {
    createPlaylist,
    getPlaylist,
    updatePlaylist,
    deletePlaylist,
};