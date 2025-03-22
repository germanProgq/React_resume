const handlePointerOut = () => {
  if (!isDragging) {
    setHovered(false);
    api.start({ scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE] });
  }
};import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, useCursor, RoundedBox } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import FadeInSection from '../fadeIn/FadeInSection';
import { timelineData, timelineSectionName } from '../../texts/timeline';
import { theme } from '../../theme';
import './TimeLine.css';
import { isMobile } from 'react-device-detect';

const hoverColor = theme.buttonPrimaryHoverBg;
const darkPurple = '#6A0DAD';

function clamp(value, min, max) {
return Math.max(min, Math.min(value, max));
}

// Simple function to check if animations should run
function useManualScrollProgress(sectionId) {
const [progress, setProgress] = useState(0);
const [hasInteracted, setHasInteracted] = useState(false);
const initialRenderRef = useRef(true);

useEffect(() => {
if (initialRenderRef.current) {
  initialRenderRef.current = false;
  
  // Add event listeners only after initial render
  const handleUserInteraction = () => {
    setHasInteracted(true);
    // Remove the listeners once user has interacted
    window.removeEventListener('scroll', handleUserInteraction);
    window.removeEventListener('click', handleUserInteraction);
    window.removeEventListener('touchstart', handleUserInteraction);
  };
  
  window.addEventListener('scroll', handleUserInteraction, { passive: true });
  window.addEventListener('click', handleUserInteraction);
  window.addEventListener('touchstart', handleUserInteraction);
  
  const handleScroll = () => {
    if (!hasInteracted) return;
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionHeight = section.offsetHeight;
    
    // Calculate scroll progress (0 to 1)
    let calculatedProgress = 0;
    
    // Get how far we've scrolled into the section
    const scrolledPastSection = -rect.top;
    const usableHeight = Math.max(sectionHeight - viewportHeight, viewportHeight);
    calculatedProgress = clamp(scrolledPastSection / usableHeight, 0, 1);
    
    setProgress(calculatedProgress);
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial calculation
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('scroll', handleUserInteraction);
    window.removeEventListener('click', handleUserInteraction);
    window.removeEventListener('touchstart', handleUserInteraction);
  };
}
}, [sectionId, hasInteracted]);

// Return 0 until user has interacted with the page
return hasInteracted ? progress : 0;
}

// Measure text dimensions to create properly sized boxes
function useMeasureText(text, fontSize) {
const { size } = useThree();
const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

useEffect(() => {
// Create a temporary text object to measure
const tempText = new THREE.TextGeometry(text, {
  font: new THREE.Font(), // We don't need a real font for measuring
  size: fontSize,
  height: 0.01,
});

// Calculate bounding box
tempText.computeBoundingBox();
const box = tempText.boundingBox;

// Set dimensions with padding
setDimensions({
  width: (box.max.x - box.min.x) * 1.5, // Add 50% padding
  height: (box.max.y - box.min.y) * 2,  // Add 100% padding
});

// Clean up
tempText.dispose();
}, [text, fontSize, size]);

return dimensions;
}

// Create a separate component for the subtitle to better control its animations
const FallingSubtitle = ({ text, scrollProgress, isMobile, index, totalItems, width, fontSize }) => {
// Each subtitle falls at a different scroll position
const staggerOffset = 0.07; // Space between each item's trigger point
const baseThreshold = 0.3; // Start the first item falling at 30% scroll
const myThreshold = baseThreshold + (index * staggerOffset); 

// Starting position for subtitle (adjusted for smaller boxes)
const initialY = isMobile ? -0.25 : -0.15;
// Use provided fontSize from the parent component

// Limit text width to container width
const maxTextWidth = width * 0.85;

// Create a spring for the subtitle
const [springs, api] = useSpring(() => ({
position: [0, initialY, 0.07],
rotation: [0, 0, 0],
opacity: 1,
config: {
  mass: 1,
  tension: 280,
  friction: 30
}
}));

// Update subtitle position based on scroll
useEffect(() => {
// Safety check - never animate on initial load
if (scrollProgress <= 0) {
  api.start({
    position: [0, initialY, 0.07],
    rotation: [0, 0, 0],
    opacity: 1
  });
  return;
}

const factor = clamp(scrollProgress, 0, 1);

if (factor >= myThreshold) {
  // Calculate how far past threshold we are (normalized to 0-1)
  const fallFactor = (factor - myThreshold) / (1 - myThreshold);
  const clampedFallFactor = clamp(fallFactor, 0, 1);
  
  // Apply increasingly faster falling with physics-like acceleration
  const fallDistance = Math.pow(clampedFallFactor, 2) * 6;
  
  // Add some wobble for natural movement
  const wobble = Math.sin(clampedFallFactor * 8) * 0.3;
  
  // Apply animation with decreasing friction as it falls
  api.start({
    position: [wobble, initialY - fallDistance, 0.07],
    rotation: [clampedFallFactor * 1.5, wobble * 2, clampedFallFactor * wobble * 8],
    opacity: 1,
    config: {
      friction: Math.max(20 - clampedFallFactor * 15, 5),
      tension: 180
    }
  });
} else {
  // Reset to initial position when above threshold
  api.start({
    position: [0, initialY, 0.07],
    rotation: [0, 0, 0],
    opacity: 1
  });
}
}, [scrollProgress, initialY, api, myThreshold]);

return (
<a.group
  position={springs.position}
  rotation={springs.rotation}
  opacity={springs.opacity}
>
  <Text
    fontSize={fontSize}
    color="#fff"
    anchorX="center"
    anchorY="middle"
    maxWidth={maxTextWidth}
    textAlign="center"
  >
    {text}
  </Text>
</a.group>
);
};

