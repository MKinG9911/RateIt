-- ──────────────────────────────────────────────────────────
-- RateIt — Auto Confirm Dummy Emails Script
-- ──────────────────────────────────────────────────────────
-- Run this SQL in your Supabase SQL Editor to automatically confirm
-- any registered email without requiring access to a real inbox.
-- ──────────────────────────────────────────────────────────

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
