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
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="bg-transparent border border-[#E8E3D8] px-3 py-1.5 cursor-pointer text-[#5A5B55] text-[13px] font-sora"
        >
          ←
        </button>
        <div className="font-playfair font-semibold text-[#1B1C18] text-[18px]">{MONTH_NAMES[month]} {year}</div>
        <button
          onClick={nextMonth}
          className="bg-transparent border border-[#E8E3D8] px-3 py-1.5 cursor-pointer text-[#5A5B55] text-[13px] font-sora"
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {DAY_NAMES.map(d => (
          <div key={d} className="font-sora text-[10px] tracking-[0.1em] text-[#5A5B55]/60 text-center py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-[#E8E3D8] border border-[#E8E3D8] mb-6">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e${i}`} className="bg-[#FAF7F2] min-h-[52px]" />;
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
              className={`min-h-[52px] p-1.5 px-2 relative transition-colors ${
                isSelected
                  ? "bg-[#E8E0D0] border-b-2 border-[#E60023]"
                  : "bg-[#F0EBE1]"
              } ${dayBookings.length > 0 ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`font-sora text-xs ${isToday ? "text-[#E60023] font-bold" : "text-[#5A5B55] font-normal"}`}>
                {day}
              </div>
              {/* Dot indicators */}
              {dayBookings.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" title="Pending inquiry" />}
                  {hasAccepted && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" title="Accepted" />}
                  {hasDeclined && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" title="Declined" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedDay && (
        <div className="border border-[#E8E3D8] p-5 bg-[#F5F0E8] mb-6">
          <div className="font-sora text-[10px] tracking-[0.2em] uppercase text-[#5A5B55]/60 mb-4">
            {selectedDay}
          </div>
          {selectedBookings.length === 0 ? (
            <p className="text-[#5A5B55] text-[13px]">No bookings on this date.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedBookings.map((b) => {
                const status = b.status ?? "pending";
                return (
                  <div key={b.id} className="border-l-2 border-[#E8E3D8] pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{b.name}</div>
                        <div className="font-sora text-[11px] text-[#5A5B55]">{b.contact}</div>
                      </div>
                      <span className={`font-sora text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border border-[#E8E3D8] ${
                        status === "accepted" ? "bg-green-500/15 text-green-500" :
                        status === "declined" ? "bg-red-500/15 text-red-500" :
                        "bg-blue-500/15 text-blue-500"
                      }`}>
                        {status}
                      </span>
                    </div>
                    {b.message && <div className="text-xs text-[#5A5B55] mb-2">{b.message}</div>}
                    {b.design_id && <div className="font-sora text-[11px] text-[#5A5B55]/60 mb-2">Plate: {b.design_id}</div>}

                    {status === "pending" && (
                      <div className="flex gap-2 items-center flex-wrap mt-2.5">
                        <input
                          type="date"
                          className="w-auto bg-[#F5F0E8] border border-[#E8E3D8] text-[#1B1C18] font-sora text-[11px] px-2 py-1.5 rounded-lg outline-none focus:border-[#E60023] transition-colors"
                          value={appointmentInputs[b.id] ?? ""}
                          onChange={(e) => setAppointmentInputs(prev => ({ ...prev, [b.id]: e.target.value }))}
                        />
                        <button
                          onClick={() => handleAccept(b.id)}
                          disabled={actionPending.has(b.id)}
                          className="px-3.5 py-1.5 bg-green-500 text-white border-none cursor-pointer text-xs disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(b.id)}
                          disabled={actionPending.has(b.id)}
                          className="px-3.5 py-1.5 bg-red-500 text-white border-none cursor-pointer text-xs disabled:opacity-60"
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
      <div className="flex gap-4 font-sora text-[11px] text-[#5A5B55]/60">
        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 align-middle" />Pending</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 align-middle" />Accepted</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1 align-middle" />Declined</span>
      </div>
    </div>
  );
}
