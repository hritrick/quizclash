import { z } from 'zod';

export const createRoomSchema = z.object({
  quizId: z.string({ required_error: 'Quiz ID is required' }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid Quiz ID'),
  mode: z.enum(['multiplayer', 'solo']).optional().default('multiplayer'),
});

export const joinRoomSchema = z.object({
  code: z.string({ required_error: 'Room code is required' }).length(6, 'Room code must be 6 characters').toUpperCase(),
});
