-- Add Clover integration fields to profiles table
ALTER TABLE profiles
ADD COLUMN clover_api_key TEXT,
ADD COLUMN clover_merchant_id TEXT;

-- Add encryption extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- Create a function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_clover_api_key() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clover_api_key IS NOT NULL THEN
        NEW.clover_api_key = pgsodium.crypto_aead_det_encrypt(
            NEW.clover_api_key::bytea,
            NEW.user_id::bytea,  -- Associated data
            current_setting('app.encryption_key')::bytea  -- Encryption key
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for encryption
CREATE TRIGGER encrypt_clover_api_key_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_clover_api_key();

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for viewing own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for updating own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_merchant_id ON profiles(clover_merchant_id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.clover_api_key IS 'Encrypted Clover API key for payment processing';
COMMENT ON COLUMN profiles.clover_merchant_id IS 'Clover merchant ID for payment processing';
COMMENT ON COLUMN profiles.user_id IS 'References auth.users.id';

-- Add constraints
ALTER TABLE profiles
    ADD CONSTRAINT clover_merchant_id_check CHECK (
        clover_merchant_id ~ '^[A-Z0-9]{8,}$'  -- Basic format validation
    ); 