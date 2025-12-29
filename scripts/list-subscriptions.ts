import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma';

async function main(){
  const subs = await prisma.subscription.findMany({ include: { channel: true } });
  console.log(subs.map(s => ({ subID: s.subID?.toString(), userID: s.userID?.toString(), channelID: s.channelID?.toString(), channel: s.channel ? { channelID: s.channel.channelID?.toString(), publicID: s.channel.publicID, channelName: s.channel.channelName } : null })));
  process.exit(0);
}

main().catch(e=>{console.error(e); process.exit(1);});