// REMOVED THIS FUNCTION SINCE WE NOW USE UNIFORM SIZING
// Custom hook to calculate appropriate box size based on text content
// function useBoxSizing(title, subtitle, isMobile) {
//   ...
// }

const TimelineMilestone = React.forwardRef(
(
{ 
  title, 
  subtitle, 
  position: originalPosition, 
  isMobile, 
  scrollProgress, 
  index, 
  totalItems,
  uniformBoxSize
},
ref
) => {
const { camera, viewport } = useThree();
const [isDragging, setIsDragging] = useState(false);
const [hovered, setHovered] = useState(false);
useCursor(hovered);

const dragPlane = useRef(new THREE.Plane());
const dragOffset = useRef(new THREE.Vector3());

// Use uniform box dimensions instead of calculating per-box
const { 
  width: boxWidth, 
  height: boxHeight, 
  maxTextWidth,
  titleFontSize,
  subtitleFontSize
} = uniformBoxSize;

// Scale up cards on desktop but keep smaller than before
const CARD_SCALE = isMobile ? 1 : 1.1;

// Spring to handle position, rotation, scaling
const [spring, api] = useSpring(() => ({
  position: originalPosition,
  rotation: [0, 0, 0],
  scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE],
  config: { mass: 1, tension: 300, friction: 20 },
}));

// End drag callback
const endDrag = useCallback(() => {
  setIsDragging(false);
  api.start({
    position: originalPosition,
    scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE],
    rotation: [0, 0, 0],
  });
}, [api, originalPosition, CARD_SCALE]);

useEffect(() => {
  if (isDragging) {
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('touchend', endDrag);
    return () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('touchend', endDrag);
    };
  }
}, [isDragging, endDrag]);

const handlePointerDown = (e) => {
  e.stopPropagation();
  if (ref.current) {
    const currentPos = ref.current.position.clone();
    dragPlane.current.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()),
      currentPos
    );
    const intersection = new THREE.Vector3();
    if (e.ray.intersectPlane(dragPlane.current, intersection)) {
      dragOffset.current.copy(currentPos).sub(intersection);
    }
  }
  setIsDragging(true);
  setHovered(false);
  if (e.target.setPointerCapture) {
    e.target.setPointerCapture(e.pointerId);
  }
  api.start({
    scale: [CARD_SCALE * 1.1, CARD_SCALE * 1.1, CARD_SCALE * 1.1],
  });
};

const handlePointerMove = (e) => {
  if (isDragging) {
    const intersection = new THREE.Vector3();
    if (e.ray.intersectPlane(dragPlane.current, intersection)) {
      const newPos = intersection.clone().add(dragOffset.current);
      
      // Limit dragging within screen bounds
      const maxX = viewport.width / 2 - boxWidth / 2;
      const newX = clamp(newPos.x, -maxX, maxX);
      
      api.start({ position: [newX, newPos.y, newPos.z] });
    }
  }
};

const handlePointerUp = (e) => {
  if (e.target.releasePointerCapture) {
    e.target.releasePointerCapture(e.pointerId);
  }
  endDrag();
};

const handlePointerOver = () => {
  if (!isDragging) {
    setHovered(true);
    api.start({
      scale: [CARD_SCALE * 1.05, CARD_SCALE * 1.05, CARD_SCALE * 1.05],
    });
  }
};

