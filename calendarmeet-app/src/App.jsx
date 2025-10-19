import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import TeamSection from "./components/TeamSection";

function App() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TeamSection />
    </div>
  );
}

export default App;
