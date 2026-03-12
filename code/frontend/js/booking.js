/* ============================================================
   ChronoCampus — booking.js
   Requires: auth.js, api.js, notifications.js, datepicker.js
   ============================================================ */

const MIN_ADVANCE_HOURS  = 3;
const MAX_DURATION_HOURS = 6;

let roomsData         = {};
let pendingSuggestion = null;
const ROOM_EMOJIS = { 1: "🏛️", 2: "💻", 3: "🔬" };

function showToast(msg, type = "t-success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

function openModal(id)  { document.getElementById(id)?.classList.add("show"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("show"); }

function showAlert(msg, type, suggestion, suggestionMsg) {
  const box   = document.getElementById("alertBox");
  const msgEl = document.getElementById("alertMsg");
  if (!box || !msgEl) return;
  msgEl.textContent = msg;
  box.className = `alert alert-${type} show`;
  const banner = document.getElementById("suggestionBanner");
  if (suggestion) {
    pendingSuggestion = suggestion;
    document.getElementById("suggestionName").textContent   = suggestion.room_name;
    document.getElementById("suggestionDetail").textContent =
      suggestionMsg || `Capacity: ${suggestion.capacity} · ${suggestion.location}`;
    banner?.classList.add("show");
    showQueueBtn();
  } else {
    banner?.classList.remove("show");
  }
}

function clearAlert() {
  document.getElementById("alertBox")?.classList.remove("show");
  document.getElementById("suggestionBanner")?.classList.remove("show");
  pendingSuggestion = null;
  hideQueueBtn();
}

/* Duration pill - called by DatePicker on change */
function updateDurationDisplay() {
  const startStr = DatePicker.getStart();
  const endStr   = DatePicker.getEnd();
  const pill     = document.getElementById("durationPill");
  const text     = document.getElementById("durationText");
  if (!pill || !text) return;
  if (!startStr || !endStr) { pill.classList.remove("show"); return; }
  const diff = (new Date(endStr) - new Date(startStr)) / 60000;
  if (diff <= 0) { pill.classList.remove("show"); return; }
  const h = Math.floor(diff / 60), m = diff % 60;
  text.textContent = h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m} minutes`;
  pill.classList.add("show");
  pill.classList.toggle("over-limit", diff / 60 > MAX_DURATION_HOURS);
}

async function loadRooms() {
  const sel  = document.getElementById("roomSelect");
  const hint = document.getElementById("roomHint");
  if (!sel) return;
  try {
    const { ok, data } = await API.getRooms();
    if (!ok) throw new Error();
    sel.innerHTML = '<option value="" disabled selected>Select a room</option>';
    data.forEach(r => {
      roomsData[r.room_id] = r;
      const opt = document.createElement("option");
      opt.value = r.room_id;
      opt.textContent = `${r.room_name} — ${r.capacity} seats`;
      sel.appendChild(opt);
    });
    sel.disabled = false;
    if (hint) hint.textContent = `${data.length} room(s) available`;
  } catch {
    if (hint) hint.textContent = "Could not load rooms. Is Flask running?";
  }
}

function updateRoomPreview(roomId) {
  const r = roomsData[roomId];
  if (!r) return;
  document.getElementById("roomEmoji").textContent  = ROOM_EMOJIS[r.room_id] || "🏫";
  document.getElementById("roomStatus").textContent  = "Available";
  document.getElementById("roomStatus").className    = "room-status-dot dot-available";
  document.getElementById("roomDetails").innerHTML   = `
    <div class="room-details-grid">
      <div><div class="room-detail-label">Name</div><div class="room-detail-value">${r.room_name}</div></div>
      <div><div class="room-detail-label">Capacity</div><div class="room-detail-value">${r.capacity} seats</div></div>
      <div><div class="room-detail-label">Location</div><div class="room-detail-value">${r.location || "—"}</div></div>
    </div>`;
  clearAlert();
}

function resetRoomPreview() {
  document.getElementById("roomDetails").innerHTML  = '<p class="room-placeholder">Select a room to see details</p>';
  document.getElementById("roomStatus").textContent = "—";
  document.getElementById("roomStatus").className   = "room-status-dot dot-unknown";
  document.getElementById("durationPill")?.classList.remove("show");
}

function validateForm() {
  const roomId = document.getElementById("roomSelect")?.value;
  if (!roomId) { showAlert("Please select a room.", "error"); return false; }
  const { valid } = DatePicker.validate();
  if (!valid) return false;
  clearAlert();
  return true;
}

async function submitBooking(e) {
  e.preventDefault();
  clearAlert();
  DatePicker.clearErrors();
  if (!validateForm()) return;

  const btn = document.getElementById("submitBtn");
  btn.disabled = true; btn.textContent = "Submitting…";

  const payload = {
    user_id:    Auth.getUserId(),
    room_id:    document.getElementById("roomSelect").value,
    start_time: DatePicker.getStart(),
    end_time:   DatePicker.getEnd(),
  };

  try {
    const { status, data } = await API.createReservation(payload);
    if (status === 201) {
      document.getElementById("successId").textContent = `Reservation #${data.reservation.reservation_id}`;
      openModal("successModal");
      document.getElementById("bookingForm").reset();
      DatePicker.clearErrors();
      resetRoomPreview();
    } else if (status === 200 && data.message?.includes("Override")) {
      showAlert(data.message, "warning");
    } else {
      showAlert(data.error || "Something went wrong.", "error", data.suggestion, data.suggestion_message);
      // Auto-show queue button when room is booked by someone else
      if (data.show_queue) {
        showQueueBtn(data.queue_message);
      }
    }
  } catch {
    showAlert("Cannot reach server. Make sure Flask is running on port 5000.", "error");
  }
  btn.disabled = false; btn.textContent = "📋 Book Room";
}

