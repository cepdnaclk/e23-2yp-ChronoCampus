/* ============================================================
   ChronoCampus — api.js
   Centralized API layer. All fetch() calls live here.
   Usage: const rooms = await API.getRooms();
   ============================================================ */

const API = (() => {
  const BASE = "http://127.0.0.1:5000";

  async function request(method, path, body = null) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }

  const get    = (path)        => request("GET",    path);
  const post   = (path, body)  => request("POST",   path, body);
  const del    = (path)        => request("DELETE", path);

  /* ── Rooms ────────────────────────────────────────────────── */
  const getRooms = () => get("/rooms");

  /* ── Reservations ─────────────────────────────────────────── */
  const createReservation    = (body)  => post("/reservations", body);
  const getAllReservations    = ()      => get("/reservations");
  const getUserReservations  = (uid)   => get(`/reservations/user/${uid}`);
  const approveReservation   = (id)    => post(`/reservations/${id}/approve`);
  const rejectReservation    = (id)    => post(`/reservations/${id}/reject`);
  const cancelReservation    = (id)    => post(`/reservations/${id}/cancel`);

  /* ── Users ────────────────────────────────────────────────── */
  const getUsers      = ()    => get("/users");
  const getUser       = (uid) => get(`/users/${uid}`);
  const toggleUser    = (uid) => post(`/users/${uid}/toggle`);

  /* ── Override requests ────────────────────────────────────── */
  const getOverrides    = ()   => get("/override-requests");
  const acceptOverride  = (id) => post(`/override-requests/${id}/accept`);
  const rejectOverride  = (id) => post(`/override-requests/${id}/reject`);

  /* ── Notifications ────────────────────────────────────────── */
  const getUserNotifications = (uid) => get(`/notifications/user/${uid}`);
  const markNotifRead        = (id)  => post(`/notifications/${id}/read`);
  const sendReminders        = ()    => post("/notifications/send-reminders");

  /* ── Watchlist ────────────────────────────────────────────── */
  const getWatchlist      = ()     => get("/watchlist");
  const getUserWatchlist  = (uid)  => get(`/watchlist/user/${uid}`);
  const addWatch          = (body) => post("/watchlist", body);
  const removeWatch       = (id)   => del(`/watchlist/${id}`);

  /* ── Waitlist queue ───────────────────────────────────────── */
  const getWaitlist      = ()     => get("/waitlist");
  const getUserWaitlist  = (uid)  => get(`/waitlist/user/${uid}`);
  const joinWaitlist     = (body) => post("/waitlist/join", body);
  const leaveWaitlist    = (id)   => del(`/waitlist/${id}`);

  return {
    getRooms,
    createReservation, getAllReservations, getUserReservations,
    approveReservation, rejectReservation, cancelReservation,
    getUsers, getUser, toggleUser,
    getOverrides, acceptOverride, rejectOverride,
    getUserNotifications, markNotifRead, sendReminders,
    getWatchlist, getUserWatchlist, addWatch, removeWatch,
    getWaitlist, getUserWaitlist, joinWaitlist, leaveWaitlist,
  };
})();