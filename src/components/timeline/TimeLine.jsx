import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// Clamp helper
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Minimal scroll progress function to sync with scrolldepth (unchanged)
function useManualScrollProgress(sectionId) {
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;

      const handleUserInteraction = () => {
        setHasInteracted(true);
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
        const scrolledPastSection = -rect.top;
        const usableHeight = Math.max(sectionHeight - viewportHeight, viewportHeight);
        const calculatedProgress = clamp(scrolledPastSection / usableHeight, 0, 1);

        setProgress(calculatedProgress);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [sectionId, hasInteracted]);

  // Return 0 until user has interacted
  return hasInteracted ? progress : 0;
}

// Simple “FallingSubtitle” for Desktop only. For mobile we’ll show static text.
function FallingSubtitle({
  text,
  scrollProgress,
  isMobile,
  index,
  width,
  fontSize
}) {
  // If mobile, just render static text, no fancy animation
  if (isMobile) {
    return (
      <Text
        position={[0, -0.4, 0.07]}
        fontSize={fontSize}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.85}
        textAlign="center"
      >
        {text}
      </Text>
    );
  }

  // DESKTOP: original “falling” logic
  const baseThreshold = 0.3;
  const staggerOffset = 0.07;
  const myThreshold = baseThreshold + index * staggerOffset;
  const initialY = -0.15;

  const [springs, api] = useSpring(() => ({
    position: [0, initialY, 0.07],
    rotation: [0, 0, 0],
    opacity: 1,
    config: { mass: 1, tension: 280, friction: 30 },
  }));

  React.useEffect(() => {
    if (scrollProgress <= 0) {
      api.start({
        position: [0, initialY, 0.07],
        rotation: [0, 0, 0],
        opacity: 1,
      });
      return;
    }

    const factor = clamp(scrollProgress, 0, 1);

    if (factor >= myThreshold) {
      const fallFactor = clamp((factor - myThreshold) / (1 - myThreshold), 0, 1);
      const fallDistance = Math.pow(fallFactor, 2) * 6;
      const wobble = Math.sin(fallFactor * 8) * 0.3;

      api.start({
        position: [wobble, initialY - fallDistance, 0.07],
        rotation: [fallFactor * 1.5, wobble * 2, fallFactor * wobble * 8],
        opacity: 1,
        config: {
          friction: Math.max(20 - fallFactor * 15, 5),
          tension: 180
        }
      });
    } else {
      api.start({
        position: [0, initialY, 0.07],
        rotation: [0, 0, 0],
        opacity: 1,
      });
    }
  }, [scrollProgress, initialY, api, myThreshold]);

  return (
    <a.group position={springs.position} rotation={springs.rotation} opacity={springs.opacity}>
      <Text
        fontSize={fontSize}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.85}
        textAlign="center"
      >
        {text}
      </Text>
    </a.group>
  );
}