async function bookSuggestion() {
  if (!pendingSuggestion) return;
  const { status, data } = await API.createReservation({
    user_id: Auth.getUserId(), room_id: pendingSuggestion.room_id,
    start_time: DatePicker.getStart(), end_time: DatePicker.getEnd(),
  });
  if (status === 201) {
    document.getElementById("successId").textContent = `Reservation #${data.reservation.reservation_id}`;
    openModal("successModal");
    document.getElementById("bookingForm").reset();
    resetRoomPreview(); clearAlert();
  } else {
    showToast("Could not book suggestion: " + (data.error || ""), "t-error");
  }
}

function openWatchModal() {
  if (!document.getElementById("roomSelect")?.value || !DatePicker.getStart() || !DatePicker.getEnd()) {
    showToast("Select a room and complete the time slot first", "t-error"); return;
  }
  const room = roomsData[document.getElementById("roomSelect").value];
  document.getElementById("watchModalMsg").textContent =
    `Get notified when ${room?.room_name || "this room"} becomes available for the selected slot.`;
  openModal("watchModal");
}

async function confirmWatch() {
  const roomId = document.getElementById("roomSelect").value;
  const btn    = document.getElementById("watchConfirmBtn");
  btn.disabled = true; btn.textContent = "Adding…";
  try {
    const { ok, data } = await API.addWatch({
      user_id: Auth.getUserId(), room_id: roomId,
      start_time: DatePicker.getStart(), end_time: DatePicker.getEnd()
    });
    closeModal("watchModal");
    if (ok) {
      document.getElementById("watchSuccessMsg").textContent =
        `You're now watching ${roomsData[roomId]?.room_name || "this room"}. We'll notify you when it's free!`;
      openModal("watchSuccessModal");
      loadWatchlistPanel();
    } else {
      showToast("Could not add: " + (data.error || ""), "t-error");
    }
  } catch { closeModal("watchModal"); showToast("Cannot reach server", "t-error"); }
  btn.disabled = false; btn.textContent = "Yes, Watch It";
}

function showQueueBtn(queueMsg) {
  const group = document.getElementById("actionGroup");
  if (!group) return;

  // Update existing btn message if already shown
  const existing = document.getElementById("queueBtn");
  if (existing) {
    if (queueMsg) existing.title = queueMsg;
    return;
  }

  group.classList.add("three-col");
  const btn = document.createElement("button");
  btn.type        = "button";
  btn.id          = "queueBtn";
  btn.className   = "btn btn-lg btn-outline-purple";
  btn.textContent = "🎯 Join Queue";
  btn.title       = queueMsg || "";
  btn.onclick     = openQueueModal;
  group.appendChild(btn);

  // Also show queue info banner below alert
  const queueInfoEl = document.getElementById("queueInfoMsg");
  if (queueInfoEl && queueMsg) {
    queueInfoEl.textContent = "📋 " + queueMsg;
    queueInfoEl.style.display = "block";
  }
}

