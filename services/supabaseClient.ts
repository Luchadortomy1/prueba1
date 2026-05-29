import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndoxfsqavxdgdbqlgbnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb3hmc3FhdnhkZ2RicWxnYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzEzODYsImV4cCI6MjA5NTYwNzM4Nn0.LuETvBE7sxgDMYEBxMpGpc_lDiJfG4GJEJoFtuDQTsU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
