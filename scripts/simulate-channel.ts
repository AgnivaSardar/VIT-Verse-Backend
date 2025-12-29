import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/prisma';
import * as playlistService from '../src/modules/playlists/playlist.service';
import * as channelRepo from '../src/modules/channels/channel.repository';

const arg = process.argv[2]; // channel id/publicID
const viewerIdArg = process.argv[3]; // optional viewer user id (simulate logged-in user)

async function loadVideos() {
  // Simulate videosApi.getAll (returns all videos with channel fields)
  return prisma.video.findMany({
    include: {
      channel: {
        select: { channelID: true, publicID: true, channelName: true },
      },
      images: { where: { isPrimary: true }, take: 1, select: { imgURL: true } },
    },
  });
}

function mapVideosForFrontend(videoRows: any[], channelData: any, channelId: string) {
  const mapped = (videoRows || [])
    .filter((vid) => {
      const vidChannelID = (vid as any).channelID ?? (vid as any).channel?.channelID;
      const vidChannelPublicID = (vid as any).channelPublicID ?? (vid as any).channel?.publicID;
      return (vidChannelPublicID && vidChannelPublicID === channelId) || Number(vidChannelID) === Number(channelId);
    })
    .map((vid) => ({
      id: vid.vidID ?? vid.id ?? 0,
      publicID: vid.publicID,
      title: vid.title ?? 'Untitled video',
      description: vid.description,
      thumbnail: vid.images?.[0]?.imgURL || vid.thumbnail,
      duration: vid.duration ?? 0,
      channelName: vid.channel?.channelName ?? channelData?.channelName ?? 'Unknown channel',
      channelImage: vid.channelImage,
      views: vid.views ?? 0,
      uploadedAt: vid.uploadedAt || vid.createdAt || 'Just now',
      badge: vid.badge,
      channelId: vid.channelId ?? vid.channelID,
      channelPublicID: vid.channelPublicID ?? vid.channel?.publicID,
    }));
  return mapped;
}

async function main() {
  let channel: any = null;
  if (arg) {
    if (/^CH-/.test(arg) || isNaN(Number(arg))) {
      channel = await channelRepo.getChannelByPublicID(arg);
    } else {
      try { channel = await channelRepo.getChannelByID(BigInt(arg)); } catch (e) { /* ignore */ }
    }
  }
  if (!channel) channel = await prisma.channel.findFirst();
  if (!channel) {
    console.error('No channel found');
    process.exit(1);
  }

  console.log('Channel:', { channelID: channel.channelID.toString(), publicID: channel.publicID, userID: channel.userID?.toString(), channelName: channel.channelName });

  const videos = await loadVideos();
  const mappedVideos = mapVideosForFrontend(videos, channel, String(arg || channel.publicID || channel.channelID));
  console.log('Mapped videos count for this channel (based on filter):', mappedVideos.length);

  const publicPlaylists = await playlistService.getAllPublicPlaylists();
  const ownerPlaylists = await playlistService.getPlaylistsByUserID(channel.userID);

  console.log('Public playlists total:', publicPlaylists.length);
  console.log('Owner playlists total:', ownerPlaylists.length);

  const nonOwnerFiltered = (publicPlaylists || []).filter((pl: any) => {
    const ownerUserID = pl.userID ?? pl.user?.userID;
    const plChannelID = pl.channelID ?? pl.channelId;
    const plChannelPublicID = pl.channelPublicID ?? pl.channel?.publicID;
    const fallbackChannelPublicID = pl.user?.channels?.[0]?.publicID || (pl.videos?.[0]?.video?.channel?.publicID);
    const channelIdToMatch = String(arg || channel.publicID || channel.channelID);
    return (
      (ownerUserID && Number(ownerUserID) === Number(channel.userID)) ||
      (plChannelPublicID && plChannelPublicID === channelIdToMatch) ||
      (plChannelID && Number(plChannelID) === Number(channel.channelID)) ||
      (fallbackChannelPublicID && fallbackChannelPublicID === channelIdToMatch)
    );
  });

  console.log('Public playlists matching channel:', nonOwnerFiltered.length);

  // Simulate viewer
  const viewerId = viewerIdArg ? BigInt(viewerIdArg) : null;
  const isOwner = viewerId && Number(channel.userID) === Number(viewerId);

  console.log('Viewer ID provided:', viewerIdArg || 'none', 'isOwner:', !!isOwner);

  const displayedPlaylists = isOwner ? ownerPlaylists : nonOwnerFiltered;
  console.log('Playlists that would be shown to viewer:', displayedPlaylists.length);
  if (displayedPlaylists.length > 0) console.log('Sample playlist:', { pID: displayedPlaylists[0].pID.toString(), publicID: displayedPlaylists[0].publicID, name: displayedPlaylists[0].name, isPublic: displayedPlaylists[0].isPublic });
  else console.log('No playlists to display (empty list)');

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