const handlePointerOut = () => {
  if (!isDragging) {
    setHovered(false);
    api.start({ scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE] });
  }
};

// Shift milestone up as you scroll
useEffect(() => {
  if (isDragging) return;
  
  // Don't animate on initial load
  if (scrollProgress <= 0) {
    api.start({
      position: originalPosition,
      rotation: [0, 0, 0],
    });
    return;
  }
  
  const factor = clamp(scrollProgress, 0, 1);
  const newY = originalPosition[1] - factor * 5;
  const newRot = [factor * Math.PI * 0.5, 0, 0];
  
  api.start({
    position: [originalPosition[0], newY, originalPosition[2]],
    rotation: newRot,
  });
}, [scrollProgress, isDragging, api, originalPosition]);

// Determine subtitle position based on card size
const subtitleY = -boxHeight / 2 + 0.4;

return (
  <a.group
    ref={ref}
    position={spring.position}
    rotation={spring.rotation}
    scale={spring.scale}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onPointerOver={handlePointerOver}
    onPointerOut={handlePointerOut}
  >
    {/* RoundedBox with dynamic size based on content */}
    <RoundedBox
      args={[boxWidth, boxHeight, 0.05]}
      radius={0.18}
      smoothness={4}
      castShadow
      receiveShadow
    >
      <a.meshStandardMaterial
        color={darkPurple}
        emissive={hovered ? hoverColor : darkPurple}
        emissiveIntensity={hovered ? 1 : 0.5}
      />
    </RoundedBox>

    {/* Title text at the top of the box */}
    <Text
      position={[0, boxHeight / 2 - (boxHeight * 0.25), 0.07]}
      fontSize={titleFontSize}
      color={theme.textPrimary}
      anchorX="center"
      anchorY="middle"
      maxWidth={maxTextWidth}
      textAlign="center"
    >
      {title}
    </Text>

    {/* Use the separated subtitle component that falls out */}
    <FallingSubtitle 
      text={subtitle} 
      scrollProgress={scrollProgress} 
      isMobile={isMobile}
      index={index}
      totalItems={totalItems}
      width={boxWidth}
      fontSize={subtitleFontSize}
    />
  </a.group>
);
}
);

function InteractiveCodeText({ children, position, isMobile }) {
const { camera, mouse } = useThree();
const originalPosition = new THREE.Vector3(...position);
const threshold = 2;
const repulsionFactor = 1.0;
// Smaller text scale
const textScale = isMobile ? 0.14 : 0.18;

// Use ref to maintain consistent position reference
const posRef = useRef(originalPosition);

// Spring configuration with reduced tension and friction for better performance
const [spring, api] = useSpring(() => ({
pos: [originalPosition.x, originalPosition.y, originalPosition.z],
config: { mass: 1, tension: 200, friction: 30 },
}));

useFrame(() => {
if (!isMobile) {
  const pointer = new THREE.Vector2(mouse.x, mouse.y);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const { origin, direction } = raycaster.ray;
  const toParticle = new THREE.Vector3().subVectors(posRef.current, origin);
  const projectionLength = toParticle.dot(direction);
  const closestPoint = new THREE.Vector3()
    .copy(direction)
    .multiplyScalar(projectionLength)
    .add(origin);
  const distance = posRef.current.distanceTo(closestPoint);
  let targetPos = posRef.current.clone();
  if (distance < threshold) {
    const repulsionStrength = (threshold - distance) * repulsionFactor;
    const repulsionDir = new THREE.Vector3()
      .subVectors(posRef.current, closestPoint)
      .normalize();
    targetPos.add(repulsionDir.multiplyScalar(repulsionStrength));
  }
  api.start({ pos: [targetPos.x, targetPos.y, targetPos.z] });
}
});

return (
<a.group position={spring.pos}>
  <Text fontSize={textScale} color={darkPurple} anchorX="center" anchorY="middle">
    {children}
  </Text>
</a.group>
);
}

