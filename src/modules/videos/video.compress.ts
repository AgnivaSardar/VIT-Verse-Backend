import { execFile } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

/**
 * Compress and scale a video using ffmpeg.
 * @param inputPath Path to the input video file
 * @param outputPath Path to the output (compressed) video file
 * @param options Optional settings for scaling/bitrate
 * @returns Promise that resolves when compression is complete
 */
export async function compressAndScaleVideo(
  inputPath: string,
  outputPath: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    videoBitrate?: string; // e.g. '1500k'
    crf?: number; // e.g. 23
    preset?: string; // e.g. 'medium'
  }
): Promise<void> {
  const execFilePromise = util.promisify(execFile);
  const {
    maxWidth = 1280,
    maxHeight = 720,
    videoBitrate = '1500k',
    crf = 23,
    preset = 'medium',
  } = options || {};

  // Build ffmpeg args for scaling and compression
  const scaleFilter = `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`;
  const args = [
    '-i', inputPath,
    '-vf', scaleFilter,
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', crf.toString(),
    '-b:v', videoBitrate,
    '-c:a', 'aac',
    '-movflags', '+faststart',
    '-y', // Overwrite output
    outputPath,
  ];
  await execFilePromise('ffmpeg', args);
}
