CREATE TABLE password_reset_token
(
    id         UUID DEFAULT gen_random_uuid() NOT NULL,
    token      VARCHAR(255)                   NOT NULL,
    user_id    UUID                           NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE    NOT NULL,
    used       BOOLEAN                        NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE    NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_password_reset_token PRIMARY KEY (id)
);

ALTER TABLE password_reset_token
    ADD CONSTRAINT uc_password_reset_token_token UNIQUE (token);

ALTER TABLE password_reset_token
    ADD CONSTRAINT fk_password_reset_token_user
        FOREIGN KEY (user_id)
            REFERENCES "user" (id)
            ON DELETE CASCADE;
