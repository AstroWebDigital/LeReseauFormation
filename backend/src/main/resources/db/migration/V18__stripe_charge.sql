CREATE TABLE IF NOT EXISTS stripe_charge (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capture_status VARCHAR(50) NOT NULL CHECK (capture_status IN ('non_capturé', 'capturé', 'remboursé', 'remboursé_partiellement')),
    amount_authorized DECIMAL(10, 2),
    amount_captured DECIMAL(10, 2),
    amount_refunded DECIMAL(10, 2),
    is_security BOOLEAN NOT NULL DEFAULT FALSE,
    reservation_id UUID NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_stripe_charge_reservation
                             FOREIGN KEY (reservation_id)
    REFERENCES reservation (id)

);