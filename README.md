# ChronoCampus

Smart Time-Aware University Infrastructure Management System

## Overview
ChronoCampus is a web-based system designed for university environments to manage academic schedules, facility reservations, and staff locations. The system provides real-time schedule visibility, room and lab availability, and automated notifications for schedule changes.

## Problem Statement
Universities face several operational issues:
- Lack of real-time visibility of daily schedules
- Difficulty identifying free rooms and laboratories
- Manual and error-prone reservation processes
- No centralized system for staff office locations
- Delayed communication when schedules change

## Proposed Solution
ChronoCampus centralizes schedule, reservation, and location data into a single web platform. The system coordinates time, space, and users using a modular backend architecture, ensuring consistency and real-time updates.

## Core Features
- Live daily schedules for lectures, labs, tutorials, and exams
- Room and lab availability search
- Facility reservation management
- Staff directory with office and cabin locations
- Notifications for schedule changes

## Technology Stack
- Backend: Python Flask
- Frontend: HTML, CSS, JavaScript
- Database: PostgreSQL
- Version Control: Git, GitHub

## Branching Strategy
This repository follows a structured Git workflow.

- main  
  Stable branch containing demo-ready and evaluated code

- dev  
  Development integration branch where features are merged and tested

- feature branches  
  Used for individual module development and merged into dev via pull requests

## Code Division and Team Responsibilities
Each member is responsible for an independent system module. All members write code.

### Member 1: User and Authentication Module
- User model and role management
- Login and logout
- User profile handling

Backend files:
- backend/models/user.py
- backend/routes/auth.py

Branch:
- feature-auth

### Member 2: Schedule Management Module
- Lecture, lab, and exam schedules
- Daily timetable view
- Real-time schedule updates

Backend files:
- backend/models/schedule.py
- backend/routes/schedule.py

Branch:
- feature-schedule

### Member 3: Facility and Reservation Module
- Room and lab management
- Availability search
- Booking and conflict handling

Backend files:
- backend/models/room.py
- backend/routes/reservation.py

Branch:
- feature-reservation

### Member 4: Notification and Staff Module
- Staff directory
- Office and cabin location management
- Notifications for schedule changes

Backend files:
- backend/models/staff.py
- backend/routes/notification.py

Branch:
- feature-notifications

## Frontend Split
- Build their own frontend page for their backend
- Connects to their API

## Development Workflow
- Each member works on a separate feature branch
- Commits are small and frequent
- Pull requests are created to merge into dev
- dev is merged into main only after testing

## Project Timeline
- Semester 3: Planning, design, and working prototype
- Semester 4: Advanced orchestration, optimization, and final system delivery

## Team
- Member 1: User and authentication module
- Member 2: Schedule management module
- Member 3: Facility and reservation module
- Member 4: Notification and staff module

## How to Run
### 1. Clone Repository

git clone https://github.com/cepdnaclk/e23-co2060-ChronoCampus.git  
cd e23-co2060-ChronoCampus  

---

### 2. Setup Database

Open terminal:

psql -U postgres  

Create database:

CREATE DATABASE chronocampus;  
\c chronocampus  

Run schema:

\i schema.sql  

This will:

• Create all tables  
• Insert sample room data  

---

### 3. Setup Backend

Go to backend folder:

cd code/backend  

Install dependencies:

pip install -r requirements.txt  

---

### 4. Configure Environment Variables

Create file:

code/backend/.env  

Add:

DB_HOST=localhost  
DB_NAME=chronocampus  
DB_USER=your_postgres_username  
DB_PASSWORD=your_postgres_password  

---

### 5. Run Backend Server

1. Open terminal in the project folder and to create a venv write this command:

python -m venv .venv

2. Activation command:

.venv\Scripts\activate

3. Commands to install all packages:

pip install flask flask-cors flask-sqlalchemy psycopg2-binary bcrypt python-dotenv

6. To Run Flask:

python app.py

Expected output:

Running on http://127.0.0.1:5000/  

---

### 6. Run Frontend or Click that link in output
### That's All.

# Contribution's-ChronoCampus – Room Visibility and Availability Module  
### Member 2 (Thanush V.)

## Overview

This module provides real-time room status and schedule visibility for the ChronoCampus system.  

It allows users to:

- View all lecture halls and labs  
- Check real-time room status (Free / Occupied)  
- View daily schedules  
- Search rooms by name  
- Check available time slots within working hours  

---

## Scope of Work

This module includes:

- Database structure related to `rooms` and `reservations`
- Backend REST APIs for room visibility
- Frontend interfaces for displaying room data

This module does **not** include:
- User authentication (Member 1)
- Booking and cancellation logic (Member 3)
- Staff and lecturer management (Member 4)

---

## Database

### Tables Used

- `rooms`
- `reservations`

### Constraints

- Bookings allowed only between **08:00 and 17:00**
- `start_time` must be less than `end_time`
- No overlapping reservations
- Minute-level precision supported
- Foreign key relationship: `reservations.user_id → users.id`
- Foreign key relationship: `reservations.room_id → rooms.id`

The database structure is defined in:
