CREATE TABLE IF NOT EXISTS subscription_billing (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_facture VARCHAR(255) UNIQUE NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EMIS', 'PAYE', 'EN_RETARD')),
    emission_date DATE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_subscription_billing_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    );