CREATE TABLE IF NOT EXISTS pricing_rule (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_period DATE NOT NULL,
    end_period DATE NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('saison', 'weekend', 'longue_duree')),
    daily_price DECIMAL(10, 2) NOT NULL,
    min_days INTEGER NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0.0,
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_pricing_rule_vehicle
                             FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)

    );