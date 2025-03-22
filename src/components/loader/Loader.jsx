// src/components/Loader.jsx
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import './Loader.css';

//
// DynamicLine: Connects two nodes and updates its endpoints each frame.
//
function DynamicLine({ nodes, i, j }) {
  const lineRef = useRef();
  useFrame(() => {
    if (
      lineRef.current &&
      lineRef.current.geometry &&
      lineRef.current.geometry.attributes &&
      lineRef.current.geometry.attributes.position
    ) {
      const posArray = lineRef.current.geometry.attributes.position.array;
      posArray[0] = nodes[i].pos.x;
      posArray[1] = nodes[i].pos.y;
      posArray[2] = nodes[i].pos.z;
      posArray[3] = nodes[j].pos.x;
      posArray[4] = nodes[j].pos.y;
      posArray[5] = nodes[j].pos.z;
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(6)}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#9d4edd" transparent opacity={0.5} />
    </line>
  );
}

//
// DynamicNodes: A force-directed network of nodes that attract each other using a simple gravitational simulation.
//
function DynamicNodes() {
  const nodeCount = 8;
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * 3 + (Math.random() - 0.5);
      const y = Math.sin(angle) * 3 + (Math.random() - 0.5);
      const z = (Math.random() - 0.5) * 2;
      arr.push({ pos: new THREE.Vector3(x, y, z), vel: new THREE.Vector3() });
    }
    return arr;
  }, []);
  const groupRef = useRef();
  useFrame((state, delta) => {
    const G = 1, epsilon = 0.5, damping = 0.98;
    for (let i = 0; i < nodes.length; i++) {
      let force = new THREE.Vector3();
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const diff = new THREE.Vector3().subVectors(nodes[j].pos, nodes[i].pos);
        const distSq = diff.lengthSq() + epsilon;
        const f = G / distSq;
        force.add(diff.normalize().multiplyScalar(f));
      }
      nodes[i].vel.add(force.multiplyScalar(delta));
      nodes[i].vel.multiplyScalar(damping);
      nodes[i].pos.add(nodes[i].vel.clone().multiplyScalar(delta));
    }
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child.userData.type === 'node') {
          child.position.copy(nodes[child.userData.index].pos);
        }
      });
    }
  });
  return (
    <group ref={groupRef}>
      {nodes.map((node, idx) => (
        <mesh key={`node-${idx}`} userData={{ type: 'node', index: idx }} position={node.pos}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#9d4edd" />
        </mesh>
      ))}
      {nodes.map((_, i) =>
        nodes.map((_, j) => (j > i ? <DynamicLine key={`line-${i}-${j}`} nodes={nodes} i={i} j={j} /> : null))
      )}
    </group>
  );
}

//
// ComplexOrbiters: Extra moving elements following multi-harmonic paths.
function ComplexOrbiters() {
  const groupRef = useRef();
  const orbiters = useMemo(() => {
    const count = 10;
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        A: Math.random() * 2 + 1,
        B: Math.random() * 2 + 1,
        C: Math.random() * 2 + 1,
        omega1: Math.random() * 2 + 1,
        omega2: Math.random() * 2 + 1,
        omega3: Math.random() * 2 + 1,
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const { A, B, C, omega1, omega2, omega3, phase1, phase2, phase3 } = orbiters[index];
        const x = A * Math.sin(omega1 * time + phase1) + B * Math.cos(omega2 * time + phase2);
        const y = B * Math.sin(omega2 * time + phase2) + C * Math.cos(omega3 * time + phase3);
        const z = C * Math.sin(omega3 * time + phase3) + A * Math.cos(omega1 * time + phase1);
        child.position.set(x, y, z);
        child.rotation.x += 0.01;
        child.rotation.y += 0.01;
      });
    }
  });
  return (
    <group ref={groupRef}>
      {orbiters.map((_, idx) => (
        <mesh key={`orbiter-${idx}`}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color="#9d4edd" />
        </mesh>
      ))}
    </group>
  );
}

