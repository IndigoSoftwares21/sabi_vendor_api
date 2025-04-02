CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE shop_address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    state VARCHAR(100) NOT NULL,
    local_government_area VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);
