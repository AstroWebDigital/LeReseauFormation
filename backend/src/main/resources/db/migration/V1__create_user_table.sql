CREATE TABLE "user"
(
    id           UUID         NOT NULL,
    email        VARCHAR(255) NOT NULL,
    password     VARCHAR(255),
    provider     VARCHAR(255) NOT NULL,
    provider_id  VARCHAR(255),
    roles        VARCHAR(255) NOT NULL,
    firstname    VARCHAR(255),
    lastname     VARCHAR(255),
    phone        VARCHAR(255),
    profil_photo VARCHAR(255),
    status       VARCHAR(255) NOT NULL,
    sector       VARCHAR(255),
    created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at   TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_user PRIMARY KEY (id)
);

ALTER TABLE "user"
    ADD CONSTRAINT uc_user_email UNIQUE (email);