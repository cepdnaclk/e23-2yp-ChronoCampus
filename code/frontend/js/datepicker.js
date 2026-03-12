/* ============================================================
   ChronoCampus — datepicker.js
   Custom date + time picker component.
   Creates two pickers: startPicker and endPicker.
   Exposes: DatePicker.getStart(), DatePicker.getEnd()
            DatePicker.validate() → { valid, errors }
   ============================================================ */

const DatePicker = (() => {

  const DAYS    = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const MONTHS  = ["January","February","March","April","May","June",
                   "July","August","September","October","November","December"];

  const MIN_ADVANCE_HOURS  = 3;   // must book at least 3h from now
  const MAX_DURATION_HOURS = 6;   // max booking duration
  const MAX_ADVANCE_DAYS   = 7;   // can only book up to 7 days ahead

  /* ── State for each picker ───────────────────────────────── */
  const pickers = {};

  /* ── Build hour options (00–23) ──────────────────────────── */
  function buildHours() {
    let html = '<option value="">HH</option>';
    for (let h = 0; h < 24; h++) {
      const v = String(h).padStart(2, "0");
      html += `<option value="${v}">${v}</option>`;
    }
    return html;
  }

  /* ── Build minute options (every 5 min: 00, 05, 10...55) ── */
  function buildMinutes() {
    let html = '<option value="">MM</option>';
    for (let m = 0; m < 60; m += 1) {
      const v = String(m).padStart(2, "0");
      html += `<option value="${v}">${v}</option>`;
    }
    return html;
  }

  /* ── Render calendar for a given month/year ─────────────── */
  function renderCalendar(id) {
    const p     = pickers[id];
    const grid  = p.el.querySelector(".cal-grid");
    const label = p.el.querySelector(".cal-month-label");
    const prevBtn = p.el.querySelector(".cal-prev");
    const now   = new Date();

    label.textContent = `${MONTHS[p.viewMonth]} ${p.viewYear}`;

    // Disable prev if already at current month
    prevBtn.disabled = (p.viewYear < now.getFullYear()) ||
      (p.viewYear === now.getFullYear() && p.viewMonth <= now.getMonth());

    // First day of month
    const first = new Date(p.viewYear, p.viewMonth, 1).getDay();
    // Days in month
    const daysInMonth = new Date(p.viewYear, p.viewMonth + 1, 0).getDate();
    // Days in prev month
    const daysInPrev  = new Date(p.viewYear, p.viewMonth, 0).getDate();

    let cells = "";

    // Leading cells from previous month
    for (let i = first - 1; i >= 0; i--) {
      cells += `<div class="cal-cell other-month">${daysInPrev - i}</div>`;
    }

    // Current month cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(p.viewYear, p.viewMonth, d);
      const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const maxDate  = new Date(today);
      maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);

      const isToday    = sameDay(cellDate, now);
      const isPast     = cellDate < today;
      const isTooFar   = cellDate > maxDate;
      const isDisabled = isPast || isTooFar;
      const isSelected = p.selectedDate && sameDay(cellDate, p.selectedDate);

      let cls = "cal-cell";
      if (isToday)    cls += " today";
      if (isDisabled) cls += " disabled";
      if (isTooFar)   cls += " too-far";
      if (isSelected) cls += " selected";

      const clickable = !isDisabled ? `onclick="DatePicker._selectDate('${id}', ${p.viewYear}, ${p.viewMonth}, ${d})"` : "";
      cells += `<div class="${cls}" ${clickable}>${d}</div>`;
    }

    // Trailing cells
    const total = first + daysInMonth;
    const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= trailing; i++) {
      cells += `<div class="cal-cell other-month">${i}</div>`;
    }

    grid.innerHTML = cells;
  }

  /* ── Select a date ───────────────────────────────────────── */
  function _selectDate(id, year, month, day) {
    const p = pickers[id];
    p.selectedDate = new Date(year, month, day);
    renderCalendar(id);
    updateTrigger(id);
  }

  /* ── Update trigger button label ─────────────────────────── */
  function updateTrigger(id) {
    const p    = pickers[id];
    const btn  = document.getElementById(`${id}Trigger`);
    const text = btn.querySelector(".dt-trigger-text");

    const date = p.selectedDate;
    const hour = p.el.querySelector(".hour-sel").value;
    const min  = p.el.querySelector(".min-sel").value;

    if (date && hour && min) {
      const dateStr = date.toLocaleDateString("en-GB", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });
      text.textContent = `${dateStr}  ${hour}:${min}`;
      btn.classList.remove("empty");
      btn.classList.add("has-value");
    } else if (date) {
      text.textContent = date.toLocaleDateString("en-GB", { weekday:"short", day:"2-digit", month:"short", year:"numeric" }) + "  —:—";
      btn.classList.remove("empty");
      btn.classList.add("has-value");
    } else {
      text.textContent = p.placeholder;
      btn.classList.add("empty");
      btn.classList.remove("has-value");
    }
  }

  /* ── Toggle popup open/close ─────────────────────────────── */
  function toggle(id) {
    const p   = pickers[id];
    const btn = document.getElementById(`${id}Trigger`);
    const popup = p.el.querySelector(".dt-popup");

    // Close all others first
    Object.keys(pickers).forEach(k => {
      if (k !== id) close(k);
    });

    p.open = !p.open;
    popup.style.display = p.open ? "block" : "none";
    btn.classList.toggle("open", p.open);
    if (p.open) renderCalendar(id);
  }

  function close(id) {
    const p = pickers[id];
    if (!p) return;
    p.open = false;
    p.el.querySelector(".dt-popup").style.display = "none";
    document.getElementById(`${id}Trigger`)?.classList.remove("open");
  }

  /* ── Navigate month ──────────────────────────────────────── */
  function prevMonth(id) {
    const p = pickers[id];
    p.viewMonth--;
    if (p.viewMonth < 0) { p.viewMonth = 11; p.viewYear--; }
    renderCalendar(id);
  }

  function nextMonth(id) {
    const p = pickers[id];
    p.viewMonth++;
    if (p.viewMonth > 11) { p.viewMonth = 0; p.viewYear++; }
    renderCalendar(id);
  }

  /* ── Confirm selection ───────────────────────────────────── */
  function confirm(id) {
    close(id);
    updateTrigger(id);
    clearError(id);
    // Trigger duration update
    if (typeof updateDurationDisplay === "function") updateDurationDisplay();
  }

  /* ── Get ISO datetime string ─────────────────────────────── */
  function getValue(id) {
    const p    = pickers[id];
    const date = p.selectedDate;
    const hour = p.el.querySelector(".hour-sel").value;
    const min  = p.el.querySelector(".min-sel").value;
    if (!date || !hour || !min) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}T${hour}:${min}`;
  }

  /* ── Validate both pickers ───────────────────────────────── */
  function validate() {
    const startStr = getValue("start");
    const endStr   = getValue("end");
    const errors   = {};
    const now      = new Date();
    const minStart = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);

    if (!startStr) {
      errors.start = "Please select a start date and time.";
    } else {
      const startDt  = new Date(startStr);
      const maxStart = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
      if (startDt < minStart) {
        errors.start = `Start time must be at least ${MIN_ADVANCE_HOURS} hours from now (after ${fmt(minStart)}).`;
      } else if (startDt > maxStart) {
        errors.start = `You can only book up to ${MAX_ADVANCE_DAYS} days in advance.`;
      }
    }

    if (!endStr) {
      errors.end = "Please select an end date and time.";
    } else if (startStr) {
      const startDt = new Date(startStr);
      const endDt   = new Date(endStr);
      if (endDt <= startDt) {
        errors.end = "End time must be after start time.";
      } else {
        const durationHours = (endDt - startDt) / 3600000;
        if (durationHours > MAX_DURATION_HOURS) {
          errors.end = `Maximum booking duration is ${MAX_DURATION_HOURS} hours. Your selection is ${durationHours.toFixed(1)}h.`;
        }
      }
    }

    // Show/hide field errors
    showError("start", errors.start || null);
    showError("end",   errors.end   || null);

    return { valid: Object.keys(errors).length === 0, errors };
  }

  /* ── Error display per picker ────────────────────────────── */
  function showError(id, msg) {
    const errEl = document.getElementById(`${id}PickerError`);
    const btn   = document.getElementById(`${id}Trigger`);
    if (!errEl) return;
    if (msg) {
      errEl.textContent = "⚠ " + msg;
      errEl.classList.add("show");
      btn?.classList.add("error");
    } else {
      errEl.classList.remove("show");
      btn?.classList.remove("error");
    }
  }

  function clearError(id) { showError(id, null); }

  /* ── Format helper ───────────────────────────────────────── */
  function fmt(dt) {
    return dt.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })
           + " on "
           + dt.toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  /* ── Build HTML for one picker ───────────────────────────── */
  function buildHTML(id, placeholder) {
    const now = new Date();
    return `
      <div class="dt-field-wrap" id="${id}PickerWrap">
        <button type="button" class="dt-trigger empty" id="${id}Trigger" onclick="DatePicker._toggle('${id}')">
          <span class="dt-trigger-icon">${id === "start" ? "🕐" : "🕔"}</span>
          <span class="dt-trigger-text">${placeholder}</span>
          <span class="dt-trigger-caret">▾</span>
        </button>
        <div class="dt-popup" style="display:none">
          <div class="dt-popup-inner">
            <!-- Calendar header -->
            <div class="cal-header">
              <button type="button" class="cal-nav cal-prev" onclick="DatePicker._prevMonth('${id}')">‹</button>
              <span class="cal-month-label"></span>
              <button type="button" class="cal-nav cal-next" onclick="DatePicker._nextMonth('${id}')">›</button>
            </div>
            <!-- Day names -->
            <div class="cal-days-header">
              ${DAYS.map(d => `<div class="cal-day-name">${d}</div>`).join("")}
            </div>
            <!-- Grid -->
            <div class="cal-grid"></div>
            <div class="dt-divider"></div>
            <!-- Time selectors -->
            <div class="time-picker-row">
              <span class="time-picker-label">Time</span>
              <select class="time-select hour-sel" onchange="DatePicker._onTimeChange('${id}')">
                ${buildHours()}
              </select>
              <span class="time-colon">:</span>
              <select class="time-select min-sel" onchange="DatePicker._onTimeChange('${id}')">
                ${buildMinutes()}
              </select>
            </div>
            <button type="button" class="dt-confirm-btn" onclick="DatePicker._confirm('${id}')">
              Confirm ✓
            </button>
          </div>
        </div>
        <div class="field-error" id="${id}PickerError"></div>
      </div>`;
  }

  /* ── Time change handler ─────────────────────────────────── */
  function _onTimeChange(id) {
    updateTrigger(id);
    if (typeof updateDurationDisplay === "function") updateDurationDisplay();
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    const now = new Date();

    ["start", "end"].forEach((id, idx) => {
      const placeholder = id === "start" ? "Select start date & time" : "Select end date & time";
      const container   = document.getElementById(`${id}PickerContainer`);
      if (!container) return;

      container.innerHTML = buildHTML(id, placeholder);

      pickers[id] = {
        open:         false,
        viewMonth:    now.getMonth(),
        viewYear:     now.getFullYear(),
        selectedDate: null,
        placeholder,
        el:           container,
      };
    });

    // Close on outside click
    document.addEventListener("click", e => {
      Object.keys(pickers).forEach(id => {
        const wrap = document.getElementById(`${id}PickerWrap`);
        if (wrap && !wrap.contains(e.target)) close(id);
      });
    });
  }

  /* ── Public API ──────────────────────────────────────────── */
  return {
    init,
    getStart:    () => getValue("start"),
    getEnd:      () => getValue("end"),
    validate,
    clearErrors: () => { clearError("start"); clearError("end"); },

    // Called from HTML onclick (need to be public)
    _toggle:     toggle,
    _selectDate: _selectDate,
    _prevMonth:  prevMonth,
    _nextMonth:  nextMonth,
    _confirm:    confirm,
    _onTimeChange: _onTimeChange,
  };
})();