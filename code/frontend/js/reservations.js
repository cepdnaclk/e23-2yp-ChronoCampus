/* ============================================================
   ChronoCampus — reservations.js
   My Reservations page: load, filter, cancel, notifications.
   Requires: auth.js, api.js, notifications.js
   ============================================================ */

let allReservations = [];
let activeFilter    = "all";

/* ── Toast ────────────────────────────────────────────────────── */
function showToast(msg, type = "t-success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

/* ── Modal helpers ───────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.add("show"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("show"); }

/* ── Format helpers ───────────────────────────────────────────── */
function formatDateTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
       + " · "
       + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Status badge ─────────────────────────────────────────────── */
function statusBadge(status) {
  return `<span class="status-badge status-${status}">${status}</span>`;
}

/* ── Load reservations ────────────────────────────────────────── */
async function loadReservations() {
  const uid = Auth.getUserId();
  const container = document.getElementById("resCards");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted)">
    <div class="spinner" style="margin:0 auto 1rem"></div>Loading your reservations…</div>`;

  try {
    const { ok, data } = await API.getUserReservations(uid);
    if (!ok) throw new Error();
    allReservations = data;
    updateStats();
    renderFiltered();
    checkOverrideCancelled();
  } catch {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">Could not load reservations</div>
      <div class="empty-sub">Make sure Flask is running on port 5000</div>
    </div>`;
  }
}

/* ── Update stat cards ────────────────────────────────────────── */
function updateStats() {
  const counts = { total: allReservations.length, pending: 0, approved: 0, cancelled: 0 };
  allReservations.forEach(r => {
    if (r.status === "pending")   counts.pending++;
    if (r.status === "approved")  counts.approved++;
    if (r.status === "cancelled" || r.status === "rejected") counts.cancelled++;
  });
  document.getElementById("statTotal")?.setAttribute("data-val", counts.total);
  document.getElementById("statPending")?.setAttribute("data-val", counts.pending);
  document.getElementById("statApproved")?.setAttribute("data-val", counts.approved);
  document.getElementById("statCancelled")?.setAttribute("data-val", counts.cancelled);

  // Animate numbers
  ["statTotal","statPending","statApproved","statCancelled"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = el.getAttribute("data-val");
  });
}

/* ── Filter and render ────────────────────────────────────────── */
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.filter === filter);
  });
  renderFiltered();
}

function renderFiltered() {
  const search = document.getElementById("searchInput")?.value?.toLowerCase() || "";
  let list = allReservations;

  if (activeFilter !== "all") {
    list = list.filter(r => {
      if (activeFilter === "cancelled") return r.status === "cancelled" || r.status === "rejected";
      return r.status === activeFilter;
    });
  }

  if (search) {
    list = list.filter(r =>
      (r.room_name || "").toLowerCase().includes(search) ||
      String(r.reservation_id).includes(search)
    );
  }

  renderCards(list);
}

/* ── Check if any reservations were override-cancelled ────── */
function checkOverrideCancelled() {
  const banner = document.getElementById("overrideBanner");
  if (!banner) return;
  // Show banner if any cancelled reservation exists (they may be from override)
  // Notifications panel will have the exact reason
  const hasCancelled = allReservations.some(r => r.status === "cancelled");
  banner.style.display = hasCancelled ? "block" : "none";
}

function renderCards(list) {
  const container = document.getElementById("resCards");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No reservations found</div>
        <div class="empty-sub">Try a different filter or make a new booking.</div>
      </div>`;
    return;
  }

  container.innerHTML = list.map(r => {
    const canCancel = r.status === "pending" || r.status === "approved";
    return `
      <div class="res-card status-${r.status}">
        <div class="res-card-left">
          <div class="res-room">${r.room_name || "Room #" + r.room_id}</div>
          <div class="res-meta">
            <span>📅 ${formatDate(r.start_time)}</span>
            <span class="res-meta-sep">·</span>
            <span>🕐 ${formatTime(r.start_time)} → ${formatTime(r.end_time)}</span>
          </div>
          <div class="res-id">Reservation #${r.reservation_id}</div>
        </div>
        <div class="res-card-right">
          ${statusBadge(r.status)}
          ${canCancel ? `<button class="btn btn-sm btn-red" onclick="openCancelModal(${r.reservation_id})">Cancel</button>` : ""}
        </div>
      </div>`;
  }).join("");
}

/* ── Cancel flow ──────────────────────────────────────────────── */
let _cancelTarget = null;

function openCancelModal(id) {
  _cancelTarget = id;
  openModal("cancelModal");
}

async function confirmCancel() {
  if (!_cancelTarget) return;
  const btn = document.getElementById("cancelConfirmBtn");
  btn.disabled = true; btn.textContent = "Cancelling…";

  try {
    const { ok, data } = await API.cancelReservation(_cancelTarget);
    closeModal("cancelModal");
    if (ok) {
      showToast("✅ Reservation cancelled", "t-success");
      await loadReservations();
    } else {
      showToast("❌ " + (data.error || "Failed to cancel"), "t-error");
    }
  } catch {
    closeModal("cancelModal");
    showToast("❌ Cannot reach server", "t-error");
  }

  btn.disabled = false; btn.textContent = "Yes, Cancel It";
  _cancelTarget = null;
}

/* ── Event bindings ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  Auth.restoreFromUrl();
  Auth.redirectIfAdmin();
  Auth.populateNav();

  document.getElementById("searchInput")
    ?.addEventListener("input", renderFiltered);

  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => setFilter(tab.dataset.filter));
  });

  document.getElementById("notifBell")
    ?.addEventListener("click", Notifications.togglePanel);

  loadReservations();
  Notifications.load();
  Notifications.startPolling();
});