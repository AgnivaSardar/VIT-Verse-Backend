// src/config/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'vit-verse-files';

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY && process.env.SUPABASE_ENABLED === 'true');
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not properly configured. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ENABLED in .env');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
    console.log('✅ Supabase client initialized');
  }

  return supabaseClient;
}

export interface SupabaseUploadOptions {
  path: string;
  file: Buffer | File;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(options: SupabaseUploadOptions): Promise<string> {
  const { path, file, contentType, cacheControl, upsert = false } = options;
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, {
      contentType: contentType || 'video/mp4',
      cacheControl: cacheControl || '3600',
      upsert,
    });

  if (error) {
    console.error('🔴 Supabase Upload Error:', error);
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  console.log(`✅ Uploaded to Supabase: ${path}`);
  
  // Return public URL
  return getSupabasePublicUrl(path);
}

/**
 * Get public URL for a file in Supabase Storage
 */
export function getSupabasePublicUrl(path: string): string {
  const supabase = getSupabaseClient();
  
  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(path: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('🔴 Supabase Delete Error:', error);
    throw new Error(`Failed to delete from Supabase: ${error.message}`);
  }

  console.log(`✅ Deleted from Supabase: ${path}`);
}

/**
 * Create signed URL for temporary access (for private files)
 */
export async function getSupabaseSignedUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    console.error('🔴 Supabase Signed URL Error:', error);
    throw new Error(`Failed to generate signed URL: ${error?.message}`);
  }

  return data.signedUrl;
}

export const supabaseStorage = {
  upload: uploadToSupabase,
  getPublicUrl: getSupabasePublicUrl,
  delete: deleteFromSupabase,
  getSignedUrl: getSupabaseSignedUrl,
  isConfigured: isSupabaseConfigured,
};
