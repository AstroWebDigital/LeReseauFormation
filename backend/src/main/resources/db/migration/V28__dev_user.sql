WITH NewAdminUser AS (
-- 1. Création de l'utilisateur ADMIN (propriétaire des véhicules)
INSERT INTO "user" (
    id, email, password, provider, provider_id, roles, firstname, lastname, phone, profil_photo, status, sector, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'admin@gmail.com', '$2a$10$ZFSKloTtKmrJtIQeudPCa.Z3SZuCXGXNPokbVOBu6nmcFg90EZU/G', 'LOCAL', NULL, 'ADMIN', 'Admin', 'Admin', '0000000000', NULL, 'ACTIF', 'IT', CURRENT_TIMESTAMP, NULL
    ) RETURNING id AS user_id
    ),
    InsertVehicles AS (
-- 2. Insertion des VEHICULES liés directement à l'ADMIN
INSERT INTO vehicle (
    id, brand, model, license_plate, type, fuel, transmission, status, base_daily_price, listing_date, mileage, last_maintenance_date, default_parking_location, user_id, created_at, updated_at
)
SELECT gen_random_uuid(), 'Renault', 'Clio V', 'AB-123-CD', 'Compact', 'Essence', 'Manuelle', 'disponible', 35.50, CURRENT_DATE, 15000, (CURRENT_DATE - INTERVAL '1 month')::date, 'Parking A', NewAdminUser.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM NewAdminUser
UNION ALL
SELECT gen_random_uuid(), 'Tesla', 'Model 3', 'EF-456-GH', 'Berline', 'Électrique', 'Automatique', 'reserve', 75.00, (CURRENT_DATE - INTERVAL '6 months')::date, 5000, (CURRENT_DATE - INTERVAL '1 week')::date, 'Parking B', NewAdminUser.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM NewAdminUser
UNION ALL
SELECT gen_random_uuid(), 'Peugeot', '2008', 'IJ-789-KL', 'SUV', 'Diesel', 'Automatique', 'en_revision', 45.99, (CURRENT_DATE - INTERVAL '1 year')::date, 45000, (CURRENT_DATE - INTERVAL '3 days')::date, 'Garage', NewAdminUser.user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM NewAdminUser
    RETURNING id AS vehicle_id
    ),
    NewNormalUser AS (
-- 3. Création de l'utilisateur CLIENT
INSERT INTO "user" (
    id, email, password, provider, roles, firstname, lastname, phone, status, sector, created_at
) VALUES (
    gen_random_uuid(), 'user@gmail.com', '$2a$10$AJvPs.RsHOafa0iQtBdQWO6/V2KZDaMGZqP1k9BQ3DpA.OzSLnVJi', 'LOCAL', 'USER', 'Normal', 'User', '0000000002', 'ACTIF', 'Client', CURRENT_TIMESTAMP
    ) RETURNING id AS user_id
    ),
    FindPeugeot AS (
-- 4. Récupération de la PEUGEOT
SELECT id AS vehicle_id, base_daily_price
FROM vehicle
WHERE model ILIKE '%2008%'
    LIMIT 1
    )
-- 5. Insertion de la RÉSERVATION
INSERT INTO reservation (
    id, start_date, end_date, pickup_location, return_location, status,
    total_amount, deposit_amount, security_deposit, creation_date,
    user_id, vehicle_id, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    (CURRENT_TIMESTAMP + INTERVAL '1 day'),
    (CURRENT_TIMESTAMP + INTERVAL '3 days'),
    'Niort', 'Niort', 'accepte',
    (2 * FindPeugeot.base_daily_price),
    100.00, 300.00,
    CURRENT_TIMESTAMP,
    NewNormalUser.user_id,   -- ← customer_id → user_id
    FindPeugeot.vehicle_id,
    CURRENT_TIMESTAMP, NULL
FROM NewNormalUser, FindPeugeot;