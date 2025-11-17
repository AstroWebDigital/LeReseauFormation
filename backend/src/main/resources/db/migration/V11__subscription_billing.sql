CREATE TABLE IF NOT EXISTS subscription_billing (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_facture VARCHAR(255) UNIQUE NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    statut VARCHAR(50) NOT NULL CHECK (statut IN ('emis', 'paye', 'en_retard')),
    date_emission DATE NOT NULL,
    subscription_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_facturation_subscription
                             FOREIGN KEY (subscription_id)
    REFERENCES subscription (id)
);