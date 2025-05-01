import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify environment variables are loaded
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://iiynpheftfhvimloydlr.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeW5waGVmdGZodmltbG95ZGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM3NDc2OTQsImV4cCI6MjAyOTMyMzY5NH0.5sBUEa-Ij8UEV5NZM0GKQvZFEX6qSj_ZGoCVLuBKLWQ'
);