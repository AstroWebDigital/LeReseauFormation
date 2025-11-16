CREATE TABLE IF NOT EXISTS maintenance (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('entretien', 'vidange', 'pneus', 'CT')),
    maintenance_date DATE NOT NULL,
    next_due_date DATE,
    validation_date TIMESTAMP WITH TIME ZONE,
    validated_by_arc UUID,
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_maintenance_vehicle
                             FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id),
    CONSTRAINT fk_maintenance_validator
    FOREIGN KEY (validated_by_arc)
    REFERENCES "user" (id)

);