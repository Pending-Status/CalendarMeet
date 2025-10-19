export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-green-800 to-amber-400 text-white">
      <h2 className="text-5xl font-bold mb-4">Pending Status Presents</h2>
      <h1 className="text-6xl font-extrabold mb-4">CalendarMeet, Fall 2025</h1>
      <p className="text-lg max-w-2xl">
        Plan events, share times, and stay connected — the easiest way for groups
        to schedule and bring everyone together.
      </p>
      <ul className="text-left mt-8 space-y-2 text-lg">
        <li>✔️ Plan events and pick the perfect time</li>
        <li>✔️ Share links so friends can join instantly</li>
        <li>✔️ Coordinate and stay organized with ease</li>
      </ul>
      <div className="mt-8 flex space-x-4">
        <button className="bg-white text-green-900 font-semibold px-5 py-2 rounded-lg hover:bg-gray-100">
          Explore our Project
        </button>
        <button className="bg-green-900 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700">
          Meet the Team
        </button>
      </div>
    </section>
  );
}
