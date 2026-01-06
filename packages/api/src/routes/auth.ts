import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';
import { LoginRequestSchema } from '../schemas/auth.js';

const router = Router();

// Register endpoint removed


// Login
router.post('/login', async (req, res) => {
  try {
    const result = LoginRequestSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }

    const { username, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userData = { id: user.id, username: user.username, name: user.name, role: user.role };
    const token = generateToken(userData);

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
