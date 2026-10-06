import { Router, Response } from 'express';
import { Comment } from '../models/Comment.model';
import { Issue } from '../models/Issue.model';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.post('/issues/:issueId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    const comment = await Comment.create({
      issue: req.params.issueId,
      author: req.user!.userId,
      text: req.body.text,
    });

    res.status(201).json({ comment });
  } catch (err) {
    res.status(400).json({ error: 'COMMENT_CREATE_FAILED' });
  }
});

router.get('/issues/:issueId/comments', async (req, res: Response) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId }).sort({ createdAt: 1 });
    res.status(200).json({ comments });
  } catch (err) {
    res.status(400).json({ error: 'COMMENT_LIST_FAILED' });
  }
});

router.delete('/comments/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({ error: 'COMMENT_NOT_FOUND' });
      return;
    }

    const isAuthor = comment.author.toString() === req.user!.userId;
    const isModerator = req.user!.role === 'moderator';

    if (!isAuthor && !isModerator) {
      res.status(403).json({ error: 'AUTH_FORBIDDEN' });
      return;
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'COMMENT_DELETED' });
  } catch (err) {
    res.status(400).json({ error: 'COMMENT_DELETE_FAILED' });
  }
});

export default router;
