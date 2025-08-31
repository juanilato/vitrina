import { createClient } from '@supabase/supabase-js';



export const supabase = createClient(
  "https://ieducrdeqjkyhdrnkdjo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZHVjcmRlcWpreWhkcm5rZGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDk1NjcsImV4cCI6MjA3MTYyNTU2N30.VdJoSdIJYrIM3inbAjy3R8HqXxl2MeB3oy2If8lv6w4"
);