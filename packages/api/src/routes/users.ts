import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { CreateUserSchema, UpdateUserSchema } from '../schemas/auth.js';

const router = Router();

// Middleware to check if user is admin
const adminMiddleware = (req: AuthRequest, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

router.use(authMiddleware);
router.use(adminMiddleware);

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const result = CreateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }

    const { username, password, name, role } = result.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role as any || 'user',
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = UpdateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }

    const { name, role, password } = result.data;

    const data: any = { name, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update user error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await prisma.user.delete({
      where: { id },
    });
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
