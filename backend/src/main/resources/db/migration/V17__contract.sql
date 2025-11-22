CREATE TABLE IF NOT EXISTS contract (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pdf_url VARCHAR(255) NOT NULL,
    client_signed_at TIMESTAMP WITH TIME ZONE,
    alp_signed_at TIMESTAMP WITH TIME ZONE,
    signature_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'signed', 'expired')),
    reservation_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                                 CONSTRAINT fk_contract_reservation
                                 FOREIGN KEY (reservation_id)
    REFERENCES reservation (id)

);