function hideQueueBtn() {
  const btn = document.getElementById("queueBtn");
  if (btn) { btn.remove(); document.getElementById("actionGroup")?.classList.remove("three-col"); }
  const queueInfoEl = document.getElementById("queueInfoMsg");
  if (queueInfoEl) queueInfoEl.style.display = "none";
}

function openQueueModal() {
  if (!document.getElementById("roomSelect")?.value || !DatePicker.getStart()) {
    showToast("Select room and time first", "t-error"); return;
  }
  const room = roomsData[document.getElementById("roomSelect").value];
  document.getElementById("queueModalMsg").textContent =
    `Join the waitlist for ${room?.room_name || "this room"}. You'll get a priority alert when it's your turn.`;
  openModal("queueModal");
}

async function confirmQueue() {
  const roomId = document.getElementById("roomSelect").value;
  const btn    = document.getElementById("queueConfirmBtn");
  btn.disabled = true; btn.textContent = "Joining…";
  try {
    const { status, data } = await API.joinWaitlist({
      user_id: Auth.getUserId(), room_id: roomId,
      start_time: DatePicker.getStart(), end_time: DatePicker.getEnd()
    });
    closeModal("queueModal");
    if (status === 201) {
      document.getElementById("queueSuccessMsg").textContent =
        `You are #${data.queue_position} in line. We'll notify you the moment the room is available!`;
      document.getElementById("queuePosition").textContent = `📋 Position #${data.queue_position}`;
      openModal("queueSuccessModal");
      loadQueuePanel();
    } else {
      showToast("Could not join: " + (data.error || ""), "t-error");
    }
  } catch { closeModal("queueModal"); showToast("Cannot reach server", "t-error"); }
  btn.disabled = false; btn.textContent = "Join Queue";
}

async function loadWatchlistPanel() {
  const c = document.getElementById("watchlistPanel");
  if (!c) return;
  try {
    const { ok, data } = await API.getUserWatchlist(Auth.getUserId());
    if (!ok || !data.length) { c.innerHTML = '<div class="panel-empty">No rooms being watched</div>'; return; }
    c.innerHTML = data.map(w => `
      <div class="panel-item panel-item-gold">
        <div>
          <div class="panel-room text-gold">${w.room_name}</div>
          <div class="panel-sub">${w.reservation_date} · ${fmt(w.start_time)} → ${fmt(w.end_time)}</div>
        </div>
        <button class="btn btn-xs btn-red" onclick="removeWatch(${w.watch_id})">✕</button>
      </div>`).join("");
  } catch { c.innerHTML = '<div class="panel-empty">Could not load</div>'; }
}

async function removeWatch(id) {
  const { ok } = await API.removeWatch(id);
  ok ? (showToast("Removed from watchlist", "t-info"), loadWatchlistPanel()) : showToast("Failed", "t-error");
}

async function loadQueuePanel() {
  const c = document.getElementById("queuePanel");
  if (!c) return;
  try {
    const { ok, data } = await API.getUserWaitlist(Auth.getUserId());
    const active = ok ? data.filter(w => w.status === "waiting") : [];
    if (!active.length) { c.innerHTML = '<div class="panel-empty">Not in any queue</div>'; return; }
    c.innerHTML = active.map(w => `
      <div class="panel-item panel-item-purple">
        <div>
          <div class="panel-room text-purple">${w.room_name}</div>
          <div class="panel-pos">Position #${w.queue_position}</div>
          <div class="panel-sub">${w.reservation_date} · ${fmt(w.start_time)} → ${fmt(w.end_time)}</div>
        </div>
        <button class="btn btn-xs btn-red" onclick="leaveQueue(${w.waitlist_id})">✕</button>
      </div>`).join("");
  } catch { c.innerHTML = '<div class="panel-empty">Could not load</div>'; }
}

async function leaveQueue(id) {
  const { ok } = await API.leaveWaitlist(id);
  ok ? (showToast("Left the queue", "t-purple"), loadQueuePanel()) : showToast("Failed", "t-error");
}

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

document.addEventListener("DOMContentLoaded", () => {
  Auth.restoreFromUrl();
  Auth.redirectIfAdmin();
  Auth.populateNav();
  DatePicker.init();
  document.getElementById("roomSelect")?.addEventListener("change", e => updateRoomPreview(e.target.value));
  document.getElementById("bookingForm")?.addEventListener("submit", submitBooking);
  document.getElementById("notifBell")?.addEventListener("click", Notifications.togglePanel);
  loadRooms();
  loadWatchlistPanel();
  loadQueuePanel();
  Notifications.load();
  Notifications.startPolling();
});