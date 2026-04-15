import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TRAVEL_JOURNAL_API_URL: z.url().default('http://localhost:8000'),
  VITE_APP_AUTH_SERVER_URL: z.url().default('http://localhost:3000/auth')
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(`❌ Invalid environment variables:\n${z.prettifyError(parsedEnv.error)}`);
}

export const { VITE_APP_TRAVEL_JOURNAL_API_URL, VITE_APP_AUTH_SERVER_URL } = parsedEnv.data;
