// src/config/cloudflare.ts
import axios from 'axios';

const CLOUDFLARE_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CLOUDFLARE_STREAM_TOKEN = process.env.CF_STREAM_API_TOKEN!; // Stream Write token

export const cloudflareStreamApi = axios.create({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
  headers: {
    Authorization: `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
  },
});
