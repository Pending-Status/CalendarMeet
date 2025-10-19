import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // for clicks
import { Link } from "react-router-dom";

const CalendarPage = () => {
  const [events, setEvents] = useState([
    { title: "Study Session", date: "2025-10-22" },
    { title: "Basketball Meetup", date: "2025-10-25" },
    { title: "Painting Workshop", date: "2025-11-01" },
  ]);

  const handleDateClick = (info) => {
    alert(`You clicked on ${info.dateStr}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-700 to-yellow-500 p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <Link
          to="/"
          className="bg-white text-green-700 px-5 py-2 rounded-full font-semibold hover:bg-green-50 transition"
        >
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-xl p-6 text-black shadow-lg">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          height="80vh"
        />
      </div>
    </div>
  );
};

export default CalendarPage;
