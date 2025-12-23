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
    return attachThumbnail(playlist);
}

export async function getPlaylistsByUserID(userID: bigint) {
  const playlists = await playlistRepo.getPlaylistsByUserID(userID);
  return playlists.map(attachThumbnail);
}

export async function getAllPublicPlaylists() {
  const playlists = await playlistRepo.getAllPublicPlaylists();
  return playlists.map(attachThumbnail);
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

export async function addVideoToPlaylist(playlistID: bigint, videoID: bigint) {
  const playlist = await playlistRepo.getPlaylistByID(playlistID);
  if (!playlist) {
    throw new AppError("Playlist not found", 404);
  }
  return await playlistRepo.addVideoToPlaylist(playlistID, videoID);
}

export async function removeVideoFromPlaylist(playlistVideoID: bigint) {
  return await playlistRepo.removeVideoFromPlaylist(playlistVideoID);
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

function attachThumbnail(playlist: any) {
  // Find first video's primary image (ordered by position asc in repo)
  const first = playlist?.videos?.[0]?.video;
  const thumb = first?.images?.[0]?.imgURL || null;
  return {
    ...playlist,
    thumbnail: thumb,
  };
}

