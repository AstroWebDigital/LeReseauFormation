-- document.vehicle_id → SET NULL à la suppression du véhicule
ALTER TABLE document DROP CONSTRAINT IF EXISTS fk_document_vehicle;
ALTER TABLE document
    ADD CONSTRAINT fk_document_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE SET NULL;

-- Tables liées → CASCADE DELETE
ALTER TABLE compliance_block DROP CONSTRAINT IF EXISTS fk_compliance_block_vehicle;
ALTER TABLE compliance_block
    ADD CONSTRAINT fk_compliance_block_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE CASCADE;

ALTER TABLE maintenance DROP CONSTRAINT IF EXISTS fk_maintenance_vehicle;
ALTER TABLE maintenance
    ADD CONSTRAINT fk_maintenance_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE CASCADE;

ALTER TABLE pricing_rule DROP CONSTRAINT IF EXISTS fk_pricing_rule_vehicle;
ALTER TABLE pricing_rule
    ADD CONSTRAINT fk_pricing_rule_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE CASCADE;

ALTER TABLE unavailability DROP CONSTRAINT IF EXISTS fk_unavailability_vehicle;
ALTER TABLE unavailability
    ADD CONSTRAINT fk_unavailability_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicle (id) ON DELETE CASCADE;
