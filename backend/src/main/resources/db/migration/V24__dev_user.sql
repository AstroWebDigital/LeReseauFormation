WITH NewUser AS (
-- 1. Création de l'utilisateur ADMIN (propriétaire des véhicules)
INSERT INTO "user" (
    id, email, password, provider, provider_id, roles, firstname, lastname, phone, profil_photo, status, sector, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'admin@gmail.com', '$2a$10$ZFSKloTtKmrJtIQeudPCa.Z3SZuCXGXNPokbVOBu6nmcFg90EZU/G', 'LOCAL', NULL, 'ADMIN', 'Admin', 'Admin', '0000000000', NULL, 'ACTIF', 'IT', CURRENT_TIMESTAMP, NULL
    )
    RETURNING id AS user_id
    ),
    NewALP AS (
-- 2. Création de l'ALP (Association Lieu/Parking) pour l'ADMIN
INSERT INTO alp (
    id, user_id, assignment_date, created_at, updated_at
)
SELECT
    gen_random_uuid(), NewUser.user_id, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewUser
    RETURNING id AS alp_id
    ),
    InsertCustomer AS (
-- 3. Création de l'entrée CUSTOMER pour l'ADMIN
INSERT INTO customer (
    id, user_id, number_document, created_at, updated_at
)
SELECT
    gen_random_uuid(), NewUser.user_id, 101, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewUser
    RETURNING 1
    ),
    InsertARC AS (
-- 4. Création de l'ARC (Association Renta Car)
INSERT INTO arc (
    id, number_alp, alp_id, created_at, updated_at
)
SELECT
    gen_random_uuid(), 1, NewALP.alp_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewALP
    RETURNING 1
    ),
    InsertVehicles AS (
-- 5. Insertion des VEHICULES (y compris la Tesla et la Peugeot)
INSERT INTO vehicle (
    id, brand, model, license_plate, type, fuel, transmission, status, base_daily_price, listing_date, mileage, last_maintenance_date, default_parking_location, alp_id, created_at, updated_at
)
SELECT
    gen_random_uuid(), 'Renault', 'Clio V', 'AB-123-CD', 'Compact', 'Essence', 'Manuelle', 'disponible', 35.50, CURRENT_DATE, 15000, (CURRENT_DATE - INTERVAL '1 month')::date, 'Parking A', NewALP.alp_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewALP
UNION ALL
SELECT
    gen_random_uuid(), 'Tesla', 'Model 3', 'EF-456-GH', 'Berline', 'Électrique', 'Automatique', 'reserve', 75.00, (CURRENT_DATE - INTERVAL '6 months')::date, 5000, (CURRENT_DATE - INTERVAL '1 week')::date, 'Parking B', NewALP.alp_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewALP
UNION ALL
SELECT
    gen_random_uuid(), 'Peugeot', '2008', 'IJ-789-KL', 'SUV', 'Diesel', 'Automatique', 'en_revision', 45.99, (CURRENT_DATE - INTERVAL '1 year')::date, 45000, (CURRENT_DATE - INTERVAL '3 days')::date, 'Garage', NewALP.alp_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM NewALP
    RETURNING id AS vehicle_id
    ),
    NewNormalUser AS (
-- 6. Création de l'utilisateur CLIENT (user@gmail.com)
INSERT INTO "user" (
    id, email, password, provider, roles, firstname, lastname, phone, status, sector, created_at
) VALUES (
    gen_random_uuid(), 'user@gmail.com', '$2a$10$AJvPs.RsHOafa0iQtBdQWO6/V2KZDaMGZqP1k9BQ3DpA.OzSLnVJi', 'LOCAL', 'USER', 'Normal', 'User', '0000000002', 'ACTIF', 'Client', CURRENT_TIMESTAMP
    )
    RETURNING id AS user_id
    ),
    NewUserCustomer AS (
-- 7. Création de l'entrée CUSTOMER pour le CLIENT (d'où vient l'ID client)
INSERT INTO customer (
    id, user_id, number_document, created_at
)
SELECT
    gen_random_uuid(), NewNormalUser.user_id, 102, CURRENT_TIMESTAMP
FROM NewNormalUser
    RETURNING id AS customer_id -- Retourne l'ID client nécessaire
    ),
    FindPeugeot AS (
-- 8. Récupération des infos de la PEUGEOT
SELECT
    id AS vehicle_id,
    base_daily_price
FROM
    vehicle
WHERE
    model ILIKE '%2008%'
    LIMIT 1
    )
-- 9. Insertion de la RÉSERVATION en utilisant les CTEs
INSERT INTO reservation (
    id,
    start_date,
    end_date,
    pickup_location,
    return_location,
    status,
    total_amount,
    deposit_amount,
    security_deposit,
    creation_date,
    customer_id,
    vehicle_id,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    (CURRENT_TIMESTAMP + INTERVAL '1 day'),      -- Date de début dynamique
    (CURRENT_TIMESTAMP + INTERVAL '3 days'),      -- Durée de la location (2 jours)
    'Niort',
    'Niort',
    'accepte',
    (2 * FindPeugeot.base_daily_price),         -- Calcul basé sur 2 jours
    100.00,
    300.00,
    CURRENT_TIMESTAMP,
    NewUserCustomer.customer_id,                -- ID Client récupéré du CTE
    FindPeugeot.vehicle_id,                     -- ID Véhicule récupéré du CTE
    CURRENT_TIMESTAMP,
    NULL                                        -- updated_at
FROM
    NewUserCustomer, FindPeugeot;