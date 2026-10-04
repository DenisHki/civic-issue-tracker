import { Router, Response } from 'express';
import { Issue } from '../models/Issue.model';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { Types } from 'mongoose';

const router = Router();

router.post('/issues', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, location, municipality } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      municipality,
      reportedBy: req.user!.userId,
    });

    res.status(201).json({ issue });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_CREATE_FAILED' });
  }
});

router.get('/issues', async (_req, res: Response) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json({ issues });
  } catch (err) {
    res.status(500).json({ error: 'ISSUE_LIST_FAILED' });
  }
});

router.get('/issues/:id', async (req, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    res.status(200).json({ issue });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_INVALID_ID' });
  }
});

router.patch(
  '/issues/:id/status',
  requireAuth,
  requireRole('moderator', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      const issue = await Issue.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true },
      );

      if (!issue) {
        res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
        return;
      }

      res.status(200).json({ issue });
    } catch (err) {
      res.status(400).json({ error: 'ISSUE_STATUS_UPDATE_FAILED' });
    }
  },
);

router.delete('/issues/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user!.userId;
    const isModerator = req.user!.role === 'moderator' || req.user!.role === 'admin';

    if (!isOwner && !isModerator) {
      res.status(403).json({ error: 'AUTH_FORBIDDEN' });
      return;
    }

    await issue.deleteOne();
    res.status(200).json({ message: 'ISSUE_DELETED' });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_DELETE_FAILED' });
  }
});

router.post('/issues/:id/upvote', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    const userId = req.user!.userId;
    const alreadyUpvoted = issue.upvotedBy.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
      issue.upvotedBy = issue.upvotedBy.filter((id) => id.toString() !== userId);
      issue.upvoteCount -= 1;
    } else {
      issue.upvotedBy.push(new Types.ObjectId(userId));
      issue.upvoteCount += 1;
    }

    await issue.save();
    res.status(200).json({ issue });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_UPVOTE_FAILED' });
  }
});

export default router;
