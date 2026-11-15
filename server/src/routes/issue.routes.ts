import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createIssue,
  listIssues,
  getIssue,
  updateIssueStatus,
  deleteIssue,
  toggleUpvote,
  updateIssue,
} from '../controllers/issue.controller';

const router = Router();

// Public
router.get('/issues', listIssues);
router.get('/issues/:id', getIssue);

// Any logged-in user
router.post('/issues', requireAuth, createIssue);
router.post('/issues/:id/upvote', requireAuth, toggleUpvote);

// Owner or moderator
router.patch('/issues/:id', requireAuth, updateIssue);
router.delete('/issues/:id', requireAuth, deleteIssue);

// Moderator only
router.patch('/issues/:id/status', requireAuth, requireRole('moderator'), updateIssueStatus);

export default router;
