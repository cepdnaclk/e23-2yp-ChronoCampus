/* ============================================================
   ChronoCampus — notifications.js
   Bell button + dropdown notification panel.
   Shared across booking.html and my_reservations.html.
   Requires: auth.js, api.js
   ============================================================ */

const Notifications = (() => {
  let _panelOpen = false;

  /* ── Format relative time ─────────────────────────────────── */
  function timeAgo(dateStr) {
    if (!dateStr) return "";
    // PostgreSQL may return "2025-03-08T10:30:00" without timezone.
    // Appending "Z" treats it as UTC, which keeps diff consistent.
    const normalized = dateStr.endsWith("Z") || dateStr.includes("+")
      ? dateStr
      : dateStr.replace(" ", "T") + "Z";
    const diff = (Date.now() - new Date(normalized)) / 1000;
    if (isNaN(diff) || diff < 0) return "just now";
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
    // Older than a week — show actual date
    return new Date(normalized).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }

  /* ── Render a single notification item ───────────────────── */
  function renderItem(n) {
    return `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.notification_id}" onclick="Notifications.markRead(${n.notification_id}, this)">
        ${!n.is_read ? '<div class="notif-dot-unread"></div>' : '<div style="width:7px;flex-shrink:0"></div>'}
        <div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${timeAgo(n.created_at)}</div>
        </div>
      </div>`;
  }

  /* ── Load and render notifications ───────────────────────── */
  async function load() {
    const uid = Auth.getUserId();
    if (!uid) return;

    const list = document.getElementById("notifList");
    const dot  = document.getElementById("notifDot");
    if (!list) return;

    try {
      const { ok, data } = await API.getUserNotifications(uid);
      if (!ok) return;

      const unread = data.filter(n => !n.is_read);

      // Update bell dot
      if (dot) dot.classList.toggle("show", unread.length > 0);

      if (!data.length) {
        list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
        return;
      }

      list.innerHTML = data.map(renderItem).join("");
    } catch {
      list.innerHTML = '<div class="notif-empty">Could not load notifications</div>';
    }
  }

  /* ── Mark single as read ─────────────────────────────────── */
  async function markRead(id, el) {
    const dot = el?.querySelector(".notif-dot-unread");
    if (dot) dot.remove();
    el?.classList.remove("unread");
    await API.markNotifRead(id);
    await load(); // refresh dot count
  }

  /* ── Mark all as read ────────────────────────────────────── */
  async function markAllRead() {
    const uid = Auth.getUserId();
    if (!uid) return;
    const { data } = await API.getUserNotifications(uid);
    const unread = data.filter(n => !n.is_read);
    await Promise.all(unread.map(n => API.markNotifRead(n.notification_id)));
    await load();
  }

  /* ── Toggle panel ─────────────────────────────────────────── */
  function togglePanel() {
    const panel = document.getElementById("notifPanel");
    if (!panel) return;
    _panelOpen = !_panelOpen;
    panel.classList.toggle("show", _panelOpen);
    if (_panelOpen) load();
  }

  /* ── Close panel on outside click ───────────────────────── */
  document.addEventListener("click", (e) => {
    if (!_panelOpen) return;
    const panel = document.getElementById("notifPanel");
    const bell  = document.getElementById("notifBell");
    if (panel && !panel.contains(e.target) && bell && !bell.contains(e.target)) {
      _panelOpen = false;
      panel.classList.remove("show");
    }
  });

  /* ── Auto-refresh every 60s ──────────────────────────────── */
  function startPolling() { setInterval(load, 60000); }

  return { load, markRead, markAllRead, togglePanel, startPolling };
})();