# Authentication Flow Diagram — User & Authentication Module
## ChronoCampus: Smart Time-Aware University Infrastructure System

---

## Overview

This document explains the complete authentication workflow as implemented in `app.py` and `script.js` — from a user opening the page to accessing a role-based dashboard.

---

## 1. Registration Flow

**Frontend:** `signup.html` + `script.js`  
**Backend:** `POST /auth/register` in `app.py`

```
User fills signup.html form
(full_name, email, password, department)
        │
        ▼
script.js: fetch POST /auth/register
        │
        ▼
[app.py — Input Validation]
 - All 4 fields present?
 - Department in ALLOWED_DEPARTMENTS?
 - Password strong? (8+ chars, upper, lower, digit)
        │
        ├── FAIL ──► Return 400 JSON error
        │           script.js shows ⚠ message
        │
        ▼ PASS
[Email + Role Detection]
 - email == "donotreply@pdn.ac.lk"  → role = "admin"
 - email ends with "@eng.pdn.ac.lk"
     └─ username matches "eNNNNN"   → role = "student"
     └─ username is letters only    → role = "staff"
     └─ neither                     → 400 Invalid format
 - other domain                     → 400 Not allowed
        │
        ▼
Hash password with bcrypt
        │
        ▼
INSERT INTO users (full_name, email, password_hash, role, department)
        │
        ├── Email duplicate ──► 400 "Email already exists"
        │
        ▼ Success
Return 201: { message, role, user_id }
        │
        ▼
script.js: shows ✓ message
setTimeout → redirect to login.html
```

---

## 2. Login Flow

**Frontend:** `login.html` + `script.js`  
**Backend:** `POST /auth/login` in `app.py`

```
User fills login.html form
(email, password)
        │
        ▼
script.js: fetch POST /auth/login  { credentials: "include" }
        │
        ▼
[app.py — Find user by email]
SELECT user_id, full_name, email, password_hash, role, is_active
FROM users WHERE email = ?
        │
        ├── Not found ──► 401 "Invalid email or password"
        │
        ▼ Found
[bcrypt.checkpw(password, password_hash)]
        │
        ├── Mismatch ──► 401 "Invalid email or password"
        │
        ▼ Match
[Check is_active]
        │
        ├── FALSE ──► 403 "Account is deactivated"
        │
        ▼ TRUE
session["user_id"] = user_id
session["role"]    = role
        │
        ▼
Return 200: { message, user: { user_id, full_name, email, role } }
        │
        ▼
script.js:
  sessionStorage.setItem("user_id",   user.user_id)
  sessionStorage.setItem("role",      user.role)
  sessionStorage.setItem("user_name", user.full_name)
        │
        ▼
setTimeout → redirect to dashboard.html
```

---

## 3. Dashboard Role Redirect

**Frontend:** `dashboard.html`

```
dashboard.html loads
        │
        ▼
Read sessionStorage["role"]
        │
        ├── "student" ──► redirect to Student Dashboard (other member)
        ├── "staff"   ──► redirect to Staff Dashboard   (other member)
        └── "admin"   ──► redirect to Admin Dashboard   (other member)
```

> `dashboard.html` acts as a routing bridge. The actual dashboards are handled by other team members' modules.

---

## 4. Logout Flow

**Backend:** `POST /auth/logout` in `app.py`

```
Logout triggered
        │
        ▼
[Check session]
 - "user_id" in session?
        │
        ├── NO ──► 401 "Not logged in"
        │
        ▼ YES
session.clear()
        │
        ▼
Return 200: { "message": "Logged out successfully" }
        │
        ▼
Frontend clears sessionStorage and redirects to login.html
```

---

## 5. Change Password Flow

**Backend:** `PUT /auth/change-password` in `app.py`

```
User submits email + old_password + new_password
        │
        ▼
[Validate all fields present]
[Validate new password strength]
        │
        ▼
SELECT password_hash FROM users WHERE email = ? AND is_active = TRUE
        │
        ├── Not found/inactive ──► 404
        │
        ▼
bcrypt.checkpw(old_password, stored_hash)
        │
        ├── Mismatch ──► 401 "Old password incorrect"
        │
        ▼
Hash new_password with bcrypt
UPDATE users SET password_hash = ?, updated_at = NOW()
        │
        ▼
Return 200: { "message": "Password changed successfully" }
```

---

## 6. Admin — User Management Flows

**Backend:** `app.py` — admin-only routes  
**Access guard:** `session["user_id"]` present AND `session["role"] == "admin"`

```
Admin request arrives
        │
        ▼
Check session["user_id"] exists?
        ├── NO  ──► 401 Unauthorized
        ▼ YES
Check session["role"] == "admin"?
        ├── NO  ──► 403 Admin access required
        ▼ YES
        │
        ├── GET  /users               → Return all users list
        ├── PUT  /users/<id>/deactivate → SET is_active = FALSE
        └── PUT  /users/<id>/activate   → SET is_active = TRUE
```

---

## 7. End-to-End System Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Browser)                    │
│landing.html → signup.html → login.html → dashboard.html │
│                    script.js  +  dark.css               │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch (JSON) + credentials
                           ▼
┌─────────────────────────────────────────────────────────┐
│                Flask Backend  (app.py)                  │
│  /auth/register   /auth/login   /auth/logout            │
│  /auth/change-password                                  │
│  /users   /users/<id>/activate   /users/<id>/deactivate │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                    ┌──────────────────────┐
│   db.py     │                    │   Flask Session      │
│  psycopg2   │                    │  session["user_id"]  │
│  + .env     │                    │  session["role"]     │
└──────┬──────┘                    └──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL  (schema.sql)                   │
│  users(user_id, full_name, email, password_hash,        │
│         role, department, is_active, created_at ...)    │
│  INDEX: idx_users_email                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Session Lifecycle

```
Login
  └──► session["user_id"] + session["role"] set (server-side Flask session)
  └──► sessionStorage: user_id, role, user_name (client-side, tab-isolated)
         │
         ▼
  Protected routes check session["user_id"] on every request
  Admin routes additionally check session["role"] == "admin"
         │
         ▼
Logout / Tab close
  └──► session.clear() on server
  └──► sessionStorage cleared on client
```

---

## Security Notes

- Passwords hashed with **bcrypt** — never stored or logged as plain text
- Both Flask session (server) and `sessionStorage` (client) are used — Flask session is the authority for protected API calls
- `sessionStorage` is tab-isolated — closing the tab clears client-side session data
- `is_active` flag allows admins to block accounts without deleting them
- University email domain (`@eng.pdn.ac.lk`) and username pattern enforce role assignment at source
