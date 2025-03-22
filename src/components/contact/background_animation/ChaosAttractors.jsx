// ChaosAttractors.js
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../../theme';

/* --------------------------------
 * 1) Lorenz Attractor
 *    dx/dt = sigma*(y - x)
 *    dy/dt = x*(rho - z) - y
 *    dz/dt = x*y - beta*z
 --------------------------------- */
function generateLorenzPoints(sigma, rho, beta, steps = 10000, dt = 0.005) {
  const points = new Float32Array(steps * 3);
  let x = 0.1, y = 0, z = 0;
  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

export function LorenzAttractor({ sigma = 10, rho = 28, beta = 8 / 3 }) {
  const lineRef = useRef();
  const positions = useMemo(() => generateLorenzPoints(sigma, rho, beta), [sigma, rho, beta]);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.rotation.y += 0.0006;
      lineRef.current.rotation.x += 0.0003;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <lineBasicMaterial color={theme.outlineColor} />
    </line>
  );
}

/* --------------------------------
 * 2) Rössler Attractor
 *    dx/dt = -(y + z)
 *    dy/dt = x + a*y
 *    dz/dt = b + z*(x - c)
 --------------------------------- */
function generateRosslerPoints(a, b, c, steps = 10000, dt = 0.005) {
  const points = new Float32Array(steps * 3);
  let x = 0.2, y = 0, z = 0;
  for (let i = 0; i < steps; i++) {
    const dx = -(y + z);
    const dy = x + a * y;
    const dz = b + z * (x - c);

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

export function RosslerAttractor({ a = 0.2, b = 0.2, c = 5.7 }) {
  const lineRef = useRef();
  const positions = useMemo(() => generateRosslerPoints(a, b, c), [a, b, c]);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.rotation.y -= 0.0005;
      lineRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <lineBasicMaterial color={theme.textPrimary} />
    </line>
  );
}

/* --------------------------------
 * 3) Aizawa Attractor
 *    dx/dt = (z - b)*x - d*y
 *    dy/dt = d*x + (z - b)*y
 *    dz/dt = c + a*z - (z^3)/3 - (x^2 + y^2)*(1 + e*z) + f*z*(x^3)
 --------------------------------- */
function generateAizawaPoints(a, b, c, d, e, f, steps = 10000, dt = 0.01) {
  const points = new Float32Array(steps * 3);
  let x = 0.1, y = 0, z = 0;
  for (let i = 0; i < steps; i++) {
    const dx = (z - b) * x - d * y;
    const dy = d * x + (z - b) * y;
    const dz =
      c + a * z -
      (z ** 3) / 3 -
      (x ** 2 + y ** 2) * (1 + e * z) +
      f * z * (x ** 3);

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

export function AizawaAttractor({
  a = 0.95,
  b = 0.7,
  c = 0.6,
  d = 3.5,
  e = 0.25,
  f = 0.1,
}) {
  const lineRef = useRef();
  const positions = useMemo(
    () => generateAizawaPoints(a, b, c, d, e, f),
    [a, b, c, d, e, f]
  );

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.rotation.z += 0.0004;
      lineRef.current.rotation.y -= 0.0003;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <lineBasicMaterial color={theme.textSecondary} />
    </line>
  );
}

/* --------------------------------
 * 4) Thomas' Cyclically Symmetric Attractor
 *    dx/dt = -a*x + sin(y)
 *    dy/dt = -a*y + sin(z)
 *    dz/dt = -a*z + sin(x)
 --------------------------------- */
function generateThomasPoints(a, steps = 10000, dt = 0.01) {
  const points = new Float32Array(steps * 3);
  let x = 0.1, y = 0, z = 0;
  for (let i = 0; i < steps; i++) {
    const dx = -a * x + Math.sin(y);
    const dy = -a * y + Math.sin(z);
    const dz = -a * z + Math.sin(x);

    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

export function ThomasAttractor({ a = 0.18 }) {
  const lineRef = useRef();
  const positions = useMemo(() => generateThomasPoints(a), [a]);

  useFrame(() => {
    if (lineRef.current) {
      lineRef.current.rotation.x -= 0.0003;
      lineRef.current.rotation.y += 0.0004;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <lineBasicMaterial color={theme.linkHoverColor} />
    </line>
  );
}

/* --------------------------------
 * Camera Rig
 --------------------------------- */
export function MovingCameraRig({ children }) {
  const groupRef = useRef();

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;
    // Very slow elliptical orbit
    const t = clock.getElapsedTime() * 0.05;
    camera.position.x = 50 * Math.cos(t);
    camera.position.z = 50 * Math.sin(t);
    camera.lookAt(0, 0, 0);

    // Gently bob the entire group
    groupRef.current.position.y = Math.sin(t * 2) * 2;
  });

  return <group ref={groupRef}>{children}</group>;
}
