CREATE TABLE IF NOT EXISTS document (

                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('utilisateur', 'vehicule', 'reservation')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('carte_grise', 'assurance', 'permis', 'contrat', 'facture', 'etat_des_lieux', 'photo_checklist')),
    file_url VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('valide', 'expire', 'en_attente')),
    user_id UUID,
    vehicle_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_document_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id),   -- ← customer → "user"
    CONSTRAINT fk_document_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)

    );