import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const BrandSchema = z.object({
  id: z.string().openapi({ example: 'cm1...' }),
  name: z.string().min(1).openapi({ example: 'Yamaha' }),
  description: z.string().optional().nullable().openapi({ example: 'Musical instruments manufacturer' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
}).openapi('BrandResponse')

export const CreateBrandSchema = BrandSchema.pick({
  name: true,
  description: true,
}).openapi('CreateBrandRequest')

export const UpdateBrandSchema = CreateBrandSchema.partial()
