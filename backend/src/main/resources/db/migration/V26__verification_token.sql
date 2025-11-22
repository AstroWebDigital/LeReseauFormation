CREATE TABLE verification_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL UNIQUE,
        CONSTRAINT fk_verification_token_user
        FOREIGN KEY (user_id)
        REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_token_token ON verification_token (token);