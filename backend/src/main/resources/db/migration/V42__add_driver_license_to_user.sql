ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS license_number      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS license_expiry_date VARCHAR(20),
    ADD COLUMN IF NOT EXISTS license_photo_front VARCHAR(255),
    ADD COLUMN IF NOT EXISTS license_photo_back  VARCHAR(255);
