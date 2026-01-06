import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
  brandId: z.string().optional().nullable(),
  purchaseDate: z.date().optional().nullable(),
  status: z.string(),
  departmentId: z.string().optional().nullable(),
})

export const userCreateSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  name: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['user', 'admin']),
})

export const userUpdateSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  name: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  password: z.string().optional().or(z.literal('')),
  role: z.enum(['user', 'admin']),
})

export const brandSchema = z.object({
  name: z.string().min(1, 'Tên hãng là bắt buộc'),
  description: z.string().optional(),
})

export const departmentSchema = z.object({
  name: z.string().min(1, 'Tên bộ phận là bắt buộc'),
  description: z.string().optional(),
})