// Desktop-only timeline milestone with pointer events.
// On mobile, we skip pointer events and scale changes entirely.
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

    // Uniform box dimensions
    const {
      width: boxWidth,
      height: boxHeight,
      titleFontSize,
      subtitleFontSize,
      maxTextWidth
    } = uniformBoxSize;

    // Scale factor
    const CARD_SCALE = isMobile ? 1 : 1.1;

    const [spring, api] = useSpring(() => ({
      position: originalPosition,
      rotation: [0, 0, 0],
      scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE],
      config: { mass: 1, tension: 300, friction: 20 }
    }));

    // If we’re on mobile, skip pointer events entirely (no drag, no hover, etc.)
    if (isMobile) {
      // Minimal scroll animation — or none at all
      React.useEffect(() => {
        const factor = clamp(scrollProgress, 0, 1);
        // Shift item upward slightly with scroll, but no rotation
        const newY = originalPosition[1] - factor * 3;
        api.start({
          position: [originalPosition[0], newY, originalPosition[2]],
          rotation: [0, 0, 0]
        });
      }, [scrollProgress, api, originalPosition]);

      return (
        <a.group ref={ref} position={spring.position} scale={spring.scale}>
          <RoundedBox args={[boxWidth, boxHeight, 0.05]} radius={0.18} smoothness={4}>
            <a.meshStandardMaterial color={darkPurple} emissive={darkPurple} emissiveIntensity={0.4} />
          </RoundedBox>
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
          {/* Static subtitle (FallingSubtitle is replaced by static) */}
          <Text
            position={[0, -0.4, 0.07]}
            fontSize={subtitleFontSize}
            color="#fff"
            anchorX="center"
            anchorY="middle"
            maxWidth={maxTextWidth * 0.85}
            textAlign="center"
          >
            {subtitle}
          </Text>
        </a.group>
      );
    }

    // DESKTOP: Original pointer logic below
    const endDrag = useCallback(() => {
      setIsDragging(false);
      api.start({
        position: originalPosition,
        scale: [CARD_SCALE, CARD_SCALE, CARD_SCALE],
        rotation: [0, 0, 0]
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

    // Scroll-based shift & rotation (desktop)
    useEffect(() => {
      if (isDragging) return;
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

        <Text
          position={[0, boxHeight / 2 - boxHeight * 0.25, 0.07]}
          fontSize={titleFontSize}
          color={theme.textPrimary}
          anchorX="center"
          anchorY="middle"
          maxWidth={maxTextWidth}
          textAlign="center"
        >
          {title}
        </Text>

        {/* Desktop: fancy falling subtitle */}
        <FallingSubtitle
          text={subtitle}
          scrollProgress={scrollProgress}
          isMobile={false}
          index={index}
          width={boxWidth}
          fontSize={subtitleFontSize}
        />
      </a.group>
    );
  }
);

// Desktop: interactive code text with pointer repulsion.
// Mobile: just place them statically, no repulsion logic.
function InteractiveCodeText({ children, position, isMobile }) {
  const { camera, mouse } = useThree();
  const originalPosition = useRef(new THREE.Vector3(...position));
  const threshold = 2;
  const repulsionFactor = 1.0;
  const textScale = isMobile ? 0.14 : 0.18;

  const [spring, api] = useSpring(() => ({
    pos: [position[0], position[1], position[2]],
    config: { mass: 1, tension: 200, friction: 30 },
  }));

  useFrame(() => {
    if (isMobile) return; // skip repulsion on mobile

    const pointer = new THREE.Vector2(mouse.x, mouse.y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const { origin, direction } = raycaster.ray;
    const toParticle = new THREE.Vector3().subVectors(originalPosition.current, origin);
    const projectionLength = toParticle.dot(direction);
    const closestPoint = new THREE.Vector3()
      .copy(direction)
      .multiplyScalar(projectionLength)
      .add(origin);

    const distance = originalPosition.current.distanceTo(closestPoint);
    let targetPos = originalPosition.current.clone();

    if (distance < threshold) {
      const repulsionStrength = (threshold - distance) * repulsionFactor;
      const repulsionDir = new THREE.Vector3()
        .subVectors(originalPosition.current, closestPoint)
        .normalize();
      targetPos.add(repulsionDir.multiplyScalar(repulsionStrength));
    }
    api.start({ pos: [targetPos.x, targetPos.y, targetPos.z] });
  });

  return (
    <a.group position={spring.pos}>
      <Text fontSize={textScale} color={darkPurple} anchorX="center" anchorY="middle">
        {children}
      </Text>
    </a.group>
  );
}

// Code particles
function CodeParticles({ isMobile }) {
  const symbols = ['{', '}', '<>', 'if', 'else', 'var', 'const', '=>', ';'];
  // Fewer particles on mobile
  const count = isMobile ? 20 : 120;

  const particlesData = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const spreadFactor = isMobile ? 0.5 : 0.7;
      return {
        symbol,
        x: (Math.random() - 0.5) * 20 * spreadFactor,
        y: (Math.random() - 0.5) * 30 * spreadFactor,
        z: (Math.random() - 0.5) * 20 * spreadFactor,
        id: Math.random().toString(36).substr(2, 9)
      };
    });
  }, [isMobile]);

  return (
    <group>
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

// Ambient particles that float up and down
function AmbientParticles({ isMobile }) {
  // Fewer on mobile
  const count = isMobile ? 20 : 80;
  const groupRef = useRef();

  const particleData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 40,
      speed: Math.random() * 0.001 + 0.0005,
      offset: Math.random() * Math.PI * 2,
      id: Math.random().toString(36).substr(2, 9)
    }));
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (i < particleData.length) {
        const { y, speed, offset } = particleData[i];
        child.position.y = y + Math.sin(state.clock.elapsedTime * speed + offset) * 0.5;
      }
    });
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

  // Uniform box size
  const uniformBoxSize = useMemo(() => {
    let maxTitleLength = 0;
    let maxSubtitleLength = 0;
    milestonesData.forEach((m) => {
      maxTitleLength = Math.max(maxTitleLength, m.title.length);
      maxSubtitleLength = Math.max(maxSubtitleLength, m.subtitle.length);
    });

    const charsPerLine = isMobile ? 18 : 30;
    const titleLines = Math.max(1, Math.ceil(maxTitleLength / charsPerLine));
    const subtitleLines = Math.max(1, Math.ceil(maxSubtitleLength / charsPerLine));
    const titleFontSize = isMobile ? 0.25 : 0.20;
    const subtitleFontSize = isMobile ? 0.18 : 0.15;

    // rough box width
    const maxViewportWidth = viewport.width * 0.6;
    let boxWidth = Math.min(
      maxViewportWidth,
      Math.max(
        Math.min(maxTitleLength, charsPerLine) * 0.5 * titleFontSize,
        Math.min(maxSubtitleLength, charsPerLine) * 0.5 * subtitleFontSize
      ) + 0.5
    );
    boxWidth = Math.max(boxWidth, isMobile ? 1.6 : 2.0);
    const totalLines = titleLines + subtitleLines + 1;
    const boxHeight = Math.max(
      isMobile ? 1.2 : 1.0,
      totalLines * (isMobile ? 0.3 : 0.25) + 0.3
    );

    return {
      width: boxWidth,
      height: boxHeight,
      maxTextWidth: boxWidth * 0.9,
      titleFontSize,
      subtitleFontSize
    };
  }, [milestonesData, isMobile, viewport.width]);

  // On desktop, connect line geometry among milestones
  useFrame(() => {
    if (isMobile) return; // skip the line on mobile
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
      {!isMobile && <AmbientParticles isMobile={isMobile} />}
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

      {/* Only draw the connecting line on desktop */}
      {!isMobile && (
        <line ref={lineRef}>
          <bufferGeometry />
          <lineBasicMaterial color={darkPurple} linewidth={2} />
        </line>
      )}

      {/* Code particles on desktop, fewer on mobile */}
      <CodeParticles isMobile={isMobile} />
    </>
  );
}

