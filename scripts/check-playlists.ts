import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/prisma';
import * as playlistService from '../src/modules/playlists/playlist.service';
import * as channelRepo from '../src/modules/channels/channel.repository';

const arg = process.argv[2]; // can be channel publicID or numeric ID

async function main() {
  // Resolve channel
  let channel: any = null;
  if (arg) {
    if (/^CH-/.test(arg) || isNaN(Number(arg))) {
      channel = await channelRepo.getChannelByPublicID(arg);
    } else {
      try { channel = await channelRepo.getChannelByID(BigInt(arg)); } catch (e) { /* ignore */ }
    }
  }

  if (!channel) {
    channel = await prisma.channel.findFirst();
  }

  if (!channel) {
    console.error('No channel available in DB to inspect.');
    process.exit(1);
  }

  console.log('Channel:', { channelID: channel.channelID, publicID: channel.publicID, userID: channel.userID, channelName: channel.channelName });

  const publicPlaylists = await playlistService.getAllPublicPlaylists();
  console.log('Public playlists total:', publicPlaylists.length);

  const ownerPlaylists = await playlistService.getPlaylistsByUserID(channel.userID);
  console.log('Owner playlists total (getPlaylistsByUserID):', ownerPlaylists.length);

  const filtered = (publicPlaylists || []).filter((pl: any) => {
    const ownerUserID = pl.userID ?? pl.user?.userID;
    const plChannelID = pl.channelID ?? pl.channelId;
    const plChannelPublicID = pl.channelPublicID ?? pl.channel?.publicID;
    return (
      (ownerUserID && Number(ownerUserID) === Number(channel.userID)) ||
      (plChannelPublicID && plChannelPublicID === channel.publicID) ||
      (plChannelID && Number(plChannelID) === Number(channel.channelID))
    );
  });

  console.log('Public playlists that match channel owner/channel:', filtered.length);
  console.log('Examples (up to 5):', filtered.slice(0, 5).map((p:any) => ({ pID: p.pID, publicID: p.publicID, name: p.name, isPublic: p.isPublic, userID: p.user?.userID })));

  // Show one example playlist id to inspect structure
  if (filtered[0]) {
    console.log('Inspecting first matched playlist raw object keys:', Object.keys(filtered[0]));
  } else if (ownerPlaylists[0]) {
    console.log('No public matches but owner has playlists. Example owner playlist keys:', Object.keys(ownerPlaylists[0]));
  }

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
