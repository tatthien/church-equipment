import { Router } from 'express';
import prisma from '../db/prisma.js';

const router = Router();

// Get public equipment details
router.get('/equipment/:id', async (req, res) => {
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

        const mappedEquipment = {
            id: equipment.id,
            name: equipment.name,
            brand_name: equipment.brand?.name || null,
            department_name: equipment.department?.name || null,
            status: equipment.status,
            purchaseDate: equipment.purchaseDate,
            createdAt: equipment.createdAt,
            // Limited fields for public view
        };

        res.json(mappedEquipment);
    } catch (error) {
        console.error('Get public equipment error:', error);
        res.status(500).json({ error: 'Failed to get equipment' });
    }
});

export default router;
