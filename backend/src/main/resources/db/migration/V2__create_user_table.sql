CREATE TABLE IF NOT EXISTS "user" (
                                      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255), -- NULL possible pour les comptes SSO
    provider    VARCHAR(50) NOT NULL DEFAULT 'LOCAL', -- LOCAL / KEYCLOAK / GOOGLE / etc.
    provider_id VARCHAR(255),
    roles       VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
    );
