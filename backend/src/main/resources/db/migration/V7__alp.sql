CREATE TABLE IF NOT EXISTS alp (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_date DATE,
    user_id UUID UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_alp_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
                         ON DELETE CASCADE
);