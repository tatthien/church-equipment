import { Router } from 'express';
import db from '../db/index.js';
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
router.get('/', (req, res) => {
    try {
        const departments = db.query('SELECT * FROM departments ORDER BY name').all();
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Failed to get departments' });
    }
});

// Get department by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const department = db.query('SELECT * FROM departments WHERE id = ?').get(id);

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
router.post('/', (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const stmt = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
        const result = stmt.run(name, description || null);

        const department = db.query('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(department);
    } catch (error: any) {
        console.error('Create department error:', error);
        if (error.message?.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Update department
router.put('/:id', (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = db.query('SELECT * FROM departments WHERE id = ?').get(id) as Department | undefined;
        if (!existing) {
            return res.status(404).json({ error: 'Department not found' });
        }

        const stmt = db.prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?');
        stmt.run(name || existing.name, description ?? existing.description, id);

        const department = db.query('SELECT * FROM departments WHERE id = ?').get(id);
        res.json(department);
    } catch (error: any) {
        console.error('Update department error:', error);
        if (error.message?.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        res.status(500).json({ error: 'Failed to update department' });
    }
});

// Delete department
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const existing = db.query('SELECT * FROM departments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Department not found' });
        }

        db.run('DELETE FROM departments WHERE id = ?', [id]);
        res.json({ message: 'Department deleted' });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

export default router;
