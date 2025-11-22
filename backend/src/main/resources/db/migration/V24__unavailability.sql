CREATE TABLE IF NOT EXISTS unavailability (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('reservation', 'blocage', 'maintenance')),
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
                           CONSTRAINT fk_unavailability_vehicle
                           FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)

);