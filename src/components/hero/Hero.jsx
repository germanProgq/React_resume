import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Mouth from './Mouth';
import FadeInSection from '../fadeIn/FadeInSection';

/* ------ EYE ------ */
function Eye({ position, lookAt }) {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = lookAt.x * 0.5;
      groupRef.current.rotation.x = lookAt.y * 0.5;
    }
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

/* ------ EYEBROWS ------ */
function Eyebrows({ eyebrowLift, eyebrowTilt }) {
  return (
    <group>
      <mesh
        position={[-0.4, 0.55 + eyebrowLift, 0.85]}
        rotation={[0, 0, eyebrowTilt]}
      >
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh
        position={[0.4, 0.55 + eyebrowLift, 0.85]}
        rotation={[0, 0, -eyebrowTilt]}
      >
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function Head({ lookAt, mouthOpen, mouthArc, eyebrowLift, eyebrowTilt }) {
  const scaleFactor = 2;
  const torsoProfile = [
    new THREE.Vector2(0.6, 0),
    new THREE.Vector2(1.2, -0.3),
    new THREE.Vector2(1.3, -0.5),
    new THREE.Vector2(1.3, -0.8),
    new THREE.Vector2(1.2, -1.2),
    new THREE.Vector2(0.9, -1.5),
  ];

  return (
    <group position={[0, -1, 0]} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      {/* Head */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="pink" />
      </mesh>

      {/* Hat */}
      <group position={[0, 0.9, 0]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Eyes */}
      <Eye position={[-0.4, 0.2, 0.9]} lookAt={lookAt} />
      <Eye position={[0.4, 0.2, 0.9]} lookAt={lookAt} />

      {/* Eyebrows */}
      <Eyebrows eyebrowLift={eyebrowLift} eyebrowTilt={eyebrowTilt} />

      {/* Mouth */}
      <Mouth mouthOpen={mouthOpen} mouthArc={mouthArc} />

      {/* Extended torso */}
      <mesh position={[0, -1, 0]}>
        <latheGeometry args={[torsoProfile, 32]} />
        <meshStandardMaterial color="#f5c7a9" />
      </mesh>
    </group>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* ------ ANIMATOR (inside Canvas) ------ */
function Animator({ targetExpr, setAnimatedExpr }) {
  useFrame(() => {
    setAnimatedExpr((prev) => ({
      mouthOpen:
        prev.mouthOpen + (targetExpr.mouthOpen - prev.mouthOpen) * 0.05,
      mouthArc:
        prev.mouthArc + (targetExpr.mouthArc - prev.mouthArc) * 0.05,
      eyebrowLift:
        prev.eyebrowLift + (targetExpr.eyebrowLift - prev.eyebrowLift) * 0.05,
      eyebrowTilt:
        prev.eyebrowTilt + (targetExpr.eyebrowTilt - prev.eyebrowTilt) * 0.05,
    }));
  });
  return null;
}

/* ------ MAIN COMPONENT ------ */
export default function Hero() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [targetExpr, setTargetExpr] = useState({
    mouthOpen: 0,
    mouthArc: 0,
    eyebrowLift: 0,
    eyebrowTilt: 0,
  });
  const [animatedExpr, setAnimatedExpr] = useState({
    mouthOpen: 0,
    mouthArc: 0,
    eyebrowLift: 0,
    eyebrowTilt: 0,
  });
  const [isClicked, setIsClicked] = useState(false);


  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setMouse({ x: xNorm, y: yNorm - 0.6 });

    if (!isClicked) {
      const distance = Math.sqrt(xNorm * xNorm + yNorm * yNorm);
      setTargetExpr({
        mouthOpen: clamp(distance, 0, 1),
        mouthArc: clamp(-yNorm, -0.3, 0.3),
        eyebrowLift: clamp(yNorm * 0.2, -0.1, 0.1),
        eyebrowTilt: clamp(xNorm * 0.3, -0.3, 0.3),
      });
    }
  }

  function handleClick() {
    setIsClicked(true);
    // Sassy emote
    setTargetExpr({
      mouthOpen: 0.5,
      mouthArc: -0.2,
      eyebrowLift: 0.3,
      eyebrowTilt: -0.3,
    });
    // Revert after 1 second
    setTimeout(() => {
      setIsClicked(false);
      const { x, y } = mouse;
      const distance = Math.sqrt(x * x + y * y);
      setTargetExpr({
        mouthOpen: clamp(distance, 0, 1),
        mouthArc: clamp(-y, -0.3, 0.3),
        eyebrowLift: clamp(y * 0.2, -0.1, 0.1),
        eyebrowTilt: clamp(x * 0.3, -0.3, 0.3),
      });
    }, 1000);
  }

  return (
    <div
      id='hero'
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        // If the parent 'clips' your text, switch to 'visible' or remove overflow
        // overflow: 'hidden',
        background: `linear-gradient(to bottom, var(--theme-bg-gradient-start), var(--theme-bg-gradient-end))`,
      }}
    >
      {/* Massive Title behind model, fitting "German Vinokurov" in full */}
        <h1
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3, // behind the canvas
            margin: 0,
            width: '90vw',       // Use 90% of viewport width
            whiteSpace: 'nowrap',
            textAlign: 'center',
            // The clamp ensures the text shrinks enough to show all words
            fontSize: 'clamp(2rem, 10vw, 15rem)',
            color: 'var(--theme-text-secondary)',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        >
          German Vinokurov
        </h1>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5] }}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 2, // The model is in front
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Animator targetExpr={targetExpr} setAnimatedExpr={setAnimatedExpr} />
        <Head
          lookAt={mouse}
          mouthOpen={animatedExpr.mouthOpen}
          mouthArc={animatedExpr.mouthArc}
          eyebrowLift={animatedExpr.eyebrowLift}
          eyebrowTilt={animatedExpr.eyebrowTilt}
        />
      </Canvas>
    </div>
  );
}
