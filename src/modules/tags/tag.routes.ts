// src/modules/tags/tag.routes.ts
import { Router } from 'express';
import {
  createTagHandler,
  getTagHandler,
  listPopularTagsHandler,
  searchTagsHandler,
  addTagsToVideoHandler,
  getVideoTagsHandler,
} from './tag.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { cacheResponse } from '../../common/cache';

const router = Router();

router.post('/', requireAuth, createTagHandler);
router.get('/popular', cacheResponse(60, () => 'tags:popular'), listPopularTagsHandler);
router.get('/search', searchTagsHandler);
router.get('/:id', getTagHandler);

// Video tag management
router.post('/:videoID/tags', requireAuth, addTagsToVideoHandler);
router.get('/:videoID/tags', getVideoTagsHandler);

export default router;
