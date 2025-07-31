import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxnvbaxspebfyezmxpbc.supabase.co'; // Replace with your URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bnZiYXhzcGViZnllem14cGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTQzNDksImV4cCI6MjA2OTQ3MDM0OX0.3x594t-_uw7a283LkzweqTjUrKJzzu2BRw9MZ5beMHk'; // Replace with your key
export const supabase = createClient(supabaseUrl, supabaseKey);