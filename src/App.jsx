import React, { useState, useEffect } from 'react';
import './App.css';
import { theme } from './theme';
import Loader from './components/loader/Loader';
import MagicCursor from './components/assets/cursor/MagicCursor';
import NavBar from './components/navbar/NavBar';
import Hero from './components/hero/Hero';
import MobileHero from './components/hero/mobileHero';
import AboutMe from './components/about/AboutMe';
import Timeline from './components/timeline/TimeLine';
import Projects from './components/projects/Projects';
import ProgrammingLanguages from './components/programmingLanguages/ProgrammingLanguages';
import ContactForm from './components/contact/form/ContactForm';
import { isMobile } from 'react-device-detect';
import SocialShowcase from './components/socials/Socials';

// 1) Helper function to ensure the entire page and fonts are loaded
async function checkEverythingLoaded() {
  // Wait until the entire page is loaded (images, scripts, etc.).
  // If it's not already complete, we wait for the 'load' event.
  if (document.readyState !== 'complete') {
    await new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true });
    });
  }

  // Now wait until fonts are loaded (modern browsers support document.fonts.ready)
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  
  // At this point: DOM is complete, images are loaded, and fonts are ready
  return true;
}

function App() {
  const [loading, setLoading] = useState(true);

  // 2) You can customize the minimum loader duration here (in ms)
  const MIN_LOADING_TIME_MS = 1000;

  useEffect(() => {
    const startTime = performance.now();

    checkEverythingLoaded().then(() => {
      const loadTime = performance.now() - startTime;
      const remainingTime = MIN_LOADING_TIME_MS - loadTime;

      // If the page & fonts loaded *faster* than our minimum, wait the leftover time
      if (remainingTime > 0) {
        setTimeout(() => setLoading(false), remainingTime);
      } else {
        // Otherwise, hide the loader immediately
        setLoading(false);
      }
    });
  }, []);

  const appStyle = {
    background: `linear-gradient(120deg, ${theme.bgGradientStart}, ${theme.bgGradientEnd})`,
  };

  return (
    <div className="App" style={appStyle}>
      {loading ? (
        <Loader />
      ) : (
        <MagicCursor>
          <NavBar />
          {isMobile ? <MobileHero /> : <Hero />}
          <AboutMe />
          <Timeline />
          <ProgrammingLanguages />
          <Projects />
          <ContactForm />
          <SocialShowcase />
        </MagicCursor>
      )}
    </div>
  );
}

export default App;
