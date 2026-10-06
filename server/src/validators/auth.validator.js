import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username cannot exceed 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, 'Password cannot exceed 72 bytes'),
  role: z.enum(['player', 'host']).optional().default('player'),
  avatarSeed: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }),
});

export const updateProfileSchema = z.object({
  username: registerSchema.shape.username.optional(),
  avatarSeed: z.string().trim().min(1).max(100).optional(),
}).strict();
