from flask import Flask
import psycopg2
from flask import jsonify
from flask import request

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="chronocampus",
        user="postgres",
        password="kali"
    )
    return conn

@app.route("/")
def home():
    return "ChronoCampus Backend Running"

@app.route("/test-db")
def test_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM rooms;")
        rooms = cur.fetchall()
        cur.close()
        conn.close()
        return str(rooms)
    except Exception as e:
        return str(e)
    


@app.route("/rooms", methods=["GET"])
def get_rooms():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM rooms;")
    rooms = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rooms)


@app.route("/reserve", methods=["POST"])
def reserve_room():
    data = request.get_json()

    user_id = data["user_id"]
    room_id = data["room_id"]
    date = data["date"]
    start_time = data["start_time"]
    end_time = data["end_time"]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO reservations (user_id, room_id, date, start_time, end_time)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, room_id, date, start_time, end_time))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Reservation created successfully"}


if __name__ == "__main__":
    app.run(debug=True)
