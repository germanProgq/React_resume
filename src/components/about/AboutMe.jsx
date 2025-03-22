// src/components/AboutMe.jsx
import React, { useState } from 'react';
import FadeInSection from '../fadeIn/FadeInSection';
import './AboutMe.css';
import { aboutText, aboutButtonText, aboutSectionName } from '../../texts/about';

export default function AboutMe() {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [bgTransform, setBgTransform] = useState({ translateX: 0, translateY: 0 });

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * -12;
    setTransform({ rotateX, rotateY });

    const translateX = ((x - centerX) / centerX) * 25;
    const translateY = ((y - centerY) / centerY) * 25;
    setBgTransform({ translateX, translateY });
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 768) return;
    setTransform({ rotateX: 0, rotateY: 0 });
    setBgTransform({ translateX: 0, translateY: 0 });
  };

  return (
    <section
      className="about-section"
      id="about"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Background Shape */}
      <div
        className="background-shape"
        style={{
          transform: `
            translate(-50%, -50%)
            translateX(${bgTransform.translateX}px)
            translateY(${bgTransform.translateY}px)
            rotateY(${transform.rotateY / 3}deg)
            rotateX(${transform.rotateX / 3}deg)
          `,
        }}
      />

      {/* Interactive Content */}
      <div
        className="interactive-container"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
      >
        <FadeInSection>
          {/* Title */}
          <h2>{aboutSectionName}</h2>

          {/* Paragraph */}
          <p>{aboutText}</p>

          {/* Button */}
          <button className="hire-me-button">
            <a href="#contact">{aboutButtonText}</a>
          </button>
        </FadeInSection>
      </div>
    </section>
  );
}
