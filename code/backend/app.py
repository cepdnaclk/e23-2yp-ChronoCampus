from flask import Flask, jsonify, request, session
from db import get_db_connection
import bcrypt
import re

app = Flask(__name__)

# Secret Key
app.secret_key = "Chronocampus_2026"

# Password Strength Function
def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    return True

# Home Route
@app.route("/")
def home():
    return {"message": "ChronoCampus Auth Module Running"}

# Get All Users
@app.route("/users")
def get_users():
    
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized. Please login."}), 401

    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Fetch users
    cur.execute("""
        SELECT user_id, full_name, email, role, is_active
        FROM users;
    """)

    users = cur.fetchall()

    cur.close()
    conn.close()

    user_list = []
    for user in users:
        user_list.append({
            "user_id": user[0],
            "full_name": user[1],
            "email": user[2],
            "role": user[3],
            "is_active": user[4]
        })

    return jsonify(user_list), 200


# Register User (With University Email Validation)

#@app.route("/register", methods=["POST"])
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")

    if not full_name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    # Strong password validation
    if not is_strong_password(password):
        return jsonify({
            "error": "Password must be at least 8 characters and include uppercase, lowercase, and number"
        }), 400
    
    # Email + Role Validation
    # Special admin email
    admin_email = "donotreply@pdn.ac.lk"
    # Allowed university domain
    allowed_domain = "@eng.pdn.ac.lk"

    username = email.split("@")[0]
    role = None

    # Determine role based on email
    if email == admin_email:
        role = "admin"
    elif email.endswith(allowed_domain):
        student_pattern = r"^e\d{5}$"   # e.g., e12345
        staff_pattern = r"^[a-zA-Z]+$"  # only letters

        if re.match(student_pattern, username):
            role = "student"
        elif re.match(staff_pattern, username):
            role = "staff"
        else:
            return jsonify({"error": "Invalid university email format"}), 400
    else:
        return jsonify({"error": "Only university emails or admin email are allowed"}), 400


    # Hash password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )
     # Insert into DB
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id;
        """, (
            full_name,
            email,
            hashed_password.decode("utf-8"),
            role
        ))

        user_id = cur.fetchone()[0]
        conn.commit()

    except Exception:
        conn.rollback()
        return jsonify({"error": "Email already exists"}), 400

    finally:
        cur.close()
        conn.close()

    return jsonify({
        "message": "User registered successfully",
        "role": role,
        "user_id": user_id
    }), 201

# Login User (Creates Session)

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT user_id, full_name, email, password_hash, role, is_active
    FROM users
    WHERE email = %s;
""", (email,))

    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    user_id, full_name, email, password_hash, role, is_active = user

    # Verify password
    if not bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not is_active:
        return jsonify({"error": "Account is deactivated"}), 403
    
    # Store Session
    session["user_id"] = user_id
    session["role"] = role

    return jsonify({
        "message": "Login successful",
        "user": {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "role": role
        }
    }), 200

# Logout User
@app.route("/auth/logout", methods=["POST"])
def logout():

    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    # Clear Session
    session.clear()

    return jsonify({"message": "Logged out successfully"}), 200

# Change Password

@app.route("/auth/change-password", methods=["PUT"])
def change_password():
    data = request.get_json()

    email = data.get("email")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not email or not old_password or not new_password:
        return jsonify({"error": "All fields are required"}), 400

    if not is_strong_password(new_password):
        return jsonify({
            "error": "New password must be at least 8 characters and include uppercase, lowercase, and number"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT password_hash FROM users
        WHERE email = %s AND is_active = TRUE;
    """, (email,))

    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return jsonify({"error": "User not found or inactive"}), 404

    stored_hash = user[0]

    if not bcrypt.checkpw(old_password.encode("utf-8"), stored_hash.encode("utf-8")):
        cur.close()
        conn.close()
        return jsonify({"error": "Old password incorrect"}), 401

    new_hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    cur.execute("""
        UPDATE users
        SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
        WHERE email = %s;
    """, (new_hashed.decode("utf-8"), email))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Password changed successfully"}), 200


# Deactivate User (Admin Action only)

@app.route("/users/<int:user_id>/deactivate", methods=["PUT"])
def deactivate_user(user_id):
    
    #
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
   
    # Deactivate target user
    cur.execute("""
        UPDATE users
        SET is_active = FALSE
        WHERE user_id = %s
        RETURNING user_id;
    """, (user_id,))

    result = cur.fetchone()

    if not result:
        cur.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": "User deactivated successfully",
        "user_id": user_id
    }), 200

# Activate User (Admin Only)

@app.route("/users/<int:user_id>/activate", methods=["PUT"])
def activate_user(user_id):
    
    #
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if session.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
  
    # Activate target user
    cur.execute("""
        UPDATE users
        SET is_active = TRUE
        WHERE user_id = %s
        RETURNING user_id;
    """, (user_id,))

    result = cur.fetchone()

    if not result:
        cur.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": "User activated successfully",
        "user_id": user_id
    }), 200

# Run Server
if __name__ == "__main__":
    app.run(debug=True)
