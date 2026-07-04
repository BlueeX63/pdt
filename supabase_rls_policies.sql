-- ====================================================================
-- SQL MIGRATION: Row Level Security (RLS) Policies & Storage Setup
-- ====================================================================
-- Run this script in your Supabase SQL Editor to enforce version-controlled
-- database security policies and WITH CHECK clauses across all tables.

-- 1. Enable Row Level Security on core tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-running migration
DROP POLICY IF EXISTS "Authenticated staff can manage registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated staff can manage admissions" ON admissions;

-- 3. Registrations Policy: Only authenticated staff can read, insert, update, or delete
CREATE POLICY "Authenticated staff can manage registrations"
ON registrations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Admissions Policy: Only authenticated staff can insert, update, delete
CREATE POLICY "Authenticated staff can manage admissions"
ON admissions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Storage Buckets: Create public buckets for photos if not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policy: Authenticated staff can upload photos
DROP POLICY IF EXISTS "Authenticated staff can upload photos" ON storage.objects;
CREATE POLICY "Authenticated staff can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');
