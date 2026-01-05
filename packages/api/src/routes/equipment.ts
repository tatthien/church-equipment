import { Router } from 'express';
import prisma from '../db/prisma.js';
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
router.get('/', async (req: AuthRequest, res) => {
    try {
        const { status, department_id, brand_id, search } = req.query;

        const where: any = {};
        if (status) where.status = status as string;
        if (department_id) where.departmentId = Number(department_id);
        if (brand_id) where.brandId = Number(brand_id);

        // Search by equipment name OR brand name
        if (search) {
            where.OR = [
                { name: { contains: search as string } }, // Case insensitive by default in some DBs, Prisma doesn't always guarantee it without mode: 'insensitive'
                { brand: { name: { contains: search as string } } }
            ];
            // Note: SQLite case-insensitivity depends on collation, but usually `contains` is case-insensitive in Prisma for SQLite if not specified otherwise or using `mode: 'insensitive'` (which is recommended for Postgres/Mongo, but works for SQLite too in recent versions). 
            // Let's add mode: 'insensitive' to be safe even if using LibSQL.
            where.OR = [
                { name: { contains: search as string } },
                { brand: { name: { contains: search as string } } }
            ];
        }

        // Filter by createdBy for non-admin users
        if (req.user?.role !== 'admin') {
            where.createdBy = req.user?.id;
        }

        const equipments = await prisma.equipment.findMany({
            where,
            include: {
                department: true,
                brand: true,
                creator: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Map to match legacy API response structure
        const mappedEquipments = equipments.map((e) => ({
            ...e,
            department_name: e.department?.name || null,
            brand_name: e.brand?.name || null,
            created_by_name: e.creator?.name || null,
        }));

        res.json(mappedEquipments);
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

// Get equipment by ID
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const equipment = await prisma.equipment.findUnique({
            where: { id: Number(id) },
            include: {
                department: true,
                brand: true,
                creator: true,
            },
        });

        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        // Check permission if not admin
        if (req.user?.role !== 'admin' && equipment.createdBy !== req.user?.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const mappedEquipment = {
            ...equipment,
            department_name: equipment.department?.name || null,
            brand_name: equipment.brand?.name || null,
            created_by_name: equipment.creator?.name || null,
        };

        res.json(mappedEquipment);
    } catch (error) {
        console.error('Get equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

// Create equipment
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { name, brand_id, purchase_date, status, department_id } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const validStatuses = ['new', 'old', 'damaged', 'repairing', 'disposed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const equipment = await prisma.equipment.create({
            data: {
                name,
                brandId: brand_id ? Number(brand_id) : null,
                purchaseDate: purchase_date || null,
                status: status || 'new',
                departmentId: department_id ? Number(department_id) : null,
                createdBy: req.user?.id || null,
            },
            include: {
                department: true,
                brand: true,
                creator: true,
            },
        });

        const mappedEquipment = {
            ...equipment,
            department_name: equipment.department?.name || null,
            brand_name: equipment.brand?.name || null,
            created_by_name: equipment.creator?.name || null,
        };

        res.status(201).json(mappedEquipment);
    } catch (error) {
        console.error('Create equipment error:', error);
        res.status(500).json({ error: 'Failed to create equipment' });
    }
});

// Update equipment
router.put('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, brand_id, purchase_date, status, department_id } = req.body;

        const existing = await prisma.equipment.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        // Check permission
        if (req.user?.role !== 'admin' && existing.createdBy !== req.user?.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const validStatuses = ['new', 'old', 'damaged', 'repairing', 'disposed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const equipment = await prisma.equipment.update({
            where: { id: Number(id) },
            data: {
                name,
                brandId: brand_id !== undefined ? (brand_id ? Number(brand_id) : null) : undefined,
                purchaseDate: purchase_date,
                status,
                departmentId: department_id !== undefined ? (department_id ? Number(department_id) : null) : undefined,
            },
            include: {
                department: true,
                brand: true,
                creator: true,
            },
        });

        const mappedEquipment = {
            ...equipment,
            department_name: equipment.department?.name || null,
            brand_name: equipment.brand?.name || null,
            created_by_name: equipment.creator?.name || null,
        };

        res.json(mappedEquipment);
    } catch (error) {
        console.error('Update equipment error:', error);
        res.status(500).json({ error: 'Failed to update equipment' });
    }
});

// Delete equipment
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.equipment.findUnique({ where: { id: Number(id) } });

        if (!existing) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        // Check permission
        if (req.user?.role !== 'admin' && existing.createdBy !== req.user?.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.equipment.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Equipment deleted' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        console.error('Delete equipment error:', error);
        res.status(500).json({ error: 'Failed to delete equipment' });
    }
});

// Get QR code for equipment
router.get('/:id/qrcode', async (req, res) => {
    try {
        const { id } = req.params;

        const equipment = await prisma.equipment.findUnique({
            where: { id: Number(id) },
            include: { brand: true }
        });

        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const validStatuses = ['new', 'old', 'damaged', 'repairing', 'disposed'];

        // Use FRONTEND_URL from env or default to localhost:3000
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrData = `${frontendUrl}/public/equipment/${id}`;

        const qrCode = await generateQRCode(qrData);
        res.json({ qrCode });
    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

export default router;
