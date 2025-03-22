// src/components/ContactForm3D.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Plane, Text, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import { theme } from '../../../theme';
import { Vector3 } from 'three';
import './threeDNeonScene.css';
import { Environment } from '@react-three/drei';
import { transitionText } from '../../../texts/transitonScene';

const CyberGrid = () => {
  const gridRef = useRef();
  const { viewport } = useThree();
  
  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    gridRef.current.position.z = Math.sin(clock.elapsedTime) * 0.1;
    gridRef.current.material.opacity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.05;
  });

  return (
    <Plane
      ref={gridRef}
      args={[viewport.width * 1.5, viewport.height * 1.5, 64, 64]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.5, 0]}
    >
      <meshPhysicalMaterial
        color={theme.neonAccent}
        wireframe
        transparent
        opacity={0.2}
        emissive={theme.neonAccent}
        emissiveIntensity={0.3}
      />
    </Plane>
  );
};

const HologramText = () => {
  const textRef = useRef();
  
  useFrame(({ clock }) => {
    if (!textRef.current) return;
    textRef.current.position.y = Math.sin(clock.elapsedTime) * 0.05;
    textRef.current.material.opacity = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.2;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 2.2, 0]}
      fontSize={0.4}
      color={theme.neonAccent}
      anchorX="center"
      anchorY="middle"
    >
      ENCRYPTED CHANNEL v4.20.69
    </Text>
  );
};

const FloatingParticles = () => {
  const particles = useRef();
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame(({ clock }) => {
    if (particles.current) {
      particles.current.rotation.y = clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <pointsMaterial
        color={theme.neonAccent}
        size={0.03}
        transparent
        opacity={0.8}
        emissive={theme.neonAccent}
        emissiveIntensity={2}
      />
    </points>
  );
};

const CyberButton = ({ onClick }) => {
  const btnRef = useRef();
  
  useFrame(({ clock }) => {
    if (btnRef.current) {
      btnRef.current.material.emissiveIntensity =
        0.5 + Math.sin(clock.elapsedTime * 5) * 0.5;
    }
  });

  return (
    <Sphere
      ref={btnRef}
      args={[0.15, 32, 32]}
      position={[1.8, -1.2, 0]}
      onClick={onClick}
    >
      <meshPhysicalMaterial
        color={theme.neonAccent}
        emissive={theme.neonAccent}
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
        roughness={0.1}
        metalness={0.9}
      />
    </Sphere>
  );
};

function FormTerminal() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [glitchActive, setGlitchActive] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef()];

  const handleHover = (index) => {
    const input = inputRefs[index].current;
    input.style.borderColor = theme.neonAccent;
    input.style.boxShadow = `0 0 15px ${theme.neonAccent}`;
    setGlitchActive(true);
  };

  const handleBlur = (index) => {
    const input = inputRefs[index].current;
    input.style.borderColor = '#3a3a3a';
    input.style.boxShadow = 'none';
    setGlitchActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submission = `DATA PACKET RECEIVED\nNAME: ${formData.name}\nEMAIL: ${formData.email}\nMESSAGE: ${formData.message}`;
    alert(submission);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Html center transform distanceFactor={1.2} zIndexRange={[0, 100]}>
      <div className="cyber-terminal">
        <div className="scanline"></div>
        <form onSubmit={handleSubmit} className="cyber-form">
          <label className="cyber-label">IDENTITY</label>
          <input
            ref={inputRefs[0]}
            type="text"
            name="name"
            className="cyber-input"
            onMouseEnter={() => handleHover(0)}
            onMouseLeave={() => handleBlur(0)}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            value={formData.name}
          />
          
          <label className="cyber-label">E-MAIL PROTOCOL</label>
          <input
            ref={inputRefs[1]}
            type="email"
            name="email"
            className="cyber-input"
            onMouseEnter={() => handleHover(1)}
            onMouseLeave={() => handleBlur(1)}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            value={formData.email}
          />

          <label className="cyber-label">MESSAGE DATA</label>
          <textarea
            ref={inputRefs[2]}
            name="message"
            className="cyber-textarea"
            onMouseEnter={() => handleHover(2)}
            onMouseLeave={() => handleBlur(2)}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            value={formData.message}
          />

          <CyberButton onClick={handleSubmit} />
        </form>
      </div>
      {glitchActive && (
        <EffectComposer>
          <Glitch delay={[0.1, 0.3]} duration={[0.1, 0.2]} strength={0.2} />
        </EffectComposer>
      )}
    </Html>
  );
}

export default function ThreeDNeonScene() {
  return (
    <div className="cyber-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <ambientLight intensity={0.25} />
        <pointLight
          position={[10, 10, 10]}
          intensity={1.5}
          color={theme.neonAccent}
        />
        <Environment preset="night" />

        <CyberGrid />
        <FloatingParticles />
        <HologramText />

        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.9} />
          <ChromaticAberration offset={[0.002, 0.002]} />
        </EffectComposer>

        <OrbitControls
          enableZoom={false}
          enablePan
          autoRotate
          autoRotateSpeed={0.25}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.75}
        />

        <FormTerminal />
      </Canvas>
    </div>
  );
}
