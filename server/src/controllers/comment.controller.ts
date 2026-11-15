import type { Request, Response } from 'express';
import { Comment } from '../models/Comment.model';
import { Issue } from '../models/Issue.model';
import type { AuthRequest } from '../middleware/auth.middleware';

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
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
}

export async function listComments(req: Request, res: Response): Promise<void> {
  try {
    const comments = await Comment.find({ issue: req.params.issueId }).sort({ createdAt: 1 });
    res.status(200).json({ comments });
  } catch (err) {
    res.status(400).json({ error: 'COMMENT_LIST_FAILED' });
  }
}

export async function deleteComment(req: AuthRequest, res: Response): Promise<void> {
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
}
