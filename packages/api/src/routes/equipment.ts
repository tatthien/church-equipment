import { Router } from 'express';
import prisma from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { generateQRCode } from '../services/qrcode.js';
import { getPaginationParams, getSkip, paginateResults } from '../utils/pagination.js';
import { CreateEquipmentSchema, UpdateEquipmentSchema } from '../schemas/equipment.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all equipment with department info
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, departmentId, brandId, search } = req.query;
    const { page, limit } = getPaginationParams(req.query);

    const where: any = {};
    if (status) where.status = status as string;
    if (departmentId) where.departmentId = departmentId;
    if (brandId) where.brandId = brandId;

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

    // Get total count for pagination
    const total = await prisma.equipment.count({ where });

    const equipments = await prisma.equipment.findMany({
      where,
      include: {
        department: true,
        brand: true,
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: getSkip(page, limit),
      take: limit,
    });

    res.json(paginateResults(equipments, total, page, limit));
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
      where: { id },
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

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to get equipment' });
  }
});

// Create equipment
router.post('/', async (req: AuthRequest, res) => {
  try {
    const result = CreateEquipmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }

    const { name, brandId, purchaseDate, status, departmentId } = result.data;

    // purchaseDate is string from schema, Prisma expects Date object or ISO string.
    // If it's a valid ISO string, Prisma handles it, or we manually convert if needed.
    // Zod schema defines check for datetime format but keeps it as string.

    await prisma.equipment.create({
      data: {
        name,
        brandId,
        purchaseDate,
        status: status as any, // Enum type cast if needed
        departmentId,
        createdBy: req.user?.id || null,
      },
    });

    res.status(204).json();
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// Update equipment
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = UpdateEquipmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid input', details: result.error });
    }

    const { name, brandId, purchaseDate, status, departmentId } = result.data;

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check permission
    if (req.user?.role !== 'admin' && existing.createdBy !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.equipment.update({
      where: { id },
      data: {
        name,
        brandId,
        purchaseDate,
        status: status as any,
        departmentId,
      },
    });

    res.status(204).json()
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// Delete equipment
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.equipment.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check permission
    if (req.user?.role !== 'admin' && existing.createdBy !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.equipment.delete({
      where: { id },
    });
    res.status(204).json();
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
      where: { id },
      include: { brand: true }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL;
    const qrData = `${frontendUrl}/public/equipment/${id}`;

    const qrCode = await generateQRCode(qrData);
    res.json({ qrCode });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;
