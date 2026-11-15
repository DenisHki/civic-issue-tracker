import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Issue } from '../models/Issue.model';
import { Comment } from '../models/Comment.model';
import type { AuthRequest } from '../middleware/auth.middleware';


function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function createIssue(req: AuthRequest, res: Response): Promise<void> {
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
}

export async function listIssues(req: Request, res: Response): Promise<void> {
  try {
    const { municipality, category, status, q } = req.query;
    const query = Issue.find().sort({ createdAt: -1 });

    if (typeof municipality === 'string' && municipality.trim()) {
      query.where('municipality').regex(new RegExp(`^${escapeRegex(municipality.trim())}$`, 'i'));
    }
    if (typeof category === 'string' && category) {
      query.where('category').equals(category);
    }
    if (typeof status === 'string' && status) {
      query.where('status').equals(status);
    }
    if (typeof q === 'string' && q.trim()) {
      const pattern = new RegExp(escapeRegex(q.trim()), 'i');
      query.or([{ title: pattern }, { description: pattern }]);
    }

    const issues = await query;
    res.status(200).json({ issues });
  } catch (err) {
    res.status(500).json({ error: 'ISSUE_LIST_FAILED' });
  }
}

export async function getIssue(req: Request, res: Response): Promise<void> {
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
}

export async function updateIssueStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true },
    );

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    res.status(200).json({ issue });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_STATUS_UPDATE_FAILED' });
  }
}

export async function deleteIssue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user!.userId;
    const isModerator = req.user!.role === 'moderator';

    if (!isOwner && !isModerator) {
      res.status(403).json({ error: 'AUTH_FORBIDDEN' });
      return;
    }

    await Comment.deleteMany({ issue: issue._id });
    await issue.deleteOne();

    res.status(200).json({ message: 'ISSUE_DELETED' });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_DELETE_FAILED' });
  }
}

export async function toggleUpvote(req: AuthRequest, res: Response): Promise<void> {
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
}

export async function updateIssue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({ error: 'ISSUE_NOT_FOUND' });
      return;
    }

    const isOwner = issue.reportedBy.toString() === req.user!.userId;
    const isModerator = req.user!.role === 'moderator';

    if (!isOwner && !isModerator) {
      res.status(403).json({ error: 'AUTH_FORBIDDEN' });
      return;
    }

    const { title, description, category } = req.body;
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (category !== undefined) issue.category = category;

    await issue.save();
    res.status(200).json({ issue });
  } catch (err) {
    res.status(400).json({ error: 'ISSUE_UPDATE_FAILED' });
  }
}

