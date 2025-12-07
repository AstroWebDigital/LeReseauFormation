CREATE TABLE IF NOT EXISTS customer (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number_document INTEGER,
    user_id UUID UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_customer_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)
                         ON DELETE CASCADE
);