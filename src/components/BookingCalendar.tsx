import { useState } from "react";

interface BookingInquiry {
  id: number;
  name: string;
  contact: string;
  message: string | null;
  design_id: string | null;
  status: string | null;
  created_at: number;
  appointment_date: number | null;
}

interface BookingCalendarProps {
  bookings: BookingInquiry[];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function unixToDateKey(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingCalendar({ bookings: initialBookings }: BookingCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [actionPending, setActionPending] = useState<Set<number>>(new Set());
  const [appointmentInputs, setAppointmentInputs] = useState<Record<number, string>>({});

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Build a map: dateKey -> bookings on that day
  const dayMap: Record<string, BookingInquiry[]> = {};
  for (const b of bookings) {
    // Plot on created_at date
    const k = unixToDateKey(b.created_at);
    if (!dayMap[k]) dayMap[k] = [];
    dayMap[k].push(b);
    // Also mark appointment_date if set
    if (b.appointment_date) {
      const ak = unixToDateKey(b.appointment_date);
      if (!dayMap[ak]) dayMap[ak] = [];
      // Only add if not already there (don't double-count)
      if (!dayMap[ak].find((x) => x.id === b.id)) dayMap[ak].push(b);
    }
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  async function handleAccept(bookingId: number) {
    const dateVal = appointmentInputs[bookingId];
    if (!dateVal) {
      alert("Please select an appointment date first.");
      return;
    }
    const appointmentDate = Math.floor(new Date(dateVal).getTime() / 1000);
    setActionPending(prev => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentDate }),
        credentials: "include",
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: "accepted", appointment_date: appointmentDate } : b
        ));
      } else {
        const err = await res.json() as { error: string };
        alert("Failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  }

  async function handleDecline(bookingId: number) {
    if (!confirm("Decline this booking inquiry?")) return;
    setActionPending(prev => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, status: "declined" } : b
        ));
      } else {
        const err = await res.json() as { error: string };
        alert("Failed: " + (err.error ?? "Unknown error"));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionPending(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  }

  const selectedBookings = selectedDay ? (dayMap[selectedDay] ?? []) : [];

  // Build calendar grid
  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          style={{ background: "none", border: "1px solid var(--line)", padding: "6px 12px", cursor: "pointer", color: "var(--fg-dim)", fontSize: 13 }}
        >
          ←
        </button>
        <div className="display" style={{ fontSize: 18 }}>{MONTH_NAMES[month]} {year}</div>
        <button
          onClick={nextMonth}
          style={{ background: "none", border: "1px solid var(--line)", padding: "6px 12px", cursor: "pointer", color: "var(--fg-dim)", fontSize: 13 }}
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 1 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", color: "var(--fg-faint)", padding: "6px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", marginBottom: 24 }}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e${i}`} style={{ background: "var(--ink-850)", minHeight: 52 }} />;
          }
          const k = dayKey(year, month, day);
          const dayBookings = dayMap[k] ?? [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSelected = selectedDay === k;

          const hasPending = dayBookings.some(b => (b.status ?? "pending") === "pending");
          const hasAccepted = dayBookings.some(b => b.status === "accepted");
          const hasDeclined = dayBookings.some(b => b.status === "declined");

          return (
            <div
              key={k}
              onClick={() => setSelectedDay(isSelected ? null : k)}
              style={{
                background: isSelected ? "var(--ink-700)" : "var(--ink-800)",
                minHeight: 52,
                padding: "6px 8px",
                cursor: dayBookings.length > 0 ? "pointer" : "default",
                borderBottom: isSelected ? "2px solid var(--gold)" : "none",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: isToday ? "var(--gold)" : "var(--fg-dim)", fontWeight: isToday ? 700 : 400 }}>
                {day}
              </div>
              {/* Dot indicators */}
              {dayBookings.length > 0 && (
                <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                  {hasPending && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} title="Pending inquiry" />}
                  {hasAccepted && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} title="Accepted" />}
                  {hasDeclined && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} title="Declined" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedDay && (
        <div style={{ border: "1px solid var(--line)", padding: 20, background: "var(--ink-850)", marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--fg-faint)", marginBottom: 16 }}>
            {selectedDay}
          </div>
          {selectedBookings.length === 0 ? (
            <p className="dim" style={{ fontSize: 13 }}>No bookings on this date.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {selectedBookings.map((b) => {
                const status = b.status ?? "pending";
                return (
                  <div key={b.id} style={{ borderLeft: "2px solid var(--line)", paddingLeft: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{b.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>{b.contact}</div>
                      </div>
                      <span style={{
                        fontSize: 9,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        background: status === "accepted" ? "rgba(34,197,94,0.15)" : status === "declined" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                        color: status === "accepted" ? "#22c55e" : status === "declined" ? "#ef4444" : "#3b82f6",
                        border: "1px solid var(--line)",
                      }}>
                        {status}
                      </span>
                    </div>
                    {b.message && <div style={{ fontSize: 12, color: "var(--fg-dim)", marginBottom: 8 }}>{b.message}</div>}
                    {b.design_id && <div className="mono" style={{ fontSize: 11, color: "var(--fg-faint)", marginBottom: 8 }}>Plate: {b.design_id}</div>}

                    {status === "pending" && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
                        <input
                          type="date"
                          className="input"
                          style={{ fontSize: 11, padding: "5px 8px", width: "auto" }}
                          value={appointmentInputs[b.id] ?? ""}
                          onChange={(e) => setAppointmentInputs(prev => ({ ...prev, [b.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handleAccept(b.id)}
                          disabled={actionPending.has(b.id)}
                          style={{ padding: "5px 14px", background: "#22c55e", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, opacity: actionPending.has(b.id) ? 0.6 : 1 }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(b.id)}
                          disabled={actionPending.has(b.id)}
                          style={{ padding: "5px 14px", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, opacity: actionPending.has(b.id) ? 0.6 : 1 }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--fg-faint)" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", marginRight: 4, verticalAlign: "middle" }} />Pending</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", marginRight: 4, verticalAlign: "middle" }} />Accepted</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#ef4444", marginRight: 4, verticalAlign: "middle" }} />Declined</span>
      </div>
    </div>
  );
}
