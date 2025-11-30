CREATE TABLE chat_channel (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                              channel_name VARCHAR(255) NOT NULL,

                              status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED', 'BLOCKED')),

                              reservation_id UUID NOT NULL,
                              CONSTRAINT fk_channel_reservation
                                  FOREIGN KEY (reservation_id)
                                      REFERENCES reservation (id) ON DELETE CASCADE,
                              CONSTRAINT uk_channel_reservation_id UNIQUE (reservation_id),

                              customer_id UUID NOT NULL,
                              CONSTRAINT fk_channel_customer
                                  FOREIGN KEY (customer_id)
                                      REFERENCES customer (id),

                              alp_id UUID NOT NULL,
                              CONSTRAINT fk_channel_alp
                                  FOREIGN KEY (alp_id)
                                      REFERENCES alp (id),

                              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_chat_channel_reservation ON chat_channel (reservation_id);
CREATE INDEX idx_chat_channel_customer ON chat_channel (customer_id);
CREATE INDEX idx_chat_channel_alp ON chat_channel (alp_id);