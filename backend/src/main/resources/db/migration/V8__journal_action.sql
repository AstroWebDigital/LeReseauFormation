CREATE TABLE IF NOT EXISTS journal_action (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entite VARCHAR(50) NOT NULL,
    entite_id UUID NOT NULL,
    action TEXT NOT NULL,
    date_action TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_journal_action_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)

);