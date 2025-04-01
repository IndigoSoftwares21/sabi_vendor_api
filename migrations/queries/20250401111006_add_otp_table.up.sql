CREATE TABLE
    email_otp (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL CHECK (expires_at > CURRENT_TIMESTAMP) DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2m'),
        CONSTRAINT unique_email UNIQUE (email)
    );