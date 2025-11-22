CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE verification_token (
                                    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                    token       varchar(255) NOT NULL UNIQUE,
                                    expiry_date timestamp with time zone NOT NULL,
                                    created_at  timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    user_id     uuid NOT NULL UNIQUE
                                        REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_token_token ON verification_token (token);