//
// ComplexSurface: A continuously deforming parametric surface with a glitchy, code-inspired overlay.
function ComplexSurface() {
  const meshRef = useRef();
  const parametricFunction = (u, v, target) => {
    u *= Math.PI * 2;
    v *= Math.PI * 2;
    const r = 1 + 0.3 * Math.sin(3 * u) * Math.cos(4 * v) + 0.2 * Math.sin(5 * u + v);
    const x = r * Math.cos(u) * Math.sin(v);
    const y = r * Math.sin(u) * Math.sin(v);
    const z = r * Math.cos(v);
    target.set(x, y, z);
  };
  const surfaceGeometry = useMemo(() => new ParametricGeometry(parametricFunction, 50, 50), []);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + 0.1 * Math.sin(time));
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.x = 0.3 * Math.sin(time * 0.7);
      meshRef.current.position.y = 0.3 * Math.cos(time * 0.7);
      if (meshRef.current.material.uniforms && meshRef.current.material.uniforms.time) {
        meshRef.current.material.uniforms.time.value = time;
      }
    }
  });
  return (
    <mesh ref={meshRef} geometry={surfaceGeometry}>
      <meshStandardMaterial
        color="#9d4edd"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.85}
        onBeforeCompile={(shader) => {
          shader.uniforms.time = { value: 0 };
          shader.vertexShader = `
            varying vec2 vUv;
            ${shader.vertexShader}
          `.replace(
            `#include <uv_vertex>`,
            `#include <uv_vertex>
             vUv = uv;`
          );
          shader.fragmentShader = `
            uniform float time;
            varying vec2 vUv;
            ${shader.fragmentShader}
          `.replace(
            `#include <dithering_fragment>`,
            `
            // Glitchy overlay: a subtle digital grid and random noise effect.
            vec2 glitchUV = vUv * 10.0;
            float glitch = fract(sin(dot(glitchUV, vec2(12.9898,78.233)) + time) * 43758.5453);
            glitch = step(0.97, glitch);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.95), glitch * 0.15);
            #include <dithering_fragment>
            `
          );
          meshRef.current.material.userData.shader = shader;
        }}
      />
    </mesh>
  );
}

//
// GlitchText: A text component that updates its content each frame to display rapidly changing numbers.
function GlitchText({ initial = "0000", ...props }) {
  const [content, setContent] = useState(initial);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Create a pseudo-random number string based on time.
    const num = Math.floor((Math.sin(time + Math.random()) + 1) * 5000);
    setContent(num.toString());
  });
  return (
    <Text {...props}>
      {content}
    </Text>
  );
}

//
// GlitchNumbers: Renders a small group of GlitchText elements to simulate flowing, glitchy numbers.
function GlitchNumbers() {
  const count = 10;
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(8);
      const y = THREE.MathUtils.randFloatSpread(8);
      const z = THREE.MathUtils.randFloatSpread(8);
      arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, [count]);
  return (
    <group>
      {positions.map((pos, i) => (
        <GlitchText
          key={`glitch-${i}`}
          position={pos}
          fontSize={0.4}
          color="#9d4edd"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxM.woff"
        />
      ))}
    </group>
  );
}

//
// Loader: Assemble all elements into one interactive 3D scene.
export default function Loader() {
  return (
    <div className="loader-container">
      <Canvas camera={{ position: [0, 0, 12] }} style={{ background: "#1a1a2e" }}>
        <ambientLight intensity={0.5} color="#440066" />
        <directionalLight intensity={0.8} position={[5, 5, 5]} color="#a335ee" />
        <pointLight intensity={0.5} position={[-5, -5, -5]} color="#5500aa" />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          <Vignette offset={0.5} darkness={0.8} />
        </EffectComposer>
        <DynamicNodes />
        <ComplexOrbiters />
        <ComplexSurface />
        <GlitchNumbers />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
  