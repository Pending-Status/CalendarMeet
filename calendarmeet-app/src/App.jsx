import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import EventsSection from "./components/EventsSection";
import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-3JKPKPVV9C";
ReactGA.initialize(MEASUREMENT_ID);

useEffect(() => {
        ReactGA.initialize('G-YOUR_ID_HERE');
        ReactGA.send({ hitType: "pageview", page: window.location.pathname });
      }, []);

function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <EventsSection />
    </>
  );
}

export default App;
