CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (
        role IN ('student', 'staff', 'admin')
    ),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
