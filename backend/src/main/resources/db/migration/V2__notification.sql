CREATE TABLE IF NOT EXISTS notification (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('REVISION', 'DOCUMENT', 'PAIEMENT', 'MESSAGE', 'RESERVATION', 'BLOCAGE')),
    contenu TEXT NOT NULL,
    canaux VARCHAR(50) NOT NULL CHECK (canaux IN ('EMAIL', 'PUSH')),
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,

                             -- L'ajout de ON DELETE CASCADE ici.
                             CONSTRAINT fk_notification_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
                         ON DELETE CASCADE
    );