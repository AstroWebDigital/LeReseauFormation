CREATE TABLE IF NOT EXISTS reservation (

                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                           pickup_location VARCHAR(255) NOT NULL,
    return_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('en_attente', 'accepte', 'refuse', 'confirmee', 'annulee', 'terminee', 'litige')),
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    security_deposit DECIMAL(10, 2),
    creation_date TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
                           CONSTRAINT fk_reservation_user
                           FOREIGN KEY (user_id)
    REFERENCES "user" (id),   -- ← customer → "user"
    CONSTRAINT fk_reservation_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)

    );