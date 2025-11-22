CREATE TABLE IF NOT EXISTS compliance_block (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('document_expire', 'revision_due', 'admin_lock', 'arc_lock')),
    origin VARCHAR(50) NOT NULL CHECK (origin IN ('systeme', 'ARC', 'Admin')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    vehicle_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,

                             CONSTRAINT fk_compliance_block_vehicle
                             FOREIGN KEY (vehicle_id)
    REFERENCES vehicle (id)

);