function CodeParticles({ isMobile }) {
const symbols = ['{', '}', '<>', 'if', 'else', 'var', 'const', '=>', ';'];
// Further reduce particles count for better performance
const count = isMobile ? 60 : 120;

// Use a ref to store particles data so they don't regenerate on renders
const particlesRef = useRef();

// Generate particles only once using useMemo
const particlesData = useMemo(() => {
return Array.from({ length: count }).map(() => {
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  // Reduce spread to keep particles from interfering with boxes
  const spreadFactor = isMobile ? 0.5 : 0.7;
  return {
    symbol,
    x: (Math.random() - 0.5) * 20 * spreadFactor,
    y: (Math.random() - 0.5) * 30 * spreadFactor,
    z: (Math.random() - 0.5) * 20 * spreadFactor,
    id: Math.random().toString(36).substr(2, 9) // Unique ID
  };
});
}, [isMobile]); // Re-generate only if mobile status changes

return (
<group ref={particlesRef}>
  {particlesData.map((particle) => (
    <InteractiveCodeText 
      key={particle.id} 
      position={[particle.x, particle.y, particle.z]} 
      isMobile={isMobile}
    >
      {particle.symbol}
    </InteractiveCodeText>
  ))}
</group>
);
}

function AmbientParticles() {
const groupRef = useRef();
const count = 80; // Reduced count

// Generate particles data only once
const particleData = useMemo(() => {
return Array.from({ length: count }).map(() => ({
  x: (Math.random() - 0.5) * 40,
  y: (Math.random() - 0.5) * 40,
  z: (Math.random() - 0.5) * 40,
  speed: Math.random() * 0.001 + 0.0005,
  offset: Math.random() * Math.PI * 2,
  id: Math.random().toString(36).substr(2, 9) // Unique ID
}));
}, []); // Empty dependency array - generate only once

useFrame((state) => {
if (groupRef.current) {
  groupRef.current.children.forEach((child, i) => {
    if (i < particleData.length) { // Safety check
      const { y, speed, offset } = particleData[i];
      child.position.y = y + Math.sin(state.clock.elapsedTime * speed + offset) * 0.5;
    }
  });
}
});

return (
<group ref={groupRef}>
  {particleData.map((p) => (
    <mesh key={p.id} position={[p.x, p.y, p.z]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={darkPurple} opacity={0.3} transparent />
    </mesh>
  ))}
</group>
);
}

function TimelineScene({ milestonesData, isMobile, scrollProgress }) {
const milestoneRefs = milestonesData.map(() => React.createRef());
const lineRef = useRef();
const { viewport } = useThree();

// Calculate uniform box size based on the largest content
const uniformBoxSize = useMemo(() => {
// Max width is 60% of viewport
const maxViewportWidth = viewport.width * 0.6;

// Find longest title and subtitle
let maxTitleLength = 0;
let maxSubtitleLength = 0;

milestonesData.forEach(milestone => {
  maxTitleLength = Math.max(maxTitleLength, milestone.title.length);
  maxSubtitleLength = Math.max(maxSubtitleLength, milestone.subtitle.length);
});

// Calculate dimensions based on max content
const charsPerLine = isMobile ? 18 : 30;
const titleLines = Math.max(1, Math.ceil(maxTitleLength / charsPerLine));
const subtitleLines = Math.max(1, Math.ceil(maxSubtitleLength / charsPerLine));

// Define font sizes - smaller than previous version
const titleFontSize = isMobile ? 0.25 : 0.20;
const subtitleFontSize = isMobile ? 0.18 : 0.15;

// Calculate box width based on max text length but with smaller sizes
let boxWidth = Math.min(maxViewportWidth, Math.max(
  Math.min(maxTitleLength, charsPerLine) * 0.5 * titleFontSize,
  Math.min(maxSubtitleLength, charsPerLine) * 0.5 * subtitleFontSize
) + 0.5); // Reduced padding

// Enforce smaller minimum width
boxWidth = Math.max(boxWidth, isMobile ? 1.6 : 2.0);

// Calculate height based on lines of text with smaller spacing
const totalLines = titleLines + subtitleLines + 1;
const boxHeight = Math.max(
  isMobile ? 1.2 : 1.0,  // Reduced minimum height
  totalLines * (isMobile ? 0.3 : 0.25) + 0.3  // Reduced line spacing
);

// Return uniform dimensions and font sizes
return {
  width: boxWidth,
  height: boxHeight,
  maxTextWidth: boxWidth * 0.9,
  titleFontSize,
  subtitleFontSize
};
}, [milestonesData, isMobile, viewport.width]);

// Connect the line geometry between all milestone positions
useFrame(() => {
if (!lineRef.current) return;
const positions = [];
milestoneRefs.forEach((ref) => {
  if (ref.current) {
    positions.push(
      ref.current.position.x,
      ref.current.position.y,
      ref.current.position.z
    );
  }
});
lineRef.current.geometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);
lineRef.current.geometry.attributes.position.needsUpdate = true;
});

return (
<>
  <ambientLight intensity={0.4} />
  <directionalLight intensity={1} position={[5, 5, 5]} castShadow />
  <AmbientParticles />
  {milestonesData.map((m, i) => (
    <TimelineMilestone
      key={i}
      title={m.title}
      subtitle={m.subtitle}
      position={[0, m.y, 0]}
      isMobile={isMobile}
      ref={milestoneRefs[i]}
      scrollProgress={scrollProgress}
      index={i}
      totalItems={milestonesData.length}
      uniformBoxSize={uniformBoxSize}
    />
  ))}
  <line ref={lineRef}>
    <bufferGeometry />
    <lineBasicMaterial color={darkPurple} linewidth={2} />
  </line>
  <CodeParticles isMobile={isMobile} />
</>
);
}

