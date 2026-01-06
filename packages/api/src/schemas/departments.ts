import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const DepartmentSchema = z.object({
  id: z.string().openapi({ example: 'cm1...' }),
  name: z.string().min(1).openapi({ example: 'Audio' }),
  description: z.string().nullable().optional().openapi({ example: 'Audio equipment' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' }),
}).openapi('DepartmentResponse');

export const CreateDepartmentSchema = DepartmentSchema.pick({
  name: true,
  description: true,
}).openapi('CreateDepartmentRequest');

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();
