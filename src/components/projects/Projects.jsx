import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import FadeInSection from '../fadeIn/FadeInSection';
import './Projects.css';
import { theme } from '../../theme';
import { projects, projectsSectionName } from '../../texts/projects';
import { isMobile } from 'react-device-detect'; // Import react-device-detect

// ----- Project Card Component -----
function ProjectCard({ title, desc }) {
  return (
    <div className="project-card">
      <h3 style={{ color: theme.textPrimary }}>{title}</h3>
      <p style={{ color: theme.textSecondary }}>{desc}</p>
    </div>
  );
}

// ----- Draggable & Interactive 3D Shape Base Hook -----
function useDraggable(initialPos, flyOffset) {
  const meshRef = React.useRef();
  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [spring, api] = useSpring(() => ({
    position: initialPos,
    config: { mass: 1, tension: 300, friction: 20 },
  }));

  React.useEffect(() => {
    const target = hovered
      ? [
          initialPos[0] + flyOffset[0],
          initialPos[1] + flyOffset[1],
          initialPos[2] + flyOffset[2],
        ]
      : initialPos;
    if (!dragging) api.start({ position: target });
  }, [hovered, dragging, api, initialPos, flyOffset]);

  return { meshRef, spring, setDragging, setHovered, api, dragging, hovered };
}

// ----- Proximity Hook (uses react-device-detect for mobile check) -----
function useProximity(meshRef, dragging, hovered, setHovered, mouse, threshold = 0.2) {
  const { camera } = useThree();

  useFrame(() => {
    // Skip proximity effect on mobile devices or if there's no mouse
    if (isMobile || !mouse) return;
    if (meshRef.current && !dragging) {
      const pos = meshRef.current.position.clone().project(camera);
      const distance = Math.sqrt((pos.x - mouse.x) ** 2 + (pos.y - mouse.y) ** 2);
      if (distance < threshold && !hovered) {
        setHovered(true);
      } else if (distance >= threshold && hovered) {
        setHovered(false);
      }
    }
  });
}

// Draggable Cube: Smaller and positioned toward the top-left.
const DraggableCube = React.memo(({ mouse }) => {
  const initialPos = [-6, 4, 0];
  const flyOffset = [3, 3, 0];
  const { meshRef, spring, setDragging, setHovered, api, dragging, hovered } =
    useDraggable(initialPos, flyOffset);

  useProximity(meshRef, dragging, hovered, setHovered, mouse, 0.2);

  useFrame((state, delta) => {
    if (meshRef.current && !dragging) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <a.mesh
      ref={meshRef}
      position={spring.position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          api.start({ position: [e.point.x, e.point.y, e.point.z] });
        }
      }}
    >
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color={theme.neonAccent} wireframe />
    </a.mesh>
  );
});

// Draggable Sphere: Smaller and positioned toward the bottom-right.
const DraggableSphere = React.memo(({ mouse }) => {
  const initialPos = [6, -4, 0];
  const flyOffset = [-3, -3, 0];
  const { meshRef, spring, setDragging, setHovered, api, dragging, hovered } =
    useDraggable(initialPos, flyOffset);

  useProximity(meshRef, dragging, hovered, setHovered, mouse, 0.2);

  useFrame((state, delta) => {
    if (meshRef.current && !dragging) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <a.mesh
      ref={meshRef}
      position={spring.position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          api.start({ position: [e.point.x, e.point.y, e.point.z] });
        }
      }}
    >
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color={theme.neonAccent} wireframe />
    </a.mesh>
  );
});

// Draggable Torus: Smaller and positioned toward the bottom-left.
const DraggableTorus = React.memo(({ mouse }) => {
  const initialPos = [-4, -6, 0];
  const flyOffset = [0, 4, 0];
  const { meshRef, spring, setDragging, setHovered, api, dragging, hovered } =
    useDraggable(initialPos, flyOffset);

  useProximity(meshRef, dragging, hovered, setHovered, mouse, 0.2);

  useFrame((state, delta) => {
    if (meshRef.current && !dragging) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <a.mesh
      ref={meshRef}
      position={spring.position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          api.start({ position: [e.point.x, e.point.y, e.point.z] });
        }
      }}
    >
      <torusGeometry args={[2.5, 0.6, 16, 100]} />
      <meshStandardMaterial color={theme.neonAccent} wireframe />
    </a.mesh>
  );
});

// Draggable Octahedron: Smaller and positioned toward the top-right.
const DraggableOctahedron = React.memo(({ mouse }) => {
  const initialPos = [4, 6, 0];
  const flyOffset = [-3, 0, 0];
  const { meshRef, spring, setDragging, setHovered, api, dragging, hovered } =
    useDraggable(initialPos, flyOffset);

  useProximity(meshRef, dragging, hovered, setHovered, mouse, 0.2);

  useFrame((state, delta) => {
    if (meshRef.current && !dragging) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <a.mesh
      ref={meshRef}
      position={spring.position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          api.start({ position: [e.point.x, e.point.y, e.point.z] });
        }
      }}
    >
      <octahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color={theme.neonAccent} wireframe />
    </a.mesh>
  );
});

// ----- Abstract Background Component -----
const AbstractBackground = React.memo(({ mouse }) => {
  return (
    <Canvas
      className="background-canvas"
      camera={{ position: [0, 0, 18] }}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1 
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <DraggableCube mouse={mouse} />
      <DraggableSphere mouse={mouse} />
      <DraggableTorus mouse={mouse} />
      <DraggableOctahedron mouse={mouse} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
});

// ----- Main Projects Component -----
export default function Projects() {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Convert client coordinates to normalized device coordinates
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMouse({ x, y });
  };

  return (
    <section
      className="projects-section"
      id="projects"
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: theme.sectionBg, position: 'relative', overflow: 'hidden' }}
    >
      {/* 3D interactive background layer behind the cards */}
      <AbstractBackground mouse={mouse} />
      
      {/* Foreground content */}
      <div className="projects-content">
        <FadeInSection>
          <h2 style={{ color: theme.textPrimary }}>{projectsSectionName}</h2>
        </FadeInSection>
        <div className="projects-grid">
          {projects.map((p, idx) => (
            <FadeInSection key={idx}>
              <ProjectCard {...p} />
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
