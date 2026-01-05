import { Router } from 'express';
import prisma from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getPaginationParams, getSkip, paginateResults } from '../utils/pagination.js';

const router = Router();

router.use(authMiddleware);

// Get all brands
router.get('/', async (req, res) => {
    try {
        const { page, limit } = getPaginationParams(req.query);

        const total = await prisma.brand.count();

        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            skip: getSkip(page, limit),
            take: limit,
        });

        res.json(paginateResults(brands, total, page, limit));
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Failed to get brands' });
    }
});

// Create brand
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                description,
            },
        });

        res.status(201).json(brand);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Brand already exists' });
        }
        console.error('Create brand error:', error);
        res.status(500).json({ error: 'Failed to create brand' });
    }
});

// Update brand
router.put('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const brand = await prisma.brand.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
            },
        });

        res.json(brand);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Brand name already exists' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Brand not found' });
        }
        console.error('Update brand error:', error);
        res.status(500).json({ error: 'Failed to update brand' });
    }
});

// Delete brand
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        await prisma.brand.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Brand deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Brand not found' });
        }
        console.error('Delete brand error:', error);
        res.status(500).json({ error: 'Failed to delete brand' });
    }
});

export default router;
