from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, time
import psycopg2
import os

# =========================
# CREATE FLASK APP
# =========================
app = Flask(__name__)
CORS(app)

# =========================
# DATABASE CONNECTION
# =========================
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database= "chronocampus",   # change this
        user="postgres",            # change this
        password="kali"         # change this
    )
    return conn
# Home Page
@app.route("/")
def home():
    return "ChronoCampus Backend Running"

# =========================
# API 01 - CURRENT STATUS
# =========================
@app.route("/rooms/current-status", methods=["GET"])
def current_status():
    conn = get_db_connection()
    cur = conn.cursor()

    now = datetime.now().time().replace(second=0, microsecond=0)

    cur.execute("SELECT id, room_name FROM rooms")
    rooms = cur.fetchall()

    result = []

    for room in rooms:
        room_id, room_name = room

        cur.execute("""
            SELECT start_time, end_time
            FROM reservations
            WHERE room_id = %s
            AND date = CURRENT_DATE
            AND %s BETWEEN start_time AND end_time
        """, (room_id, now))

        booking = cur.fetchone()

        if booking:
            result.append({
                "room_id": room_id,
                "room_name": room_name,
                "status": "Occupied",
                "booked_from": str(booking[0]),
                "booked_to": str(booking[1])
            })
        else:
            result.append({
                "room_id": room_id,
                "room_name": room_name,
                "status": "Free"
            })

    cur.close()
    conn.close()

    return jsonify(result)


# =========================
# API 02 - DAILY SCHEDULE
# =========================
@app.route("/rooms/schedule", methods=["GET"])
def daily_schedule():
    date = request.args.get("date")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, room_name FROM rooms")
    rooms = cur.fetchall()

    output = []

    for room in rooms:
        room_id, room_name = room

        cur.execute("""
            SELECT start_time, end_time
            FROM reservations
            WHERE room_id = %s
            AND date = %s
            ORDER BY start_time
        """, (room_id, date))

        bookings = cur.fetchall()

        booking_list = []
        for b in bookings:
            booking_list.append({
                "start": str(b[0]),
                "end": str(b[1])
            })

        output.append({
            "room_id": room_id,
            "room_name": room_name,
            "bookings": booking_list
        })

    cur.close()
    conn.close()

    return jsonify(output)


# =========================
# API 03 - SEARCH ROOM
# =========================
@app.route("/rooms/search", methods=["GET"])
def search_room():
    name = request.args.get("name")
    date = request.args.get("date")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, room_name
        FROM rooms
        WHERE room_name ILIKE %s
    """, (f"%{name}%",))

    rooms = cur.fetchall()

    result = []

    for room in rooms:
        room_id, room_name = room

        cur.execute("""
            SELECT start_time, end_time
            FROM reservations
            WHERE room_id = %s
            AND date = %s
            ORDER BY start_time
        """, (room_id, date))

        bookings = cur.fetchall()

        booking_list = []
        for b in bookings:
            booking_list.append({
                "start": str(b[0]),
                "end": str(b[1])
            })

        result.append({
            "room_id": room_id,
            "room_name": room_name,
            "bookings": booking_list
        })

    cur.close()
    conn.close()

    return jsonify(result)


# =========================
# API 04 - ROOM AVAILABILITY
# =========================
@app.route("/rooms/availability", methods=["GET"])
def room_availability():
    room_id = request.args.get("room_id")
    date = request.args.get("date")

    working_start = time(8, 0)
    working_end = time(17, 0)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT start_time, end_time
        FROM reservations
        WHERE room_id = %s
        AND date = %s
        ORDER BY start_time
    """, (room_id, date))

    bookings = cur.fetchall()

    free_slots = []
    current_pointer = working_start

    for booking in bookings:
        start, end = booking

        if start > current_pointer:
            free_slots.append({
                "start": str(current_pointer),
                "end": str(start)
            })

        current_pointer = max(current_pointer, end)

    if current_pointer < working_end:
        free_slots.append({
            "start": str(current_pointer),
            "end": str(working_end)
        })

    cur.close()
    conn.close()

    return jsonify({
        "room_id": room_id,
        "free_slots": free_slots
    })


# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    app.run(debug=True)