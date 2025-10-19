import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-green-700 to-yellow-500 text-white shadow-md">
      <h1 className="text-xl font-bold">CalendarMeet</h1>
      <button className="bg-white text-green-700 font-semibold px-5 py-2 rounded-full hover:bg-green-50 transition">
        Create Event
      </button>
    </nav>
  );
};

export default Navbar;
