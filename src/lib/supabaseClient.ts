import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'REMOVED_SUPABASE_URL';
const supabaseAnonKey = 'REMOVED_SUPABASE_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
