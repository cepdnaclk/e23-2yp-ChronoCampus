/* ============================================================
   ChronoCampus — auth.js
   Session management: read/write sessionStorage, role guards,
   populate nav user info, logout.
   Include this FIRST on every page.
   ============================================================ */

const Auth = (() => {
  const KEYS = { USER_ID: "user_id", ROLE: "role", USER_NAME: "user_name" };

  /* ── Read session ─────────────────────────────────────────── */
  function getUserId()   { return sessionStorage.getItem(KEYS.USER_ID); }
  function getRole()     { return sessionStorage.getItem(KEYS.ROLE); }
  function getUserName() { return sessionStorage.getItem(KEYS.USER_NAME) || "User"; }

  function getSession() {
    return {
      userId:   getUserId(),
      role:     getRole(),
      userName: getUserName(),
    };
  }

  /* ── Write session ───────────────────────────────────────── */
  function setSession(userId, role, userName) {
    sessionStorage.setItem(KEYS.USER_ID,   userId);
    sessionStorage.setItem(KEYS.ROLE,      role);
    sessionStorage.setItem(KEYS.USER_NAME, userName);
  }

  /* ── Restore session from URL params (browser reopen) ────── */
  // Call this at the top of each page. If sessionStorage is empty
  // but URL has ?user_id=&role=, restore from URL so the page works.
  function restoreFromUrl() {
    if (getRole()) return; // already have session in this tab
    const p      = new URLSearchParams(window.location.search);
    const uid    = p.get("user_id");
    const role   = p.get("role");
    const uname  = p.get("user_name") || "User";
    if (uid && role) {
      setSession(uid, role, uname);
      // Clean the URL so params don't sit there permanently
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }

  /* ── Role guards ──────────────────────────────────────────── */
  function requireRole(allowedRoles) {
    const role = getRole();
    if (!role) {
      // No session at all — go to login
      window.location.href = "/login";
      return;
    }
    if (!allowedRoles.includes(role)) {
      // Wrong role — send to the right place instead of login
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/booking";
      }
    }
  }

  /* ── Student/staff pages (booking, my_reservations) ─────── */
  // If admin lands here by mistake → go to admin.html
  // If no session → go to login.html
  function requireStudent() {
    const role = getRole();
    if (!role) { window.location.href = "/login"; return; }
    if (role === "admin") { window.location.href = "/admin"; return; }
    // student or staff — fine, stay
  }

  /* ── Admin pages ─────────────────────────────────────────── */
  // If non-admin lands here → go to booking.html
  // If no session → go to login.html
  function requireAdmin() {
    const role = getRole();
    if (!role) { window.location.href = "/login"; return; }
    if (role !== "admin") { window.location.href = "/booking"; return; }
    // admin — fine, stay
  }

  /* ── REMOVED: redirectIfAdmin (replaced by requireStudent) ── */
  // Kept as a no-op so old references don't throw errors
  function redirectIfAdmin() {
    requireStudent();
  }

  /* ── Logout ───────────────────────────────────────────────── */
  function logout() {
    sessionStorage.clear();
    window.location.href = "/";
  }

  /* ── Populate nav user UI ─────────────────────────────────── */
  function populateNav() {
    const name   = getUserName();
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const nameEl   = document.getElementById("navUserName");
    const avatarEl = document.getElementById("navAvatar");

    if (nameEl)   nameEl.textContent   = name;
    if (avatarEl) avatarEl.textContent = initials;

    // Admin avatar gets gold style
    if (getRole() === "admin" && avatarEl) {
      avatarEl.classList.add("admin-avatar");
    }
  }

  /* ── Populate admin sidebar footer ───────────────────────── */
  function populateAdminProfile() {
    const name   = getUserName();
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const nameEl     = document.getElementById("adminName");
    const avatarEl   = document.getElementById("adminAvatar");

    if (nameEl)   nameEl.textContent   = name;
    if (avatarEl) avatarEl.textContent = initials;
  }

  return {
    getUserId,
    getRole,
    getUserName,
    getSession,
    setSession,
    restoreFromUrl,
    requireStudent,
    requireAdmin,
    redirectIfAdmin,
    logout,
    populateNav,
    populateAdminProfile,
  };
})();