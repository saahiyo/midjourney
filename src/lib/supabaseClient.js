import { createClient } from '@supabase/supabase-js'

// IMPORTANT: set these env vars in your Vite environment (e.g. .env.local)
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Supabase features will be disabled.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
