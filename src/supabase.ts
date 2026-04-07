import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://eclemhrxtcvpeyknwhjr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbGVtaHJ4dGN2cGV5a253aGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzAyOTIsImV4cCI6MjA4Nzc0NjI5Mn0.UKdCmHCWbcmZ1jyGmX5Hle0v8MeVNsbGFgmDI532H-8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)