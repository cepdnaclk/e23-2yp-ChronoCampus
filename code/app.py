from flask import Flask, jsonify, render_template, session, request
import psycopg2, os

app = Flask(__name__)

conn = psycopg2.connect(
    host="localhost",
    database="staff_directory",
    user="postgres",
    password="Pavi@986"
)

# HOME PAGE
@app.route("/")
def home():
    return render_template("home.html")

# DIRECTORY PAGE
@app.route("/directory")
def directory():
    return render_template("directory.html")

# API
@app.route("/api/users")
def get_users():

    cur = conn.cursor()

    cur.execute("""
    SELECT user_id, username, role, department, office_location, profile_image
    FROM find_users
    """)

    rows = cur.fetchall()
    cur.close()

    users = []

    for r in rows:
        users.append({
            "id": r[0],
            "name": r[1],
            "role": r[2],
            "department": r[3],
            "location": r[4],
            "image": r[5]
        })

    return jsonify(users)

@app.route("/admin")
def admin_page():

    #if session.get("role") != "admin":
     #   return "Access Denied: Only admin can access", 403

    return render_template("admin.html")

import os

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

        cur.execute("""
        INSERT INTO find_users
        (username, role, department, office_location, profile_image)
        VALUES (%s,%s,%s,%s,%s)
        """,(username, role, department, location, image_path))

    elif action == "update":

        cur.execute("""
        UPDATE find_users
        SET department=%s,
            office_location=%s,
            profile_image=%s
        WHERE username=%s
        """,(department, location, image_path, username))

    elif action == "delete":

        cur.execute("""
        DELETE FROM find_users
        WHERE username=%s
        """,(username,))

    conn.commit()
    cur.close()

    return jsonify({"message":"Action completed successfully"})

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

if __name__ == "__main__":
    app.run(debug=True)