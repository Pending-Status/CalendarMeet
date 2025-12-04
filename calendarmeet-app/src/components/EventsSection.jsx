import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const EventsSection = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const eventsRef = collection(db, "events");

    // Get the 5 soonest upcoming events
    const q = query(
      eventsRef,
      orderBy("date", "asc"),
      orderBy("time", "asc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  const getEmojiForType = (type) => {
    if (type === "studying") return "📚";
    if (type === "sports") return "🏅";
    if (type === "hobby") return "🎨";
    return "📅";
  };

  const formatDateTime = (date, time) => {
    if (!date) return "";
    const iso = `${date}T${time || "00:00"}`;
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <section className="py-20 bg-white text-gray-800 text-center">
      <h2 className="text-3xl font-bold mb-10 text-green-700">
        Upcoming Events
      </h2>

      {events.length === 0 ? (
        <p className="text-gray-500">
          No events yet. Create one on the calendar page!
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-gradient-to-r from-green-600 to-yellow-500 text-white w-72 rounded-xl p-6 shadow-lg hover:scale-105 transform transition"
            >
              <div className="text-4xl mb-3">
                {getEmojiForType(event.type)}
              </div>
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-sm mt-2 text-white/90">
                {formatDateTime(event.date, event.time)}
                {event.location && ` • ${event.location}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventsSection;
