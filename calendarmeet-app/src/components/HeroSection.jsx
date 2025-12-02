import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-green-700 via-green-600 to-yellow-500 text-white flex flex-col justify-center items-center min-h-screen text-center px-6">
      <h1 className="text-5xl font-extrabold mb-3 drop-shadow-lg">
        Welcome to <span className="text-yellow-300">CalendarMeet</span>
      </h1>
      <p className="text-xl text-white/90">
        Make friends, stay connected, and enjoy events.
      </p>
    </section>
  );
};

export default HeroSection;