function UpdateCamera({ cameraZ, midpointY }) {
  const { camera } = useThree();
  const initialMountRef = useRef(true);

  useEffect(() => {
    if (initialMountRef.current) {
      camera.position.set(0, midpointY, cameraZ);
      camera.lookAt(0, midpointY, 0);
      camera.updateProjectionMatrix();
      initialMountRef.current = false;
    } else {
      // For subsequent renders, set position if needed
      camera.position.set(0, midpointY, cameraZ);
      camera.lookAt(0, midpointY, 0);
      camera.updateProjectionMatrix();
    }
  }, [cameraZ, midpointY, camera]);

  return null;
}

export default function Timeline() {
  const milestonesData = timelineData;
  const scrollProgress = useManualScrollProgress('timeline');

  // Camera position calculations
  const ys = milestonesData.map((m) => m.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const boxHalfHeight = isMobile ? 0.6 : 0.7;
  const minVis = minY - boxHalfHeight;
  const maxVis = maxY + boxHalfHeight;
  const verticalSpan = maxVis - minVis;
  const midpointY = (minVis + maxVis) / 2;
  const margin = isMobile ? 0.2 : 0.4;
  const fov = isMobile ? 65 : 50;
  const finalCameraZ =
    (verticalSpan / 2 + margin) / Math.tan((fov / 2) * (Math.PI / 180));
  const cameraZ = isMobile ? finalCameraZ + 3 : finalCameraZ + 2.5;

  // Calculate dynamic canvas height
  const halfFovRad = (fov * Math.PI) / 360;
  const sceneHeightIn3D = 2 * cameraZ * Math.tan(halfFovRad);
  const pxPerUnit = 120;
  const extraMarginPx = 300;
  let dynamicHeight = sceneHeightIn3D * pxPerUnit + extraMarginPx;
  dynamicHeight = Math.max(dynamicHeight, 600);

  const memoizedScrollProgress = useMemo(() => scrollProgress, [scrollProgress]);

  return (
    <section
      className="timeline-section"
      id="timeline"
      style={{
        minHeight: '250vh',
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
          position: 'relative',
        }}
      >
        <Canvas
          camera={{ fov }}
          style={{ touchAction: 'pan-y' }}
          // Only render on changes -> big perf gain
          frameloop="demand"
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
