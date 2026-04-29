let userList = [];

function goBack() {
    window.location.href = "/";
}

/* ---------- ADD USER ---------- */

function confirmAdd() {

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const department = document.getElementById("department").value;
    const location = document.getElementById("location").value;

    if (username == "" || email == "" || role == "" || department == "" || location == "") {
        alert("Please fill all fields before adding user");
        return;
    }

    if (confirm("Are you sure you want to ADD this user?")) {
        saveUser("add");
    }

}

/* ---------- UPDATE USER ---------- */

function confirmUpdate() {

    const username = document.getElementById("username").value;

    if (username == "") {
        alert("Please enter username to update");
        return;
    }

    if (confirm("Are you sure you want to UPDATE this user?")) {
        saveUser("update");
    }

}

/* ---------- DELETE USER ---------- */

function confirmDelete() {

    const username = document.getElementById("username").value;

    if (username == "") {
        alert("Please enter username to delete");
        return;
    }

    if (confirm("Are you sure you want to DELETE this user?")) {
        saveUser("delete");
    }

}

/* ---------- SAVE USER (ADD / UPDATE / DELETE) ---------- */

function saveUser(action) {

    const formData = new FormData();

    formData.append("username", document.getElementById("username").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("role", document.getElementById("role").value);
    formData.append("department", document.getElementById("department").value);
    formData.append("location", document.getElementById("location").value);
    formData.append("action", action);

    const fileInput = document.getElementById("image");

    if (fileInput.files.length > 0) {
        formData.append("image", fileInput.files[0]);
    }

    fetch("/api/manage_user", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message)
            location.reload()
        })

}

/* ---------- LOAD USERS FOR ADMIN PANEL ---------- */

fetch("/api/users")
    .then(res => res.json())
    .then(data => {
        userList = data;
        displayAdminUsers(data);
    });

/* ---------- DISPLAY USER CARDS ---------- */

function displayAdminUsers(users) {

    const container = document.getElementById("adminUserContainer");
    container.innerHTML = "";

    container.innerHTML = `
    <div class="staff-card add-card" onclick="goAddUser()">
        <div class="add-icon">+</div>
        <h3>Add User</h3>
    </div>
`;

    users.forEach(u => {

    container.innerHTML += `
    <div class="staff-card">

        <img src="/images/${u.image}" width="100">

        <h3>${u.name}</h3>

        <p>${u.department}</p>

        <button onclick="goEdit(${u.id})">Update</button>
        <button onclick="deleteUser('${u.name}')">Delete</button>

    </div>
    `;
});

}

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");

searchInput.addEventListener("input", filterUsers);
roleFilter.addEventListener("change", filterUsers);

function filterUsers(){

    const search = searchInput.value.toLowerCase();
    const role = roleFilter.value;

    const filtered = userList.filter(u => {

        const matchSearch = u.name.toLowerCase().includes(search);
        const matchRole = role === "all" || u.role === role;

        return matchSearch && matchRole;
    });

    displayAdminUsers(filtered);
}

function goAddUser(){
    window.location.href = "/add";
}

/* ---------- DELETE BUTTON ---------- */

function deleteUser(username) {

    if (confirm("Delete this user?")) {

        const formData = new FormData();
        formData.append("username", username);
        formData.append("action", "delete");

        fetch("/api/manage_user", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message)
                location.reload()
            })

    }

}

/* ---------- UPDATE BUTTON ---------- */

function editUser(name, email, role, department, location) {

    document.getElementById("username").value = name;
    document.getElementById("email").value = email;
    document.getElementById("role").value = role;
    document.getElementById("department").value = department;
    document.getElementById("location").value = location;

}

function goEdit(id){
    window.location.href = "/edit/" + id;
}