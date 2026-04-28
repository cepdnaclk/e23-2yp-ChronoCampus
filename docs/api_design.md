# API Design — User & Authentication Module
## ChronoCampus: Smart Time-Aware University Infrastructure System

---

## Overview

This document describes the REST API for the User & Authentication Module, implemented in `app.py`.  
The frontend (`script.js`) communicates with Flask via **fetch API** using JSON.

**Base URL (Development):** `http://127.0.0.1:5000`

> Note: `script.js` uses `http://127.0.0.1:5000` as `backendURL`. Requests use `credentials: "include"` for session cookies.

---

## Authentication Endpoints

### 1. Register User
**`POST /auth/register`**

Registers a new user. Role is automatically determined from the email pattern.  
Validates university email domain, password strength, and department.

**Request Body:**
```json
{
  "full_name": "Anna Nimal",
  "email": "e12345@eng.pdn.ac.lk",
  "password": "SecurePass1",
  "department": "Computer Engineering"
}
```

**Success Response — `201 Created`:**
```json
{
  "message": "User registered successfully",
  "role": "student",
  "user_id": 7
}
```

**Error Responses:**

| Status | Error Message |
|--------|---------------|
| `400` | `"All fields are required"` |
| `400` | `"Invalid department selected"` |
| `400` | `"Password must be at least 8 characters and include uppercase, lowercase, and number"` |
| `400` | `"Invalid university email format"` |
| `400` | `"Only university emails or admin email are allowed"` |
| `400` | `"Email already exists"` |

**Email → Role Mapping:**

| Email | Assigned Role |
|-------|---------------|
| `donotreply@pdn.ac.lk` | `admin` |
| `eNNNNN@eng.pdn.ac.lk` | `student` |
| `letters@eng.pdn.ac.lk` | `staff` |

**Allowed Departments:**
- Computer Engineering
- Electrical And Electronic Engineering
- Mechanical Engineering
- Civil Engineering
- Chemical Engineering
- Manufacturing And Industrial Engineering
- Mathematics

---

### 2. Login
**`POST /auth/login`**

Authenticates a user, verifies password with bcrypt, checks `is_active`, and creates a Flask session.

**Request Body:**
```json
{
  "email": "e12345@eng.pdn.ac.lk",
  "password": "SecurePass1"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": 7,
    "full_name": "Anna Nimal",
    "email": "e12345@eng.pdn.ac.lk",
    "role": "student"
  }
}
```

> After login, `script.js` saves `user_id`, `role`, and `user_name` to `sessionStorage` and redirects to `dashboard.html`.

**Error Responses:**

| Status | Error Message |
|--------|---------------|
| `400` | `"Email and password are required"` |
| `401` | `"Invalid email or password"` |
| `403` | `"Account is deactivated"` |

---

### 3. Logout
**`POST /auth/logout`**

Clears the current Flask session (`session.clear()`).

**Request Body:** _(none)_

**Success Response — `200 OK`:**
```json
{
  "message": "Logged out successfully"
}
```

**Error Response:**

| Status | Error Message |
|--------|---------------|
| `401` | `"Not logged in"` |

---

### 4. Change Password
**`PUT /auth/change-password`**

Updates a user's password after verifying the old one. Validates new password strength.

**Request Body:**
```json
{
  "email": "e12345@eng.pdn.ac.lk",
  "old_password": "SecurePass1",
  "new_password": "NewPass2025"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**

| Status | Error Message |
|--------|---------------|
| `400` | `"All fields are required"` |
| `400` | `"New password must be at least 8 characters and include uppercase, lowercase, and number"` |
| `401` | `"Old password incorrect"` |
| `404` | `"User not found or inactive"` |

---
## **Note:** This endpoint is implemented in the backend but not yet connected to a frontend page.

## User Management Endpoints (Admin Only)

> All endpoints below require an active session with `role = "admin"`.  
> Returns `401` if not logged in, `403` if not admin.

### 5. Get All Users
**`GET /users`**

Returns a list of all registered users.

**Success Response — `200 OK`:**
```json
[
  {
    "user_id": 7,
    "full_name": "Anna Nimal",
    "email": "e12345@eng.pdn.ac.lk",
    "role": "student",
    "is_active": true
  }
]
```

---

### 6. Deactivate User
**`PUT /users/<user_id>/deactivate`**

Sets `is_active = FALSE` for the specified user. Deactivated users cannot log in.

**Success Response — `200 OK`:**
```json
{
  "message": "User deactivated successfully",
  "user_id": 7
}
```

**Error Response:**

| Status | Error Message |
|--------|---------------|
| `404` | `"User not found"` |

---
## **Note:** This endpoint is implemented in the backend but not yet connected to a frontend page.

### 7. Activate User
**`PUT /users/<user_id>/activate`**

Sets `is_active = TRUE` for the specified user, restoring login access.

**Success Response — `200 OK`:**
```json
{
  "message": "User activated successfully",
  "user_id": 7
}
```

**Error Response:**

| Status | Error Message |
|--------|---------------|
| `404` | `"User not found"` |

---
## **Note:** This endpoint is implemented in the backend but not yet connected to a frontend page.

## API Summary Table

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| `POST` | `/auth/register` | Register new user | No | — |
| `POST` | `/auth/login` | Login and create session | No | — |
| `POST` | `/auth/logout` | Logout and clear session | Yes | Any |
| `PUT` | `/auth/change-password` | Change user password | No | — |
| `GET` | `/users` | List all users | Yes | Admin |
| `PUT` | `/users/<id>/deactivate` | Deactivate a user account | Yes | Admin |
| `PUT` | `/users/<id>/activate` | Activate a user account | Yes | Admin |

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Descriptive error message"
}
```

---

## Notes

- Flask CORS is configured with `supports_credentials=True` to allow session cookies across `127.0.0.1:5000` and the frontend origin
- `script.js` sends `credentials: "include"` on the login request to persist the session cookie
- The `/` home route returns `{"message": "ChronoCampus Auth Module Running"}` as a health check
