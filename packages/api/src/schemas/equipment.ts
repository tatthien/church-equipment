import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const EquipmentStatusEnum = z.enum(['new', 'old', 'damaged', 'repairing', 'disposed'])

import { BrandSchema } from './brands'
import { DepartmentSchema } from './departments'
import { UserSchema } from './auth'

export const EquipmentSchema = z.object({
  id: z.string().openapi({ example: 'cm1...' }),
  name: z.string().min(1).openapi({ example: 'Microphone SM58' }),
  purchaseDate: z.string().datetime().nullable().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  status: EquipmentStatusEnum.openapi({ example: 'new' }),

  // Relations FKs
  departmentId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),

  // Expanded Relations
  brand: BrandSchema.nullable().optional(),
  department: DepartmentSchema.nullable().optional(),
  creator: UserSchema.nullable().optional(),
}).openapi('EquipmentResponse')

export const CreateEquipmentSchema = z.object({
  name: z.string().min(1),
  brandId: z.string().optional().nullable(),
  purchaseDate: z.iso.datetime().optional().nullable(),
  status: EquipmentStatusEnum.default('new'),
  departmentId: z.string().optional().nullable(),
}).openapi('CreateEquipmentRequest')

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial()
