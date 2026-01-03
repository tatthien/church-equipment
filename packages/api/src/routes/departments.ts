import { Router } from 'express';
import prisma from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

interface Department {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

// Get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Failed to get departments' });
    }
});

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const department = await prisma.department.findUnique({
            where: { id: Number(id) },
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(department);
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({ error: 'Failed to get department' });
    }
});

// Create department
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
            },
        });

        res.status(201).json(department);
    } catch (error: any) {
        console.error('Create department error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Update department
router.put('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const department = await prisma.department.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
            },
        });

        res.json(department);
    } catch (error: any) {
        console.error('Update department error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.status(500).json({ error: 'Failed to update department' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.department.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Department deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Department not found' });
        }
        console.error('Delete department error:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

export default router;
