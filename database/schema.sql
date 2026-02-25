-- =====================================================
-- ChronoCampus - User & Authentication Module
-- PostgreSQL Schema
-- =====================================================

-- Drop table for development reset (only for during development)
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (
        role IN ('student', 'staff', 'admin')
    ),
    is_active BOOLEAN DEFAULT TRUE,                     -- Account control
    email_verified BOOLEAN DEFAULT FALSE,               --(Future Enhancement)
    verification_token TEXT,
    -- Audit timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);   -- Index for faster login queries
