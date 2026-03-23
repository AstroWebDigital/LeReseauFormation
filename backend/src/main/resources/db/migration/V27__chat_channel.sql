CREATE TABLE chat_channel (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                              channel_name VARCHAR(255) NOT NULL,

                              status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED', 'BLOCKED')),

                              reservation_id UUID NOT NULL,
                              CONSTRAINT fk_channel_reservation
                                  FOREIGN KEY (reservation_id)
                                      REFERENCES reservation (id) ON DELETE CASCADE,
                              CONSTRAINT uk_channel_reservation_id UNIQUE (reservation_id),

                              renter_user_id UUID NOT NULL,
                              CONSTRAINT fk_channel_renter
                                  FOREIGN KEY (renter_user_id)
                                      REFERENCES "user" (id),

                              owner_user_id UUID NOT NULL,
                              CONSTRAINT fk_channel_owner
                                  FOREIGN KEY (owner_user_id)
                                      REFERENCES "user" (id),

                              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_chat_channel_reservation ON chat_channel (reservation_id);
CREATE INDEX idx_chat_channel_renter ON chat_channel (renter_user_id);   -- ← customer → renter
CREATE INDEX idx_chat_channel_owner ON chat_channel (owner_user_id);     -- ← alp → owner