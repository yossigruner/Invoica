import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Initialize Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Helper function to run migrations (this will need to be run from Supabase's interface)
export async function runMigrations() {
  console.log('Please run migrations from Supabase dashboard or CLI');
  console.log('You can find the SQL schema in src/db/schema.sql');
} 