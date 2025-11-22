CREATE TABLE IF NOT EXISTS arc (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number_alp INTEGER NOT NULL,
    alp_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_arc_alp
                             FOREIGN KEY (alp_id)
    REFERENCES alp (id)

);