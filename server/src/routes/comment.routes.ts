import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createComment, listComments, deleteComment } from '../controllers/comment.controller';

const router = Router();

router.post('/issues/:issueId/comments', requireAuth, createComment);
router.get('/issues/:issueId/comments', listComments);
router.delete('/comments/:id', requireAuth, deleteComment);

export default router;
