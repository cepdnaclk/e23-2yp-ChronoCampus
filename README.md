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
Execution instructions will be added after backend and frontend integration
