import React, { useState, useEffect, useRef } from 'react';
import './NavBar.css';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu if clicking outside of the nav container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-logo">
        <a href="#hero" onClick={closeMenu}>GV</a>
      </div>

      <div className="burger-icon" onClick={toggleMenu}>
        <div className={`line top ${menuOpen ? 'open' : ''}`} />
        <div className={`line middle ${menuOpen ? 'open' : ''}`} />
        <div className={`line bottom ${menuOpen ? 'open' : ''}`} />
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <a href="#hero" onClick={closeMenu}>Home</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#timeline" onClick={closeMenu}>Resume</a>
        <a href="#lang" onClick={closeMenu}>Skills</a>
        <a href="#projects" onClick={closeMenu}>Projects</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
        <a href="#socials" onClick={closeMenu}>Socials</a>
      </div>
    </nav>
  );
}

export default NavBar;
