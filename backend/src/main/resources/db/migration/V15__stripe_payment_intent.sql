CREATE TABLE IF NOT EXISTS stripe_payment_intent (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('acompte', 'solde', 'caution')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('succeeded', 'canceled')),
    reservation_id UUID NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_stripe_pi_reservation
                             FOREIGN KEY (reservation_id)
    REFERENCES reservation (id)
    );