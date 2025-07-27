import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import { env } from './src/env';

export default defineConfig({
  out: './src/db/migrations',
  casing: 'snake_case',
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
