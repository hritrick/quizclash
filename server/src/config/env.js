import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const developmentSecrets = {
  JWT_SECRET: 'super_quizclash_jwt_secret_key_12345_!@#$%^',
  JWT_REFRESH_SECRET: 'super_quizclash_refresh_secret_key_67890_!@#$%^',
};

const envSchema = z.object({
  PORT: z.string().default(process.env.PORT || '5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizclash'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 chars').default('super_quizclash_jwt_secret_key_12345_!@#$%^'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars').default('super_quizclash_refresh_secret_key_67890_!@#$%^'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('https://quizclash-eta.vercel.app'),
  COOKIE_SECRET: z.string().default('quizclash_secure_cookie_secret_999'),
}).superRefine((config, ctx) => {
  if (config.NODE_ENV !== 'production') return;
  for (const key of Object.keys(developmentSecrets)) {
    if (!process.env[key] || config[key].length < 32 || config[key] === developmentSecrets[key] || /^(replace|change|your[-_])/i.test(config[key])) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} must be a privately provisioned secret of at least 32 characters in production` });
    }
  }
  if (config.JWT_SECRET === config.JWT_REFRESH_SECRET) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['JWT_REFRESH_SECRET'], message: 'Access and refresh signing secrets must be different' });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
