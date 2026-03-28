-- Ajouter 'rejete' au statut des documents
DO $$
DECLARE
    cname text;
BEGIN
    SELECT conname INTO cname
    FROM pg_constraint
    WHERE conrelid = 'document'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%';

    IF cname IS NOT NULL THEN
        EXECUTE 'ALTER TABLE document DROP CONSTRAINT ' || quote_ident(cname);
    END IF;
END $$;

ALTER TABLE document
    ADD CONSTRAINT document_status_check
        CHECK (status IN ('valide', 'expire', 'en_attente', 'rejete'));
