CREATE TABLE IF NOT EXISTS vehicle (

                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    fuel VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('disponible', 'reserve', 'bloque', 'en_revision')),
    base_daily_price DECIMAL(10, 2) NOT NULL,
    listing_date DATE NOT NULL,
    mileage INTEGER NOT NULL,
    last_maintenance_date DATE,
    default_parking_location VARCHAR(255),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_vehicle_user
                             FOREIGN KEY (user_id)
    REFERENCES "user" (id)

    );