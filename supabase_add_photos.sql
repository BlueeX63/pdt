-- Run this query in your Supabase SQL Editor to add photo and time columns:
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS owner_photo TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS dog_photo TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS aadhar_card_front_photo TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS aadhar_card_back_photo TEXT;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS entry_time TEXT;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS exit_time TEXT;
