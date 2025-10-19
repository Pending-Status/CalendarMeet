import React from "react";

const EventsSection = () => {
  const events = [
    { title: "Study Session at Library", date: "Oct 22, 2025", emoji: "📚" },
    { title: "Basketball Meetup", date: "Oct 25, 2025", emoji: "🏀" },
    { title: "Painting Workshop", date: "Nov 1, 2025", emoji: "🎨" },
  ];

  return (
    <section className="py-20 bg-white text-gray-800 text-center">
      <h2 className="text-3xl font-bold mb-10 text-green-700">
        Upcoming Events
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-green-600 to-yellow-500 text-white w-72 rounded-xl p-6 shadow-lg hover:scale-105 transform transition"
          >
            <div className="text-4xl mb-3">{event.emoji}</div>
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p className="text-sm mt-2 text-white/90">{event.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventsSection;
