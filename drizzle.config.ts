import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.VITE_SUPABASE_URL?.replace('supabase', 'db');

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: connectionString || '',
  },
} satisfies Config; 