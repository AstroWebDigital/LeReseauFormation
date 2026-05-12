ALTER TABLE document DROP CONSTRAINT IF EXISTS document_type_check;

ALTER TABLE document
    ADD CONSTRAINT document_type_check
        CHECK (type IN (
            'carte_grise',
            'assurance',
            'permis',
            'permis_conduire_recto',
            'permis_conduire_verso',
            'contrat',
            'facture',
            'etat_des_lieux',
            'photo_checklist',
            'piece_identite',
            'justificatif_domicile'
        ));
