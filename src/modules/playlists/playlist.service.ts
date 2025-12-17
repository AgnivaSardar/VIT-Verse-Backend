import { AppError } from "../../common/errors";
import * as playlistRepo from "./playlist.repository";
import { CreatePlaylistRequest, UpdatePlaylistRequest } from "./playlist.types";

export async function createPlaylist(data: CreatePlaylistRequest): Promise<void> {
  await playlistRepo.createPlaylist(data);
}

export async function getPlaylistByID(playlistID: bigint) {
  const playlist = await playlistRepo.getPlaylistByID(playlistID);
    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }
    return playlist;
}

export async function updatePlaylist(playlistID: bigint, data: UpdatePlaylistRequest): Promise<void> {
  const playlist = await playlistRepo.getPlaylistByID(playlistID);
    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }
    await playlistRepo.updatePlaylist(playlistID, data);
}

export async function deletePlaylist(playlistID: bigint): Promise<void> {
  const playlist = await playlistRepo.getPlaylistByID(playlistID);
    if (!playlist) {
        throw new AppError("Playlist not found", 404);
    }
    await playlistRepo.deletePlaylist(playlistID);
}

export function createPlaylistService(input: CreatePlaylistRequest) {
    throw new Error('Function not implemented.');
}

export function getPlaylistService(playlistID: bigint) {
    throw new Error('Function not implemented.');
}

export function updatePlaylistService(playlistID: bigint, input: UpdatePlaylistRequest) {
    throw new Error('Function not implemented.');
}

export function deletePlaylistService(playlistID: bigint) {
    throw new Error('Function not implemented.');
}

