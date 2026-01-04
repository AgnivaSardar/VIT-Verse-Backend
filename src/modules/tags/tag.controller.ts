// src/modules/tags/tag.controller.ts
import type { Request, Response } from 'express';
import { tagService } from './tag.service.js';
import { videoService } from '../videos/video.service.js';
import { toJSON } from '../../common/utils.js';
import { AppError } from '../../common/errors.js';

export const createTagHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const tag = await tagService.createTag(data);
  res.status(201).json(toJSON(tag));
};

export const getTagHandler = async (req: Request, res: Response) => {
  const id = (() => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("id is required", 400);
  }
  return BigInt(id);
})()
;
  const tag = await tagService.getTagById(id);
  res.json(toJSON(tag));
};

export const listPopularTagsHandler = async (req: Request, res: Response) => {
  const { limit, page } = req.query;
  const tags = await tagService.listPopularTags(
    Number(limit) || 20,
    Number(page) || 1
  );
  res.json(toJSON(tags));
};

export const searchTagsHandler = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const tags = await tagService.searchTags(query);
  res.json(toJSON(tags));
};

export const addTagsToVideoHandler = async (req: Request, res: Response) => {
  const videoIdParam = req.params.videoID;
  if (!videoIdParam) throw new AppError("videoID parameter is required", 400);
  const videoID = await videoService.resolveVideoID(videoIdParam);
  if (!videoID) throw new AppError("Video not found", 404);
  const tagNames = (req.body.tags as string[]) || [];
  const tags = await tagService.addTagToVideo(videoID, tagNames);
  res.json(toJSON({ message: 'Tags added', tags }));
};

export const getVideoTagsHandler = async (req: Request, res: Response) => {
  const videoIdParam = req.params.videoID;
  if (!videoIdParam) throw new AppError("videoID parameter is required", 400);
  const videoID = await videoService.resolveVideoID(videoIdParam);
  if (!videoID) throw new AppError("Video not found", 404);
  const videoTags = await tagService.getVideoTags(videoID);
  // Extract just the tag objects from the VideoTag join table records
  const tags = videoTags.map((vt: any) => vt.tag).filter(Boolean);
  res.json(toJSON(tags));
};
