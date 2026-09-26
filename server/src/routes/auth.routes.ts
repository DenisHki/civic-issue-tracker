import { Router, Request, Response } from 'express';
import { User } from '../models/User.model';
import { hashPassword } from '../utils/password';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

const router = Router();

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'AUTH_MISSING_FIELDS' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'AUTH_INVALID_CREDENTIALS' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'AUTH_INVALID_CREDENTIALS' });
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'AUTH_LOGIN_FAILED' });
  }
});

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, municipality } = req.body;

    if (!email || !password || !municipality) {
      res.status(400).json({ error: 'AUTH_MISSING_FIELDS' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, municipality });

    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ error: 'AUTH_REGISTER_FAILED' });
  }
});

export default router;
