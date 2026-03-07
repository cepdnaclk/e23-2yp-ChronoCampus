const backendURL = "http://127.0.0.1:5000";

/* ---------------- SIGNUP ---------------- */

const signupForm = document.getElementById("signupForm");

if(signupForm){

signupForm.addEventListener("submit", async function(e){

e.preventDefault();

const data = {
full_name: document.getElementById("full_name").value,
email: document.getElementById("email").value,
password: document.getElementById("password").value,
department: document.getElementById("department").value
};

try{

const response = await fetch(`${backendURL}/auth/register`,{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)

});

const result = await response.json();

document.getElementById("message").innerText =
result.message || result.error;

if(result.message){
setTimeout(()=>{
window.location.href="login.html";
},1500);
}

}catch(error){

document.getElementById("message").innerText="Server error";

}

});

}

/* ---------------- LOGIN ---------------- */

const loginForm = document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit", async function(e){

e.preventDefault();

const data = {
email: document.getElementById("login_email").value,
password: document.getElementById("login_password").value
};

try{

const response = await fetch(`${backendURL}/auth/login`,{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data),
credentials:"include"

});
if(!response.ok){
    const errorData = await response.json();
    document.getElementById("loginMessage").innerText =
        errorData.error || "Login failed";
    return;
}

const result = await response.json();

document.getElementById("loginMessage").innerText =
result.message;

// Redirect to home page (for testing)
setTimeout(() => {
    window.location.href = "home.html";
}, 1000);

}catch(error){

document.getElementById("loginMessage").innerText="Cannot connect to server";

}

});

}