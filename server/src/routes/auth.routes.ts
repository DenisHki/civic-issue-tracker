import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { login, getMe, register } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', requireAuth, getMe);

export default router;
