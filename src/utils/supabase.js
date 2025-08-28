import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ykjvdemxrevcgluldmtv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlranZkZW14cmV2Y2dsdWxkbXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTMxOTcsImV4cCI6MjA3MTU4OTE5N30.qi-yxNiFTJkPmk4TRQ-L3Kmj0RtIPmQtk0zFy9UqmrQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
