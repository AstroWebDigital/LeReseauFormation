CREATE TABLE IF NOT EXISTS message (
                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    has_mentions BOOLEAN NOT NULL DEFAULT FALSE,
    sender_user_id UUID NOT NULL,
    reservation_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,

                             -- L'ajout de ON DELETE CASCADE ici. Si l'utilisateur est supprimé, ses messages le sont aussi.
                             CONSTRAINT fk_message_sender
                             FOREIGN KEY (sender_user_id)
    REFERENCES "user" (id)
                         ON DELETE CASCADE,

    CONSTRAINT fk_message_message_reservation
    FOREIGN KEY (reservation_id)
    REFERENCES reservation (id)
    -- Si vous voulez aussi que les messages soient supprimés quand la réservation l'est, ajoutez ON DELETE CASCADE ici aussi.
    );