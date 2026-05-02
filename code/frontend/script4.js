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
    window.location.href = "/home4";
}

function openProfile(id){
    window.location.href = "/staff/" + id;
}