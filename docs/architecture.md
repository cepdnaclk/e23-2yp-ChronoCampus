# Architecture Overview — User & Authentication Module
## ChronoCampus: Smart Time-Aware University Infrastructure System

---

## Overview

The User & Authentication Module follows a **Layered MVC (Model-View-Controller)** architecture. This separates concerns into distinct layers, making the codebase easier to maintain, test, and extend.

The module is responsible for:
- User registration with university email validation and role detection
- Secure login and logout with session management
- Role-based access control (Student / Staff / Admin)
- Password hashing using bcrypt
- REST API endpoints consumed by the frontend
- Admin-level user activation and deactivation

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (View)                      │
│              HTML / CSS / JavaScript Pages               │
│    index.html  |  login.html  |  signup.html             │
│    dark.css    |  script.js   |  dashboard.html          │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP Requests (JSON via fetch API)
                       ▼
┌──────────────────────────────────────────────────────────┐
│              Flask Application Layer                     │
│                    app.py  (Controller)                  │
│                                                          │
│  /auth/register          /auth/login                     │
│  /auth/logout            /auth/change-password           │
│  /users                  /users/<id>/activate            │
│                          /users/<id>/deactivate          │
└──────────────┬──────────────────────────┬────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐       ┌──────────────────────────┐
│   db.py              │       │   Flask Session           │
│   Database connector │       │   (server-side)          │
│   via psycopg2 +     │       │   session["user_id"]     │
│   .env credentials   │       │   session["role"]        │
└──────────┬───────────┘       └──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│                      schema.sql                          │
│            users table (user_id, full_name,              │
│            email, password_hash, role, department,       │
│            is_active, created_at, updated_at ...)        │
└──────────────────────────────────────────────────────────┘
```

---

## File Structure

```
UserAuthenticationModule/
├── code/
│   ├── backend/
│   │   ├── app.py       # Flask routes and auth logic
│   │   ├── db.py        # PostgreSQL connection helper
│   │   └── .env         # DB credentials (not committed)
│   └── frontend/
│       ├── index.html   # Landing page
│       ├── login.html   # Login page
│       ├── signup.html  # Registration page
│       ├── dashboard.html # Role-based redirect page
│       ├── dark.css     # Shared stylesheet
│       └── script.js    # Fetch API calls (login + signup)
├── database/
│   └── schema.sql       # PostgreSQL table definitions
├── docs/
└── README.md
```

---

## Layers Explained

### 1. View Layer — Frontend
- Static HTML/CSS/JS files in `code/frontend/`
- Communicates with Flask via **fetch API** (JSON)
- `script.js` handles both signup and login form submissions
- After login, `sessionStorage` holds `user_id`, `role`, and `user_name`
- `dashboard.html` reads `sessionStorage` to redirect by role

### 2. Controller Layer — Flask Routes (`app.py`)
- Handles all incoming HTTP requests and returns JSON responses
- Validates input, applies business rules, and manages sessions
- Uses `CORS` with `supports_credentials=True` for cross-origin session handling

### 3. Database Layer — PostgreSQL + `db.py`
- `db.py` loads credentials from `.env` using `python-dotenv`
- Connects via `psycopg2`
- Schema defined in `database/schema.sql`
- Email indexed (`idx_users_email`) for fast login queries

### 4. Session Management
- Flask server-side session stores `user_id` and `role` on login
- Cleared fully on logout via `session.clear()`
- Protected routes check `session["user_id"]` before responding
- Admin-only routes additionally check `session["role"] == "admin"`

---

## Role Detection Logic

Role is automatically determined at registration based on the university email:

| Email Pattern | Role |
|---|---|
| `donotreply@pdn.ac.lk` | `admin` |
| `e12345@eng.pdn.ac.lk` (eNNNNN format) | `student` |
| `john@eng.pdn.ac.lk` (letters only) | `staff` |
| Any other email | Rejected |

---

## Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| `student` | Login, view own profile, access student dashboard |
| `staff` | Login, view own profile, access staff dashboard |
| `admin` | All of the above + list users, activate/deactivate accounts |

---

## Security Measures

- Passwords hashed with **bcrypt** before storage — plain text never saved
- Sessions signed with `app.secret_key`
- University email domain (`@eng.pdn.ac.lk`) enforced on registration
- Password strength validated: min 8 chars, uppercase, lowercase, digit
- Deactivated accounts (`is_active = FALSE`) are blocked at login
- Admin-only routes protected by both session check and role check
