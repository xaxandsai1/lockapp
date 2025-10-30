-- Add verified field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN profiles.is_verified IS 'Whether the user has been verified by an admin';
