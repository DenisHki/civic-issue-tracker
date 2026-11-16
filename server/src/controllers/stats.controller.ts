import type { Request, Response } from 'express';
import { Issue } from '../models/Issue.model';

export async function getStats(_req: Request, res: Response) {
  try {
    const rows = await Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    const stats = { reported: 0, in_progress: 0, resolved: 0, total: 0 };

    for (const row of rows) {
      if (row._id === 'reported') stats.reported = row.count;
      if (row._id === 'in_progress') stats.in_progress = row.count;
      if (row._id === 'resolved') stats.resolved = row.count;
    }
    stats.total = stats.reported + stats.in_progress + stats.resolved;

    res.json({ stats });
  } catch {
    res.status(500).json({ error: 'STATS_FAILED' });
  }
}
