CREATE TABLE IF NOT EXISTS reminder (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('VEHICULE', 'DOCUMENT', 'RESERVATION', 'PAIEMENT')),
    target_id UUID NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_reminder_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    );