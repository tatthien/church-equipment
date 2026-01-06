import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const UserRoleEnum = z.enum(['user', 'admin']);

export const UserSchema = z.object({
  id: z.string().openapi({ example: 'cm1...' }),
  username: z.string().openapi({ example: 'johndoe' }),
  name: z.string().openapi({ example: 'John Doe' }),
  role: UserRoleEnum.openapi({ example: 'user' }),
}).openapi('UserResponse');

export const LoginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
}).openapi('LoginRequest');

export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
}).openapi('LoginResponse');

export const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(2),
  role: UserRoleEnum.optional().default('user'),
}).openapi('CreateUserRequest');

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: UserRoleEnum.optional(),
  password: z.string().min(6).optional(),
}).openapi('UpdateUserRequest');
