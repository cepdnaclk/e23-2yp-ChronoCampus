<<<<<<< HEAD
const BASE_URL = "http://127.0.0.1:5000";

/* Current Status */
function loadStatus() {
    fetch(BASE_URL + "/rooms/current-status")
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("status");
        if (!div) return;

        div.innerHTML = "";

        data.forEach(room => {
            const card = document.createElement("div");
            card.className = "card";

            if (room.status === "Occupied") {
                card.innerHTML =
                    room.room_name +
                    " - <span class='occupied'>Occupied</span> (" +
                    room.booked_from + " - " +
                    room.booked_to + ")";
            } else {
                card.innerHTML =
                    room.room_name +
                    " - <span class='free'>Free</span>";
            }

            div.appendChild(card);
        });
    });
}

/* Daily Schedule */
function loadSchedule() {
    const date = document.getElementById("dateInput").value;

    fetch(BASE_URL + "/rooms/schedule?date=" + date)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("schedule");
        if (!div) return;

        div.innerHTML = "";

        data.forEach(room => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = "<h3>" + room.room_name + "</h3>";

            if (room.bookings.length === 0) {
                card.innerHTML += "<p>No bookings</p>";
            } else {
                room.bookings.forEach(b => {
                    card.innerHTML +=
                        "<p>" + b.start + " - " + b.end + "</p>";
                });
            }

            div.appendChild(card);
        });
    });
}

/* Search Room */
function searchRoom() {
    const name = document.getElementById("searchName").value;
    const date = document.getElementById("searchDate").value;

    fetch(BASE_URL + "/rooms/search?name=" + name + "&date=" + date)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("searchResult");
        if (!div) return;

        div.innerHTML = "";

        data.forEach(room => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = "<h3>" + room.room_name + "</h3>";

            room.bookings.forEach(b => {
                card.innerHTML +=
                    "<p>" + b.start + " - " + b.end + "</p>";
            });

            div.appendChild(card);
        });
    });
}

/* Availability */
function checkAvailability() {
    const roomId = document.getElementById("roomId").value;
    const date = document.getElementById("availDate").value;

    fetch(BASE_URL + "/rooms/availability?room_id=" + roomId + "&date=" + date)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("availability");
        if (!div) return;

        div.innerHTML = "";

        if (data.free_slots.length === 0) {
            div.innerHTML = "<p>No free slots</p>";
            return;
        }

        data.free_slots.forEach(slot => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML =
                "Free: " + slot.start + " - " + slot.end;
            div.appendChild(card);
        });
    });
=======
let userList = [];

/* -------- FETCH USERS FROM FLASK API -------- */

fetch("/api/users")
.then(response => response.json())
.then(data => {

    userList = data;
    displayUsers(data);

})
.catch(error => {
    console.error("Error loading users:", error);
});

/* -------- DISPLAY USER CARDS -------- */

function displayUsers(users){

    const container = document.getElementById("staffContainer");

    if(!container) return;

    container.innerHTML = "";

    users.forEach(u => {

        container.innerHTML += `
        <div class="staff-card" onclick="openProfile(${u.id})">

            <img src="/images/${u.image}" width="120">

            <h3>${u.name}</h3>

            <p>${u.department}</p>

        </div>
        `;

    });

}

/* -------- SHOW LOCATION -------- */

function showLocation(location){

    alert("Office Location: " + location);

}

/* -------- SEARCH + FILTER -------- */

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");

if(searchInput){
    searchInput.addEventListener("input", filterUsers);
}

if(roleFilter){
    roleFilter.addEventListener("change", filterUsers);
}

function filterUsers(){

    const search = searchInput.value.toLowerCase();
    const role = roleFilter.value;

    const filtered = userList.filter(u => {

        const matchSearch = u.name.toLowerCase().includes(search);
        const matchRole = role === "all" || u.role === role;

        return matchSearch && matchRole;

    });

    displayUsers(filtered);

}

/* -------- BACK BUTTON -------- */

function goBack(){
    window.location.href = "/";
}

function openProfile(id){
    window.location.href = "/staff/" + id;
>>>>>>> Paveenan-M04-Notification-and-Staff-Module
}