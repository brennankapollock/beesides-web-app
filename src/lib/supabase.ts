import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Verify environment variables are loaded
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY');
}
// Create client even if env vars are missing (development fallback)
export const supabase = createClient(supabaseUrl || 'https://iiynpheftfhvimloydlr.supabase.co', supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeW5waGVmdGZodmltbG95ZGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQ0OTQsImV4cCI6MjA2MDc2MDQ5NH0.pT5kbgZUdvViH53g3D7-JiRCFXAmTi2rj48J8DbzESY');