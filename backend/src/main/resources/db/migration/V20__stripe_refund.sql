CREATE TABLE IF NOT EXISTS stripe_refund (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
    stripe_payment_intent_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_refund_payment_intent
                             FOREIGN KEY (stripe_payment_intent_id)
    REFERENCES stripe_payment_intent (id)

);