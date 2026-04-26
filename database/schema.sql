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


-- =========================
-- ROOMS TABLE (Shared)
-- =========================
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- RESERVATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_room
        FOREIGN KEY(room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_time CHECK (start_time < end_time),

    CONSTRAINT working_hours CHECK (
        start_time >= '08:00' AND
        end_time <= '17:00'
    )
);

-- =========================
-- INDEX
-- =========================
CREATE INDEX IF NOT EXISTS idx_room_date
ON reservations(room_id, date);

-- =========================
-- SAMPLE DATA (FOR DEMO)
-- =========================
INSERT INTO rooms (room_name, location, capacity)
VALUES 
('Hall A', 'Main Building', 120),
('Hall B', 'Main Building', 100),
('Lab 1', 'Engineering Block', 40),
('Lab 2', 'Engineering Block', 35)
ON CONFLICT (room_name) DO NOTHING;

INSERT INTO reservations (user_id, room_id, date, start_time, end_time, status)
VALUES (1, 1, CURRENT_DATE, '11:00', '13:00', 'confirmed');
