-- Supprime l'ancien check constraint sur le type de document
ALTER TABLE document DROP CONSTRAINT IF EXISTS document_type_check;

-- Recrée le constraint en ajoutant les types utilisateur manquants
ALTER TABLE document
    ADD CONSTRAINT document_type_check
        CHECK (type IN (
            'carte_grise',
            'assurance',
            'permis',
            'contrat',
            'facture',
            'etat_des_lieux',
            'photo_checklist',
            'piece_identite',
            'justificatif_domicile'
        ));
