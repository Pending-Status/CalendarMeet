import React, { useState } from "react";

const HeroSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <section className="bg-gradient-to-r from-green-700 via-green-600 to-yellow-500 text-white flex flex-col justify-center items-center min-h-screen text-center px-6">
      <h1 className="text-5xl font-extrabold mb-3 drop-shadow-lg">
        Welcome to <span className="text-yellow-300">CalendarMeet</span>
      </h1>
      <p className="text-xl mb-10 text-white/90">
        Make friends, stay connected, and enjoy events.
      </p>

      {/* Category Buttons */}
      <div className="flex flex-col gap-3 items-center text-lg font-medium w-80">
        {["Studying", "Sports", "Hobbies"].map((category) => (
          <div
            key={category}
            onClick={() => handleSelect(category)}
            className={`cursor-pointer bg-white/20 hover:bg-white/30 transition rounded-lg px-8 py-3 w-full text-center shadow-md ${
              selectedCategory === category ? "ring-2 ring-white" : ""
            }`}
          >
            {category === "Studying" && "📚 "}
            {category === "Sports" && "🏀 "}
            {category === "Hobbies" && "🎨 "}
            {category}
          </div>
        ))}
      </div>

      {/* Subcategory Forms */}
      {selectedCategory === "Studying" && (
        <div className="bg-white/20 mt-6 p-6 rounded-lg w-80 text-left">
          <label className="block mb-2 font-semibold">Subject</label>
          <input
            type="text"
            placeholder="e.g., CS 4800"
            className="w-full p-2 mb-3 rounded text-black"
          />
          <label className="block mb-2 font-semibold">Professor</label>
          <input
            type="text"
            placeholder="e.g., Dr. Carlson"
            className="w-full p-2 mb-3 rounded text-black"
          />
          <label className="block mb-2 font-semibold">Location</label>
          <input
            type="text"
            placeholder="e.g., Library"
            className="w-full p-2 rounded text-black"
          />
        </div>
      )}

      {selectedCategory === "Sports" && (
        <div className="bg-white/20 mt-6 p-6 rounded-lg w-80 text-left">
          <label className="block mb-2 font-semibold">Sport Type</label>
          <input
            type="text"
            placeholder="e.g., Basketball"
            className="w-full p-2 mb-3 rounded text-black"
          />
          <label className="block mb-2 font-semibold">Location</label>
          <input
            type="text"
            placeholder="e.g., Gym or Park"
            className="w-full p-2 rounded text-black"
          />
        </div>
      )}

      {selectedCategory === "Hobbies" && (
        <div className="bg-white/20 mt-6 p-6 rounded-lg w-80 text-left">
          <label className="block mb-2 font-semibold">Interests</label>
          <input
            type="text"
            placeholder="e.g., Anime, Programming, Art, Games"
            className="w-full p-2 rounded text-black"
          />
        </div>
      )}
    </section>
  );
};

export default HeroSection;
