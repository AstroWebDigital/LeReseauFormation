CREATE TABLE IF NOT EXISTS maintenance (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('entretien', 'vidange', 'pneus', 'CT')),
    maintenance_date DATE NOT NULL,
    next_due_date DATE,
    -- Le champ doit être modifiable pour accepter NULL si l'utilisateur est supprimé
    validation_date TIMESTAMP WITH TIME ZONE,
    validated_by_arc UUID NULL, -- Modifié de NOT NULL à NULL pour permettre SET NULL
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,

                             -- 1. Si le véhicule est supprimé, la maintenance est supprimée (CASCADE)
                             CONSTRAINT fk_maintenance_vehicle
                             FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)
                         ON DELETE CASCADE,

    -- 2. Si le validateur (utilisateur) est supprimé, l'ID devient NULL (SET NULL)
    CONSTRAINT fk_maintenance_validator
    FOREIGN KEY (validated_by_arc)
    REFERENCES "user" (id)
                         ON DELETE SET NULL

    );