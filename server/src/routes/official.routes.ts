import { Router } from 'express';
import { getOfficialIssues } from '../controllers/official.controller';

const router = Router();

router.get('/official-issues', getOfficialIssues);

export default router;
