import { useEffect, useState } from "react";
import {
  MdCalendarMonth,
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdGroups,
  MdCall,
  MdSchedule,
  MdAdd,
} from "react-icons/md";

import { getAllEvents } from "../services/calendarService";

import AddEventModal from "../components/AddEventModal";
import ViewEventModal from "../components/ViewEventModal";

import "../styles/Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Calendar() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);

  const [year, setYear] = useState(today.getFullYear());

  const [events, setEvents] = useState([]);

  const [openAddModal, setOpenAddModal] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");

  const loadEvents = async () => {
    try {
      const res = await getAllEvents(month, year);

      setEvents(res.events || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadEvents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToday = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  // ==============================
  // Build Month Grid
  // ==============================

  const firstDay = new Date(year, month - 1, 1).getDay();

  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const eventsForDay = (day) =>
    events.filter((event) => {
      const date = new Date(event.date);

      return (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
      );
    });

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  const pad = (n) => String(n).padStart(2, "0");

  const handleDayClick = (day) => {
    setSelectedDate(`${year}-${pad(month)}-${pad(day)}`);

    setOpenAddModal(true);
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();

    setSelectedEvent(event);

    setOpenViewModal(true);
  };

  const monthEvents = events.filter((event) => {
    const date = new Date(event.date);
    return date.getMonth() === month - 1 && date.getFullYear() === year;
  });

  const countByType = (type) =>
    monthEvents.filter((event) => event.eventType === type).length;

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1>
            <MdCalendarMonth className="calendar-header-icon" /> Calendar
          </h1>

          <p>Meetings, Calls & Follow-ups</p>
        </div>

        <button
          className="add-event-btn"
          onClick={() => {
            setSelectedDate("");

            setOpenAddModal(true);
          }}
        >
          <MdAdd /> Add Event
        </button>
      </div>

      {/* Stats */}

      <div className="calendar-stats">
        <div className="calendar-stat-card total">
          <div className="calendar-stat-icon"><MdCalendarMonth /></div>
          <div>
            <h2>{monthEvents.length}</h2>
            <span>This Month</span>
          </div>
        </div>

        <div className="calendar-stat-card meeting">
          <div className="calendar-stat-icon"><MdGroups /></div>
          <div>
            <h2>{countByType("Meeting")}</h2>
            <span>Meetings</span>
          </div>
        </div>

        <div className="calendar-stat-card call">
          <div className="calendar-stat-icon"><MdCall /></div>
          <div>
            <h2>{countByType("Call")}</h2>
            <span>Calls</span>
          </div>
        </div>

        <div className="calendar-stat-card followup">
          <div className="calendar-stat-icon"><MdSchedule /></div>
          <div>
            <h2>{countByType("Follow-up")}</h2>
            <span>Follow-ups</span>
          </div>
        </div>
      </div>

      <div className="calendar-toolbar">
        <h2>
          {MONTHS[month - 1]} {year}
        </h2>

        <div className="calendar-nav">
          <button className="nav-icon-btn" onClick={prevMonth} title="Previous month">
            <MdChevronLeft />
          </button>

          <button className="today-btn" onClick={goToday}>
            <MdToday /> Today
          </button>

          <button className="nav-icon-btn" onClick={nextMonth} title="Next month">
            <MdChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {cells.map((day, index) =>
            day === null ? (
              <div key={`empty-${index}`} className="calendar-day empty" />
            ) : (
              <div
                key={day}
                className={`calendar-day ${isToday(day) ? "today" : ""} ${
                  index % 7 === 0 || index % 7 === 6 ? "weekend" : ""
                }`}
                onClick={() => handleDayClick(day)}
              >
                <span className="day-number">{day}</span>

                {eventsForDay(day)
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event._id}
                      className={`event-chip ${event.eventType
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")} ${
                        event.status === "Cancelled" ? "cancelled" : ""
                      }`}
                      onClick={(e) => handleEventClick(e, event)}
                      title={event.title}
                    >
                      {event.time ? `${event.time} · ` : ""}
                      {event.title}
                    </div>
                  ))}

                {eventsForDay(day).length > 3 && (
                  <span className="more-events">
                    +{eventsForDay(day).length - 3} more
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <AddEventModal
        open={openAddModal}
        defaultDate={selectedDate}
        onClose={() => setOpenAddModal(false)}
        onSuccess={loadEvents}
      />

      <ViewEventModal
        open={openViewModal}
        event={selectedEvent}
        onClose={() => setOpenViewModal(false)}
        onSuccess={loadEvents}
      />
    </div>
  );
}

export default Calendar;
