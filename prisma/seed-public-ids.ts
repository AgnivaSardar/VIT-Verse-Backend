import { PrismaClient } from '@prisma/client';
import { generateVideoID, generateChannelID, generatePlaylistID } from '../src/utils/id.utils';

const prisma = new PrismaClient();

async function backfill() {
    console.log('🔄 Starting public ID backfill (using raw SQL)...');

    // 1. Backfill Channels
    const channels = await prisma.$queryRawUnsafe<any[]>('SELECT "channelID" FROM "Channel"');
    console.log(`Found ${channels.length} channels.`);
    for (const channel of channels) {
        const publicID = generateChannelID();
        await prisma.$executeRawUnsafe(
            'UPDATE "Channel" SET "publicID" = $1 WHERE "channelID" = $2',
            publicID,
            channel.channelID
        );
    }
    console.log('✅ Channels updated.');

    // 2. Backfill Videos
    const videos = await prisma.$queryRawUnsafe<any[]>('SELECT "vidID" FROM "Video"');
    console.log(`Found ${videos.length} videos.`);
    for (const video of videos) {
        const publicID = generateVideoID();
        await prisma.$executeRawUnsafe(
            'UPDATE "Video" SET "publicID" = $1 WHERE "vidID" = $2',
            publicID,
            video.vidID
        );
    }
    console.log('✅ Videos updated.');

    // 3. Backfill Playlists
    const playlists = await prisma.$queryRawUnsafe<any[]>('SELECT "pID" FROM "Playlist"');
    console.log(`Found ${playlists.length} playlists.`);
    for (const playlist of playlists) {
        const publicID = generatePlaylistID();
        await prisma.$executeRawUnsafe(
            'UPDATE "Playlist" SET "publicID" = $1 WHERE "pID" = $2',
            publicID,
            playlist.pID
        );
    }
    console.log('✅ Playlists updated.');

    console.log('🎉 Backfill complete!');
}

backfill()
    .catch((e) => {
        console.error('❌ Backfill failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
