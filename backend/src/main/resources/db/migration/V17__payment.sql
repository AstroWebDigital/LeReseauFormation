CREATE TABLE IF NOT EXISTS payment (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    flow_type VARCHAR(50) NOT NULL CHECK (flow_type IN ('acompte', 'solde', 'caution_hold', 'caution_capture', 'caution_release', 'remboursement')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('en_attente', 'autorise', 'capture', 'rembourse', 'echoue')),
    reservation_id UUID NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE,

                             CONSTRAINT fk_payment_reservation
                             FOREIGN KEY (reservation_id)
    REFERENCES reservation (id)

);