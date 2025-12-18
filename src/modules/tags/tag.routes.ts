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

const router = Router();

router.post('/', requireAuth, createTagHandler);
router.get('/:id', getTagHandler);
router.get('/popular', listPopularTagsHandler);
router.get('/search', searchTagsHandler);

// Video tag management
router.post('/:videoID/tags', requireAuth, addTagsToVideoHandler);
router.get('/:videoID/tags', getVideoTagsHandler);

export default router;
