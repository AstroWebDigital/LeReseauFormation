CREATE TABLE vehicle_availability (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id  UUID NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT vehicle_availability_dates_check CHECK (end_date > start_date)
);

CREATE INDEX idx_vehicle_availability_vehicle_id ON vehicle_availability(vehicle_id);
