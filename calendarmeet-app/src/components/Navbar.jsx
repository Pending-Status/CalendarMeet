export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-green-800 to-amber-400 text-white shadow-md">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📅</span>
          <h1 className="text-2xl font-bold">CalendarMeet</h1>
        </div>

        <nav className="flex space-x-8 font-medium">
          <a href="#about" className="hover:text-yellow-200">About</a>
          <a href="#team" className="hover:text-yellow-200">Team</a>
          <a href="#projects" className="hover:text-yellow-200">Projects</a>
        </nav>
      </div>
    </header>
  );
}
