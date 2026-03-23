CREATE TABLE IF NOT EXISTS subscription (

                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formule VARCHAR(50) NOT NULL CHECK (formule IN ('29', '39', '69')),
    nb_vehicules_autorises INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('actif', 'expire', 'suspendu')),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_subscription_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    );