CREATE TABLE IF NOT EXISTS wallet_arc (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_affectation DATE NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_wallet_arc_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
                         ON DELETE CASCADE
);