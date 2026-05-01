-- Drop all tables (safe reset for development)
DROP TABLE IF EXISTS canceled_reservations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS room_waitlist CASCADE;
DROP TABLE IF EXISTS room_watchlist CASCADE;
DROP TABLE IF EXISTS override_requests CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ─────────────────────────────────────────
-- USERS TABLE
-- Owned by Member 1 (auth/login module)
-- Includes department column from their schema
-- ─────────────────────────────────────────
CREATE TABLE users (
    user_id            SERIAL PRIMARY KEY,
    full_name          VARCHAR(100) NOT NULL,
    email              VARCHAR(150) UNIQUE NOT NULL,
    password_hash      TEXT NOT NULL,
    role               VARCHAR(20) NOT NULL CHECK (role IN ('student', 
'staff', 'admin')),
    department         VARCHAR(100) NOT NULL,
    is_active          BOOLEAN DEFAULT TRUE,
    email_verified     BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_users_email ON users(email);


-- Only seed the admin user — students and staff register via signup page
-- Password '123' is plain text for development; member 1 will handle 
hashing in production




-- ─────────────────────────────────────────
-- ROOMS TABLE
-- ─────────────────────────────────────────
CREATE TABLE rooms (
    room_id    SERIAL PRIMARY KEY,
    room_name  VARCHAR(100) NOT NULL,
    capacity   INTEGER NOT NULL,
    location   VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rooms (room_name, capacity, location) VALUES
('Hall A', 120, 'Main Building'),
('Hall B', 100, 'Main Building'),
('Lecture Room 1', 60, 'Science Block'),
('Lecture Room 2', 55, 'Science Block'),
('Lab 1', 40, 'Engineering Block'),
('Lab 2', 35, 'Engineering Block'),
('Computer Lab A', 50, 'IT Center'),
('Computer Lab B', 45, 'IT Center'),
('Seminar Room 1', 30, 'Admin Block'),
('Seminar Room 2', 25, 'Admin Block');


-- ─────────────────────────────────────────
-- RESERVATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE reservations (
    reservation_id   SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON 
DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON 
DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 
'rejected', 'cancelled')),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- OVERRIDE REQUESTS TABLE
-- ─────────────────────────────────────────
CREATE TABLE override_requests (
    request_id     SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations
(reservation_id) ON DELETE CASCADE,
    lecturer_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE 
CASCADE,
    student_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE 
CASCADE,
    status         VARCHAR(20) DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- ROOM WATCHLIST TABLE
-- ─────────────────────────────────────────
CREATE TABLE room_watchlist (
    watch_id         SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON 
DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON 
DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- NOTIFICATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE 
CASCADE,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- CANCELED RESERVATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE canceled_reservations (
    cancel_id      SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations
(reservation_id) ON DELETE CASCADE,
    canceled_by    INTEGER REFERENCES users(user_id),
    reason         TEXT,
    canceled_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ─────────────────────────────────────────
-- ROOM WAITLIST (QUEUE) TABLE
-- ─────────────────────────────────────────
CREATE TABLE room_waitlist (
    waitlist_id      SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON 
DELETE CASCADE,
    room_id          INTEGER NOT NULL REFERENCES rooms(room_id) ON 
DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    queue_position   INTEGER NOT NULL,
    status           VARCHAR(20) DEFAULT 'waiting'
                     CHECK (status IN ('waiting', 'notified', 
'expired')),
    created_at       TIMESTAMP DEFAULT NOW()
);


CREATE INDEX idx_waitlist_room_slot
    ON room_waitlist (room_id, reservation_date, start_time, end_time);



CREATE TABLE find_users (
    user_id INT,
    username VARCHAR(100),
    role VARCHAR(20),
    department VARCHAR(100),
    office_location VARCHAR(150),
    profile_image VARCHAR(255)
);

INSERT INTO find_users 
(user_id, username, role, department, office_location, profile_image)
VALUES
(1,'Dr. Silva','staff','Computer Engineering',
'Computer Engineering Department - 2nd Floor',
'images/silva.jpg'),

(2,'Prof. Perera','staff','Electrical Engineering',
'Electrical Engineering Department - 3rd Floor',
'images/perera.jpg'),

(3,'Dr. Fernando','staff','Mechanical Engineering',
'Mechanical Engineering Block - 1st Floor',
'images/fernando.jpg'),

(4,'Ms. Jayasuriya','staff','Information Technology',
'IT Department - 4th Floor',
'images/jayasuriya.jpg'),

(5,'Mr. Wickramasinghe','staff','Civil Engineering',
'Civil Engineering Building - Ground Floor',
'images/wickramasinghe.jpg');

INSERT INTO users (full_name,email,password_hash,role)
VALUES
('Dr. Silva','silva@uni.lk','hashedpass','staff'),
('Prof. Perera','perera@uni.lk','hashedpass','staff'),
('Dr. Fernando','fernando@uni.lk','hashedpass','staff'),
('Ms. Jayasuriya','jayasuriya@uni.lk','hashedpass','staff'),
('Mr. Wickramasinghe','wickramasinghe@uni.lk','hashedpass','staff');

INSERT INTO find_users
(user_id, username, role, department, office_location, profile_image)
VALUES
(6,'Admin Perera','admin','Administration',
'Admin Office - Ground Floor',
'images/admin1.jpg'),

(7,'Admin Silva','admin','Administration',
'Admin Office - Room 102',
'images/admin2.jpg'),

(8,'Student Nimal','student','Computer Engineering',
'CE Student Lab',
'images/student1.jpg'),

(9,'Student Kamal','student','Electrical Engineering',
'EE Student Room',
'images/student2.jpg');

SELECT username, role FROM find_users;

SELECT * FROM find_users;

INSERT INTO users (full_name,email,password_hash,role)
VALUES
('Admin Perera','adminperera@uni.lk','hashedpass','admin'),
('Admin Silva','adminsilva@uni.lk','hashedpass','admin'),
('Student Nimal','studentnimal@uni.lk','hashedpass','student'),
('Student Kamal','studentkamal@uni.lk','hashedpass','student');

ALTER TABLE users
ADD COLUMN department VARCHAR(100);