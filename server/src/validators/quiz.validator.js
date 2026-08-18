import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string({ required_error: 'Question text is required' }).min(5, 'Question text must be at least 5 chars'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .length(4, 'Must provide exactly 4 options'),
  correctIndex: z.number().int().min(0).max(3),
  timeLimitSec: z.number().int().min(5).max(60).optional().default(15),
  points: z.number().int().min(100).max(5000).optional().default(1000),
  explanation: z.string().optional().default(''),
});

export const createQuizSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(3).max(120),
  description: z.string().optional().default(''),
  category: z.enum([
    'General Knowledge',
    'History',
    'Science & Tech',
    'Geography',
    'Pop Culture & Movies',
    'Sports & Games',
    'Music & Arts',
    'Mythology & Literature',
  ]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  coverGradient: z.string().optional().default('amber'),
  questions: z.array(questionSchema).min(1, 'Quiz must have at least 1 question').optional(),
});

export const updateQuizSchema = createQuizSchema.partial();