function UpdateCamera({ cameraZ, midpointY }) {
const { camera } = useThree();

// Use a ref to track if this is initial mounting
const initialMountRef = useRef(true);

useEffect(() => {
// Only set camera position on first render or if parameters change significantly
if (initialMountRef.current) {
  camera.position.set(0, midpointY, cameraZ);
  camera.lookAt(0, midpointY, 0);
  camera.updateProjectionMatrix();
  initialMountRef.current = false;
} else {
  // For subsequent renders, use a smoother transition
  const currentY = camera.position.y;
  const currentZ = camera.position.z;
  
  // Only update if there's a significant change
  if (Math.abs(currentY - midpointY) > 0.5 || Math.abs(currentZ - cameraZ) > 0.5) {
    camera.position.set(0, midpointY, cameraZ);
    camera.lookAt(0, midpointY, 0);
    camera.updateProjectionMatrix();
  }
}
}, [cameraZ, midpointY, camera]);

return null;
}

export default function Timeline() {
// CSS-compatible code - maintain the original structure and styles
const milestonesData = timelineData;
const scrollProgress = useManualScrollProgress('timeline');

// Calculate cameraZ to fit the entire timeline
const ys = milestonesData.map((m) => m.y);
const minY = Math.min(...ys);
const maxY = Math.max(...ys);
const boxHalfHeight = isMobile ? 0.6 : 0.7; // Smaller than before
const minVis = minY - boxHalfHeight;
const maxVis = maxY + boxHalfHeight;
const verticalSpan = maxVis - minVis;
const midpointY = (minVis + maxVis) / 2;
const margin = isMobile ? 0.2 : 0.4; // Larger margin for desktop

// Adjust field of view - wider on mobile, narrower on desktop for better depth
const fov = isMobile ? 65 : 50;

// Calculate camera distance - move further back on desktop for larger scene
const finalCameraZ =
(verticalSpan / 2 + margin) /
Math.tan(((fov / 2) * Math.PI) / 180);
const cameraZ = isMobile ? finalCameraZ + 3 : finalCameraZ + 2.5;

// Compute a dynamic height for the canvas container
const halfFovRad = (fov * Math.PI) / 360;
const sceneHeightIn3D = 2 * cameraZ * Math.tan(halfFovRad);
const pxPerUnit = 120;
const extraMarginPx = 300;
let dynamicHeight = sceneHeightIn3D * pxPerUnit + extraMarginPx;
dynamicHeight = Math.max(dynamicHeight, 600);

// For consistency during updates, memoize the calculation of scroll progress
const memoizedScrollProgress = useMemo(() => {
return scrollProgress;
}, [scrollProgress]);

return (
<section 
  className="timeline-section" 
  id="timeline"
  style={{
    minHeight: '250vh' // Adjusted scroll space
  }}
>
  <FadeInSection>
    <h2 style={{ color: '#4B0082', textAlign: 'center' }}>
      {timelineSectionName}
    </h2>
  </FadeInSection>
  <div 
    className="timeline-canvas-container" 
    style={{ 
      height: dynamicHeight,
      position: 'relative' // Ensure position context for children
    }}
  >
    <Canvas 
    camera={{ fov }} 
    style={{ touchAction: 'pan-y' }}
    frameloop="demand" // Only render when needed for better performance
  >
      <UpdateCamera cameraZ={cameraZ} midpointY={midpointY} />
      <TimelineScene
        milestonesData={milestonesData}
        isMobile={isMobile}
        scrollProgress={memoizedScrollProgress}
      />
    </Canvas>
  </div>
</section>
);
}