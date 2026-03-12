/* ============================================================
   ChronoCampus — admin.js
   Admin dashboard: overview, reservations, users,
   overrides, watchlist, waitlist.
   Requires: auth.js, api.js
   ============================================================ */

/* ── Toast ────────────────────────────────────────────────────── */
function showToast(msg, type = "t-success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

/* ── Modal ────────────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add("show"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("show"); }

/* ── Format helpers ───────────────────────────────────────────── */
function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(dt) {
  if (!dt) return "—";
  return formatDate(dt) + " " + formatTime(dt);
}

function statusBadge(status) {
  return `<span class="status-badge status-${status}">${status}</span>`;
}

/* ── Sidebar navigation ───────────────────────────────────────── */
function showSection(name) {
  document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  document.getElementById(`section-${name}`)?.classList.add("active");
  document.querySelector(`[data-section="${name}"]`)?.classList.add("active");

  document.getElementById("pageTitle").textContent = {
    overview:     "Overview",
    reservations: "Reservations",
    users:        "Users",
    overrides:    "Override Requests",
    watchlist:    "Watchlist",
    waitlist:     "Waitlist Queue",
  }[name] || "Admin";

  // Lazy load section
  const loaders = {
    overview:     loadOverview,
    reservations: loadReservations,
    users:        loadUsers,
    overrides:    loadOverrides,
    watchlist:    loadWatchlist,
    waitlist:     loadWaitlist,
  };
  loaders[name]?.();
}

/* ── Refresh all ──────────────────────────────────────────────── */
async function refreshAll() {
  showToast("Refreshing…", "t-info");
  await Promise.all([
    loadOverview(),
    loadReservations(),
    loadUsers(),
    loadOverrides(),
    loadWatchlist(),
    loadWaitlist(),
  ]);
  showToast("✅ Data refreshed", "t-success");
}

/* ════════════════════════════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════════════════════════════ */
async function loadOverview() {
  try {
    const [resRes, usersRes, overRes, watchRes, waitRes] = await Promise.all([
      API.getAllReservations(),
      API.getUsers(),
      API.getOverrides(),
      API.getWatchlist(),
      API.getWaitlist(),
    ]);

    const res   = resRes.data   || [];
    const users = usersRes.data || [];
    const over  = overRes.data  || [];
    const watch = watchRes.data || [];
    const wait  = waitRes.data  || [];

    const pending  = res.filter(r => r.status === "pending").length;
    const approved = res.filter(r => r.status === "approved").length;

    setValue("ovTotal",    res.length);
    setValue("ovPending",  pending);
    setValue("ovApproved", approved);
    setValue("ovUsers",    users.length);
    setValue("ovOverrides",over.filter(o => o.status === "pending").length);
    setValue("ovWatchlist",watch.length);
    setValue("ovWaitlist", wait.filter(w => w.status === "waiting").length);
  } catch {
    showToast("❌ Failed to load overview", "t-error");
  }
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ════════════════════════════════════════════════════════════════
   RESERVATIONS
════════════════════════════════════════════════════════════════ */
let allRes = [];
let resFilter = "all";

async function loadReservations() {
  const tbody = document.getElementById("resTbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">Loading…</td></tr>`;
  try {
    const { ok, data } = await API.getAllReservations();
    if (!ok) throw new Error();
    allRes = data;
    renderResTable();
  } catch {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted)">Failed to load</td></tr>`;
  }
}

function setResFilter(f) {
  resFilter = f;
  document.querySelectorAll("#resFilterTabs .filter-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.filter === f));
  renderResTable();
}

function renderResTable() {
  const tbody  = document.getElementById("resTbody");
  const search = document.getElementById("resSearch")?.value?.toLowerCase() || "";
  if (!tbody) return;

  let list = allRes;
  if (resFilter !== "all") list = list.filter(r => r.status === resFilter);
  if (search) list = list.filter(r =>
    (r.room_name || "").toLowerCase().includes(search) ||
    (r.user_name || "").toLowerCase().includes(search) ||
    String(r.reservation_id).includes(search)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No reservations found</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td class="muted">#${r.reservation_id}</td>
      <td>${r.user_name || "—"}</td>
      <td>${r.room_name || "—"}</td>
      <td>${formatDate(r.start_time)}</td>
      <td>${formatTime(r.start_time)} → ${formatTime(r.end_time)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <div class="td-actions">
          ${r.status === "pending" ? `
            <button class="btn btn-xs btn-green" onclick="approveRes(${r.reservation_id})">Approve</button>
            <button class="btn btn-xs btn-red"   onclick="rejectRes(${r.reservation_id})">Reject</button>` : ""}
          ${r.status === "approved" ? `
            <button class="btn btn-xs btn-ghost" onclick="cancelRes(${r.reservation_id})">Cancel</button>` : ""}
          ${r.status !== "pending" && r.status !== "approved" ? `<span class="text-muted" style="font-size:0.75rem">—</span>` : ""}
        </div>
      </td>
    </tr>`).join("");
}

async function approveRes(id) {
  const { ok, data } = await API.approveReservation(id);
  ok ? showToast("✅ Reservation approved") : showToast("❌ " + data.error, "t-error");
  loadReservations();
}

async function rejectRes(id) {
  const { ok, data } = await API.rejectReservation(id);
  ok ? showToast("✅ Reservation rejected") : showToast("❌ " + data.error, "t-error");
  loadReservations();
}

async function cancelRes(id) {
  const { ok, data } = await API.cancelReservation(id);
  ok ? showToast("✅ Reservation cancelled") : showToast("❌ " + data.error, "t-error");
  loadReservations();
}

/* ════════════════════════════════════════════════════════════════
   USERS
════════════════════════════════════════════════════════════════ */
async function loadUsers() {
  const container = document.getElementById("userCards");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">Loading…</div>`;
  try {
    const { ok, data } = await API.getUsers();
    if (!ok) throw new Error();
    if (!data.length) { container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">No users found</div>`; return; }

    container.innerHTML = data.map(u => {
      const initials  = u.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const roleClass = `role-${u.role}`;
      return `
        <div class="user-card ${u.is_active ? "" : "user-inactive"}">
          <div class="user-info">
            <div class="user-avatar-sm">${initials}</div>
            <div>
              <div class="user-name">${u.full_name}</div>
              <div class="user-email">${u.email}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="user-role-tag ${roleClass}">${u.role}</span>
            <button class="btn btn-sm ${u.is_active ? "btn-ghost" : "btn-green"}"
              onclick="toggleUser(${u.user_id}, this)">
              ${u.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>`;
    }).join("");
  } catch {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">Failed to load users</div>`;
  }
}

async function toggleUser(id, btn) {
  btn.disabled = true;
  const { ok, data } = await API.toggleUser(id);
  if (ok) { showToast(data.message); loadUsers(); }
  else { showToast("❌ " + data.error, "t-error"); btn.disabled = false; }
}

/* ════════════════════════════════════════════════════════════════
   OVERRIDE REQUESTS
════════════════════════════════════════════════════════════════ */
async function loadOverrides() {
  const container = document.getElementById("overrideCards");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">Loading…</div>`;
  try {
    const { ok, data } = await API.getOverrides();
    if (!ok) throw new Error();
    const pending = data.filter(o => o.status === "pending");

    if (!pending.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">No pending overrides</div></div>`;
      return;
    }

    container.innerHTML = pending.map(o => `
      <div class="override-card" id="ov-${o.request_id}">
        <div>
          <div class="override-room">${o.room_name}</div>
          <div class="override-detail">
            📅 ${formatDate(o.start_time)} · 🕐 ${formatTime(o.start_time)} → ${formatTime(o.end_time)}
          </div>
          <div class="override-party">
            👨‍🏫 Lecturer: <strong>${o.lecturer_name}</strong> &nbsp;·&nbsp;
            👤 Student: <strong>${o.student_name}</strong>
          </div>
        </div>
        <div class="override-actions">
          <button class="btn btn-sm btn-green" onclick="acceptOverride(${o.request_id})">Accept</button>
          <button class="btn btn-sm btn-red"   onclick="rejectOverride(${o.request_id})">Reject</button>
        </div>
      </div>`).join("");
  } catch {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">Failed to load</div>`;
  }
}

async function acceptOverride(id) {
  const { ok, data } = await API.acceptOverride(id);
  ok ? showToast("✅ Override accepted") : showToast("❌ " + data.error, "t-error");
  loadOverrides();
}

async function rejectOverride(id) {
  const { ok, data } = await API.rejectOverride(id);
  ok ? showToast("✅ Override rejected") : showToast("❌ " + data.error, "t-error");
  loadOverrides();
}

/* ════════════════════════════════════════════════════════════════
   WATCHLIST
════════════════════════════════════════════════════════════════ */
async function loadWatchlist() {
  const tbody = document.getElementById("watchTbody");
  if (!tbody) return;
  try {
    const { ok, data } = await API.getWatchlist();
    if (!ok || !data.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No watchlist entries</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(w => `
      <tr>
        <td>${w.user_name}</td>
        <td>${w.room_name}</td>
        <td>${formatDate(w.start_time)}</td>
        <td>${formatTime(w.start_time)} → ${formatTime(w.end_time)}</td>
        <td>
          <button class="btn btn-xs btn-red" onclick="removeWatch(${w.watch_id})">Remove</button>
        </td>
      </tr>`).join("");
  } catch {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Failed to load</td></tr>`;
  }
}

async function removeWatch(id) {
  const { ok } = await API.removeWatch(id);
  ok ? (showToast("Removed"), loadWatchlist()) : showToast("❌ Failed", "t-error");
}

/* ════════════════════════════════════════════════════════════════
   WAITLIST QUEUE
════════════════════════════════════════════════════════════════ */
async function loadWaitlist() {
  const tbody = document.getElementById("waitTbody");
  if (!tbody) return;
  try {
    const { ok, data } = await API.getWaitlist();
    if (!ok || !data.length) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No waitlist entries</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(w => `
      <tr>
        <td><span class="badge badge-purple">#${w.queue_position}</span></td>
        <td>${w.user_name}</td>
        <td>${w.room_name}</td>
        <td>${formatDate(w.start_time)}</td>
        <td>${formatTime(w.start_time)} → ${formatTime(w.end_time)}</td>
        <td><span class="status-badge status-${w.status === "waiting" ? "pending" : "approved"}">${w.status}</span></td>
      </tr>`).join("");
  } catch {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Failed to load</td></tr>`;
  }
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  Auth.restoreFromUrl();
  Auth.requireAdmin();
  Auth.populateAdminProfile();

  // Sidebar nav
  document.querySelectorAll(".nav-item[data-section]").forEach(item => {
    item.addEventListener("click", () => showSection(item.dataset.section));
  });

  // Res filter tabs
  document.querySelectorAll("#resFilterTabs .filter-tab").forEach(tab => {
    tab.addEventListener("click", () => setResFilter(tab.dataset.filter));
  });

  // Res search
  document.getElementById("resSearch")?.addEventListener("input", renderResTable);

  // Load default section
  showSection("overview");
});