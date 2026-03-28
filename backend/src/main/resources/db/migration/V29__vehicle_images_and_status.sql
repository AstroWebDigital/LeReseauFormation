-- Add vehicle_images table
CREATE TABLE IF NOT EXISTS vehicle_images (
    vehicle_id UUID NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    CONSTRAINT fk_vehicle_images_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE CASCADE
);

-- Drop old inline status check constraint and add updated one with 'en_attente' and 'rejete'
DO $$
DECLARE
    cname text;
BEGIN
    SELECT conname INTO cname
    FROM pg_constraint
    WHERE conrelid = 'vehicle'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%';

    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE vehicle DROP CONSTRAINT ' || quote_ident(cname);
    END IF;
END $$;

ALTER TABLE vehicle
    ADD CONSTRAINT vehicle_status_check
        CHECK (status IN ('en_attente', 'disponible', 'reserve', 'bloque', 'en_revision', 'indisponible', 'en_maintenance', 'rejete'));
