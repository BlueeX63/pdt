-- ====================================================================
-- SQL MIGRATION: Add Invoice & Payment Status Fields to Admissions
-- ====================================================================
-- Run this script in your Supabase SQL Editor to enable invoice
-- tracking, payment links, and online payment status updates.

ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID',
ADD COLUMN IF NOT EXISTS invoice_no TEXT,
ADD COLUMN IF NOT EXISTS billed_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0;

-- Optional: Create an index on payment_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_admissions_payment_status ON admissions(payment_status);

-- Optional: Comment on columns
COMMENT ON COLUMN admissions.payment_status IS 'Payment status of the hostel stay: UNPAID or PAID';
COMMENT ON COLUMN admissions.invoice_no IS 'Unique invoice reference number generated upon checkout';
COMMENT ON COLUMN admissions.billed_amount IS 'Total calculated stay amount in INR';
COMMENT ON COLUMN admissions.advance_amount IS 'Advance payment made for this stay in INR';
