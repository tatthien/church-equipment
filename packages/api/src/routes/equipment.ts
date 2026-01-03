import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateQRCode } from '../services/qrcode.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

interface Equipment {
    id: number;
    name: string;
    brand: string | null;
    purchase_date: string | null;
    created_at: string;
    status: string;
    department_id: number | null;
    created_by: number | null;
    brand_id: number | null;
}

// Get all equipment with department info
router.get('/', (req, res) => {
    try {
        const { status, department_id, brand_id } = req.query;

        let sql = `
      SELECT e.*, d.name as department_name, u.name as created_by_name, b.name as brand_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (status) {
            sql += ' AND e.status = ?';
            params.push(status);
        }

        if (department_id) {
            sql += ' AND e.department_id = ?';
            params.push(department_id);
        }

        if (brand_id) {
            sql += ' AND e.brand_id = ?';
            params.push(brand_id);
        }

        sql += ' ORDER BY e.created_at DESC';

        const equipment = db.query(sql).all(...params);
        res.json(equipment);
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

// Get equipment by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const equipment = db.query(`
      SELECT e.*, d.name as department_name, u.name as created_by_name, b.name as brand_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE e.id = ?
    `).get(id);

        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json(equipment);
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

// Create equipment
router.post('/', (req: AuthRequest, res) => {
    try {
        const { name, brand_id, purchase_date, status, department_id } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const validStatuses = ['new', 'old', 'damaged', 'repairing', 'disposed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const stmt = db.prepare(`
      INSERT INTO equipment (name, brand_id, purchase_date, status, department_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            name,
            brand_id || null,
            purchase_date || null,
            status || 'new',
            department_id || null,
            req.user?.id || null
        );

        const equipment = db.query(`
      SELECT e.*, d.name as department_name, u.name as created_by_name, b.name as brand_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);

        res.status(201).json(equipment);
    } catch (error) {
        console.error('Create equipment error:', error);
        res.status(500).json({ error: 'Failed to create equipment' });
    }
});

// Update equipment
router.put('/:id', (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, brand_id, purchase_date, status, department_id } = req.body;

        const existing = db.query('SELECT * FROM equipment WHERE id = ?').get(id) as Equipment | undefined;
        if (!existing) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const validStatuses = ['new', 'old', 'damaged', 'repairing', 'disposed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const stmt = db.prepare(`
      UPDATE equipment 
      SET name = ?, brand_id = ?, purchase_date = ?, status = ?, department_id = ?
      WHERE id = ?
    `);
        stmt.run(
            name || existing.name,
            brand_id ?? existing.brand_id,
            purchase_date ?? existing.purchase_date,
            status || existing.status,
            department_id ?? existing.department_id,
            id
        );

        const equipment = db.query(`
      SELECT e.*, d.name as department_name, u.name as created_by_name, b.name as brand_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN brands b ON e.brand_id = b.id
      WHERE e.id = ?
    `).get(id);

        res.json(equipment);
    } catch (error) {
        console.error('Update equipment error:', error);
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

// Delete equipment
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const existing = db.query('SELECT * FROM equipment WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        db.run('DELETE FROM equipment WHERE id = ?', [id]);
        res.json({ message: 'Equipment deleted' });
    } catch (error) {
        console.error('Delete equipment error:', error);
        res.status(500).json({ error: 'Failed to delete equipment' });
    }
});

// Get QR code for equipment
router.get('/:id/qrcode', async (req, res) => {
    try {
        const { id } = req.params;

        const equipment = db.query('SELECT * FROM equipment WHERE id = ?').get(id) as Equipment | undefined;
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const qrData = JSON.stringify({
            id: equipment.id,
            name: equipment.name,
            brand: equipment.brand,
            status: equipment.status
        });

        const qrCode = await generateQRCode(qrData);
        res.json({ qrCode });
    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

export default router;
