-- Run this SQL in your Supabase Dashboard SQL Editor to add location functionality
-- Go to: https://supabase.com/dashboard/project/uhldzobbbqeojcudnjis/sql

-- Add location fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;