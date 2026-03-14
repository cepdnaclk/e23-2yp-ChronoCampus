const backendURL = "http://127.0.0.1:5000";

/* ---------------- Message helper ----------------*/
function setMessage(elId, msg, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = (type === "error" ? "⚠ " : "✓ ") + msg;
  el.className   = type; // triggers CSS colour
}

/* ---------------- SIGNUP ---------------- */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = signupForm.querySelector("button[type=submit]");
    btn.disabled    = true;
    btn.textContent = "Creating account…";

    const data = {
      full_name:  document.getElementById("full_name").value.trim(),
      email:      document.getElementById("email").value.trim(),
      password:   document.getElementById("password").value,
      department: document.getElementById("department").value
    };

    try {
      const response = await fetch(`${backendURL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage("message", result.error || "Registration failed", "error");
        btn.disabled    = false;
        btn.textContent = "Register";
        return;
      }

      setMessage("message", result.message || "Account created! Redirecting…", "success");
      setTimeout(() => window.location.href = "login.html", 1500);

    } catch {
      setMessage("message", "Cannot connect to server. Is Flask running?", "error");
      btn.disabled    = false;
      btn.textContent = "Register";
    }
  });
}

/* ---------------- LOGIN ----------------*/
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled    = true;
    btn.textContent = "Signing in…";

    const data = {
      email:    document.getElementById("login_email").value.trim(),
      password: document.getElementById("login_password").value
    };

    try {
      const response = await fetch(`${backendURL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
        credentials: "include"
      });

      if (!response.ok) {
        const err = await response.json();
        setMessage("loginMessage", err.error || "Login failed", "error");
        btn.disabled    = false;
        btn.textContent = "Login";
        return;
      }

      const result = await response.json();
      const user   = result.user;

      // --- Save session to sessionStorage (tab-isolated) ---
      sessionStorage.setItem("user_id",   user.user_id);
      sessionStorage.setItem("role",      user.role);
      sessionStorage.setItem("user_name", user.full_name);

      setMessage("loginMessage", "Login successful! Redirecting…", "success");

      // --- Go to dashboard.html — it redirects by role ---
      setTimeout(() => window.location.href = "dashboard.html", 800);

    } catch {
      setMessage("loginMessage", "Cannot connect to server. Is Flask running?", "error");
      btn.disabled    = false;
      btn.textContent = "Login";
    }
  });
}