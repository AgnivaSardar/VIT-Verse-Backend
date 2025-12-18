// src/modules/tags/tag.controller.ts
import type { Request, Response } from 'express';
import { tagService } from './tag.service';

export const createTagHandler = async (req: Request, res: Response) => {
  const data = req.body;
  const tag = await tagService.createTag(data);
  res.status(201).json(tag);
};

export const getTagHandler = async (req: Request, res: Response) => {
  const id = BigInt(req.params.id);
  const tag = await tagService.getTagById(id);
  res.json(tag);
};

export const listPopularTagsHandler = async (req: Request, res: Response) => {
  const { limit, page } = req.query;
  const tags = await tagService.listPopularTags(
    Number(limit) || 20,
    Number(page) || 1
  );
  res.json(tags);
};

export const searchTagsHandler = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const tags = await tagService.searchTags(query);
  res.json(tags);
};

export const addTagsToVideoHandler = async (req: Request, res: Response) => {
  const videoID = BigInt(req.params.videoID);
  const tagNames = (req.body.tags as string[]) || [];
  const tags = await tagService.addTagToVideo(videoID, tagNames);
  res.json({ message: 'Tags added', tags });
};

export const getVideoTagsHandler = async (req: Request, res: Response) => {
  const videoID = BigInt(req.params.videoID);
  const tags = await tagService.getVideoTags(videoID);
  res.json(tags);
};
