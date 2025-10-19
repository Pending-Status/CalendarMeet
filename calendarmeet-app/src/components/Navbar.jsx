import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-green-700 to-yellow-500 text-white shadow-md">
      <Link to="/" className="text-xl font-bold">
        CalendarMeet
      </Link>
      <Link
        to="/calendar"
        className="bg-white text-green-700 font-semibold px-5 py-2 rounded-full hover:bg-green-50 transition"
      >
        Create / View Events
      </Link>
    </nav>
  );
};

export default Navbar;
