import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Get all brands
router.get('/', (req, res) => {
    try {
        const brands = db.query('SELECT * FROM brands ORDER BY name ASC').all();
        res.json(brands);
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Failed to get brands' });
    }
});

// Create brand
router.post('/', (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const stmt = db.prepare('INSERT INTO brands (name, description) VALUES (?, ?)');
        const result = stmt.run(name, description || null);

        const brand = db.query('SELECT * FROM brands WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(brand);
    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Brand already exists' });
        }
        console.error('Create brand error:', error);
        res.status(500).json({ error: 'Failed to create brand' });
    }
});

// Update brand
router.put('/:id', (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const stmt = db.prepare('UPDATE brands SET name = ?, description = ? WHERE id = ?');
        stmt.run(name, description || null, id);

        const brand = db.query('SELECT * FROM brands WHERE id = ?').get(id);
        res.json(brand);
    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Brand name already exists' });
        }
        console.error('Update brand error:', error);
        res.status(500).json({ error: 'Failed to update brand' });
    }
});

// Delete brand
router.delete('/:id', (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        db.run('DELETE FROM brands WHERE id = ?', [id]);
        res.json({ message: 'Brand deleted' });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({ error: 'Failed to delete brand' });
    }
});

export default router;
