// src/modules/tags/tag.routes.ts
import { Router } from 'express';
import {
  createTagHandler,
  getTagHandler,
  listPopularTagsHandler,
  searchTagsHandler,
  addTagsToVideoHandler,
  getVideoTagsHandler,
} from './tag.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { cacheResponse } from '../../common/cache.js';

const router = Router();

router.post('/', requireAuth, createTagHandler);
router.get('/popular', cacheResponse(60, () => 'tags:popular'), listPopularTagsHandler);
router.get('/search', searchTagsHandler);
router.get('/:id', getTagHandler);

// Video tag management
router.post('/:videoID/tags', requireAuth, addTagsToVideoHandler);
router.get('/:videoID/tags', getVideoTagsHandler);

export default router;
