# Setup & Database Connection (Creates Flask app, Connects to PostgreSQL database)
from flask import Flask, jsonify, render_template, session, request
import psycopg2, os

app = Flask(__name__)

conn = psycopg2.connect(
    host="localhost",
    database="staff_directory",
    user="postgres",
    password="Pavi@986"
)

#Loads HOME PAGE UI
@app.route("/")
def home():
    return render_template("home.html")

#Loads DIRECTORY PAGE UI
@app.route("/directory")
def directory():
    return render_template("directory.html")

# API (Get all users)
@app.route("/api/users")
def get_users():

    cur = conn.cursor()

    cur.execute("""
    SELECT f.user_id, f.username, f.role, f.department, f.office_location, f.profile_image, u.email
    FROM find_users f
    JOIN users u ON f.user_id = u.user_id
    """)

    rows = cur.fetchall()
    cur.close()

    users = []

    for r in rows:
        users.append({              #Example
            "id": r[0],             # "id": 1,
            "name": r[1],           # "name": "DR. Silva",
            "role": r[2],           # "role": "staff",
            "department": r[3],     # "department": "Computer Engineering",
            "location": r[4],       # "location": "2nd Floor"
            "image": r[5],          # "image": "images/silva.jpg",
            "email": r[6]           # "email": "silva@uni.lk"
        })

    return jsonify(users)

# Admin Page
@app.route("/admin")
def admin_page():

    #if session.get("role") != "admin":
     #   return "Access Denied: Only admin can access", 403

    return render_template("admin.html")

# Manage Users API (Core Logic)
@app.route("/api/manage_user", methods=["POST"])
def manage_user():

    username = request.form.get("username")
    role = request.form.get("role")
    department = request.form.get("department")
    location = request.form.get("location")
    action = request.form.get("action")

    image_file = request.files.get("image")

    image_path = None

    if image_file:
        filename = image_file.filename
        save_path = os.path.join("static/images", filename)
        image_file.save(save_path)
        image_path = "images/" + filename

    cur = conn.cursor()

    if action == "add":

        try:
            # Insert into users
            cur.execute("""
                INSERT INTO users (full_name, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
                RETURNING user_id
            """, (username, request.form.get("email"), "defaultpass", role))

            new_user_id = cur.fetchone()[0]

            # Insert into find_users
            cur.execute("""
                INSERT INTO find_users
                (user_id, username, role, department, office_location, profile_image)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (new_user_id, username, role, department, location, image_path))

            conn.commit()

            return jsonify({"message": "User added successfully"})

        except Exception as e:
            conn.rollback()  # VERY IMPORTANT

            return jsonify({"message": "Email already exists"}), 400 

    elif action == "update":

        if image_path:
            # If new image uploaded
            cur.execute("""
            UPDATE find_users
            SET department=%s,
                office_location=%s,
                profile_image=%s
            WHERE username=%s
            """,(department, location, image_path, username))
        else:
            # If NO image uploaded → keep old image
            cur.execute("""
            UPDATE find_users
            SET department=%s,
                office_location=%s
            WHERE username=%s
            """,(department, location, username))

    elif action == "delete":

        # 1. Get user_id first
        cur.execute("""
            SELECT user_id FROM find_users WHERE username=%s
        """, (username,))

        result = cur.fetchone()

        if result:
            user_id = result[0]

            # 2. Delete from find_users
            cur.execute("""
                DELETE FROM find_users WHERE user_id=%s
            """, (user_id,))

            # 3. Delete from users
            cur.execute("""
                DELETE FROM users WHERE user_id=%s
            """, (user_id,))

        conn.commit()

@app.route("/api/admin_users")
def admin_users():

    cur = conn.cursor()

    cur.execute("""
    SELECT user_id, username, role, department, office_location, profile_image
    FROM find_users
    """)

    rows = cur.fetchall()
    cur.close()

    users=[]

    for r in rows:
        users.append({
            "id":r[0],
            "name":r[1],
            "role":r[2],
            "department":r[3],
            "location":r[4],
            "image":r[5]
        })

    return jsonify(users)

@app.route("/staff/<int:staff_id>")
def staff_profile(staff_id):
    return render_template("staff_profile.html", staff_id=staff_id)

@app.route("/api/staff/<int:staff_id>")
def get_staff(staff_id):

    cur = conn.cursor()

    cur.execute("""
        SELECT username, department, office_location, profile_image
        FROM find_users
        WHERE user_id = %s
    """, (staff_id,))

    r = cur.fetchone()
    cur.close()

    return jsonify({
        "name": r[0],
        "department": r[1],
        "location": r[2],
        "image": r[3]
    })

@app.route("/edit/<int:user_id>")
def edit_page(user_id):
    return render_template("edit_user.html", user_id=user_id)


@app.route("/add")
def add_page():
    return render_template("add_user.html")

if __name__ == "__main__":
    app.run(debug=True)