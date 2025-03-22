import React, { useRef, useEffect, useState, useCallback } from 'react';
import FadeInSection from '../fadeIn/FadeInSection';
import { languages } from '../../texts/programmingLanguages';
import './ProgrammingLanguages.css';

// Helper function to adjust color brightness
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + percent));
  G = Math.max(0, Math.min(255, G + percent));
  B = Math.max(0, Math.min(255, B + percent));

  const RR = (R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16));
  const GG = (G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16));
  const BB = (B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
}

// Draw each node with a futuristic effect - optimized version
function drawScene(nodes, ctx, nodeRadius, isMobile, textColor, buttonColor, outlineColor) {
  nodes.forEach((node) => {
    // Begin drawing under alpha for fade-in
    ctx.save();
    ctx.globalAlpha = node.alpha; // apply fade-in

    // On mobile, only draw trail for actively moving nodes to save performance
    if (!isMobile || (isMobile && node.isMoving)) {
      // Draw trail with improved opacity - simplified for mobile
      if (node.trail.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = isMobile ? 2 : 2; 
        ctx.strokeStyle = 'rgba(255, 0, 181, 0.15)';
        node.trail.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    }

    // Enhanced pulsing halo - simplified for mobile
    if (!isMobile || !node.isStatic) {
      const pulseSize = 4 + Math.abs(Math.sin(node.pulseOffset)) * 6;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 8 + pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 181, ${0.2 - Math.abs(Math.sin(node.pulseOffset)) * 0.08})`;
      ctx.lineWidth = isMobile ? 3 : 3;
      ctx.stroke();
    }
    
    // Update pulse for animation
    node.pulseOffset += 0.02;

    // Main circle with gradient
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    
    // Use simpler fill for mobile to improve performance
    if (isMobile) {
      ctx.fillStyle = node.color || '#ff00b5';
    } else {
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, nodeRadius
      );
      const baseColor = node.color || '#ff00b5';
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, shadeColor(baseColor, -15));
      ctx.fillStyle = gradient;
    }
    ctx.fill();

    // Outer glow - simplified for mobile
    if (!isMobile) {
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 0, 181, 0.12)';
      ctx.stroke();
    }

    // Main stroke
    ctx.lineWidth = isMobile ? 2 : 2;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();

    // Only draw satellite on desktop or for non-static nodes on mobile
    if (!isMobile || !node.isStatic) {
      // Satellite
      const satRadius = isMobile ? 6 : 6;
      const effectiveSatelliteRadius = isMobile 
        ? Math.min(node.satelliteRadius, nodeRadius * 0.8) 
        : node.satelliteRadius;
      const satX = node.x + effectiveSatelliteRadius * Math.cos(node.satelliteAngle);
      const satY = node.y + effectiveSatelliteRadius * Math.sin(node.satelliteAngle);

      // Satellite body - simplified for mobile
      ctx.beginPath();
      ctx.arc(satX, satY, satRadius, 0, Math.PI * 2);
      ctx.fillStyle = buttonColor;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
      
      // Only update satellite angle if node is not static (for performance)
      if (!node.isStatic) {
        node.satelliteAngle += 0.02;
      }
    }

    // Label with a light shadow
    ctx.save();
    ctx.translate(Math.round(node.x), Math.round(node.y));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = `bold ${isMobile ? 20 : 20}px "Segoe UI", system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, 1, 1);  // shadow offset

    // Actual label
    ctx.fillStyle = textColor;
    ctx.fillText(node.name, 0, 0);
    ctx.restore();

    // restore alpha
    ctx.restore();
  });
}

export default function ProgrammingLanguages() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const animationRef = useRef(null);
  const nodesRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  
  // Cache for common properties to avoid repeated DOM queries
  const cacheRef = useRef({
    textColor: '',
    buttonColor: '',
    outlineColor: ''
  });

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoized function for creating a node to avoid recreating functions in loops
  const createNode = useCallback((lang, homeX, homeY, isMobile) => {
    // Tweak offsetRange for how "far" from home they start
    const offsetRange = 150;
    return {
      name: lang.name,
      color: lang.color,
      homeX,
      homeY,
      // Start near home for a smoother gather
      x: homeX + (Math.random() * offsetRange - offsetRange / 2),
      y: homeY + (Math.random() * offsetRange - offsetRange / 2),
      vx: 0,
      vy: 0,
      alpha: 0, // used for fade-in
      pulseOffset: Math.random() * Math.PI * 2,
      satelliteAngle: Math.random() * Math.PI * 2,
      satelliteRadius: isMobile ? 28 + Math.random() * 6 : 25 + Math.random() * 8,
      trail: [],
      isMoving: false,  // Track if node is significantly moving
      isStatic: false,  // Becomes true when node is mostly stationary
      framesSinceLastMove: 0 // Count frames since last significant movement
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use a reduced DPR for mobile to save on rendering performance
    const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : (window.devicePixelRatio || 1);
    canvas.style.touchAction = "auto"; // allow scrolling on mobile
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cache theme colors to avoid repeated DOM queries
    cacheRef.current = {
      textColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-text-primary').trim(),
      buttonColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-button-primary-bg').trim(),
      outlineColor: getComputedStyle(document.documentElement).getPropertyValue('--theme-outline-color').trim()
    };

    // Interaction state
    const pointer = { x: 0, y: 0, active: false };
    let draggedNodeIndex = null;
    let dragOffset = { x: 0, y: 0 };

    // Only call preventDefault if the event is cancelable
    function safePreventDefault(e) {
      if (e.cancelable) e.preventDefault();
    }

    // Translate event to canvas coords
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const xDevice = (e.clientX - rect.left) * (canvas.width / rect.width);
      const yDevice = (e.clientY - rect.top) * (canvas.height / rect.height);
      return {
        x: xDevice / dpr,
        y: yDevice / dpr,
      };
    }

    function handlePointerDown(e) {
      const { x, y } = getCanvasCoords(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;

      if (isMobile) {
        // Larger grab radius on mobile
        const grabRadius = 70;
        const nodeIndex = findClosestNode(x, y, grabRadius);
        if (nodeIndex !== null) {
          const node = nodesRef.current[nodeIndex];
          node.vx = 0;
          node.vy = 0;
          node.trail = [];
          node.isMoving = true;
          node.isStatic = false;
          dragOffset.x = x - node.x;
          dragOffset.y = y - node.y;
          draggedNodeIndex = nodeIndex;
          dragNode(draggedNodeIndex);
        }
      }
    }

    function handlePointerMove(e) {
      const { x, y } = getCanvasCoords(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }

    function handlePointerUp() {
      pointer.active = false;
      draggedNodeIndex = null;
    }

    // Mouse events with passive where possible
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerUp);

    // Touch events with passive where possible
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const coords = getCanvasCoords(touch);
        if (findClosestNode(coords.x, coords.y, 70) !== null) {
          safePreventDefault(e);
        }
        handlePointerDown(touch);
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (draggedNodeIndex !== null) {
        safePreventDefault(e);
      }
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0]);
      }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      safePreventDefault(e);
      handlePointerUp();
    }, { passive: false });

    canvas.addEventListener('touchcancel', (e) => {
      safePreventDefault(e);
      handlePointerUp();
    }, { passive: false });

    // Resize canvas
    function resizeCanvas() {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();

        if (isMobile) {
          // Force a taller canvas to ensure all items can appear
          const neededRows = Math.ceil(languages.length / 2);
          // Increase or decrease 200 + 200 if you need more/less space
          const estimatedHeight = Math.max(rect.height, neededRows * 200 + 200);
          canvas.width = rect.width * dpr;
          canvas.height = estimatedHeight * dpr;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${estimatedHeight}px`;
        } else {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          canvas.style.width = `${rect.width}px`;
          canvas.style.height = `${rect.height}px`;
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    const nodeCount = languages.length;

    // Layout / sizing
    const spacing = isMobile ? 200 : 150; // Increased spacing on mobile
    const nodeRadius = isMobile ? 38 : 50; // Slightly smaller radius on mobile
    const safePadding = isMobile ? nodeRadius * 2 : nodeRadius * 2;

    // Create nodes in a grid, different strategies for mobile vs desktop
    if (!isMobile) {
      // DESKTOP layout
      const maxItemsPerRow = Math.floor((canvasWidth - safePadding * 2) / spacing);
      const itemsPerRow = Math.min(maxItemsPerRow, 6);
      const numRows = Math.ceil(nodeCount / itemsPerRow);
      const totalGridHeight = (numRows - 1) * spacing;
      const startY = (canvasHeight - totalGridHeight) / 2;

      nodesRef.current = languages.map((lang, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const itemsInThisRow = (row === numRows - 1)
          ? (nodeCount - row * itemsPerRow)
          : itemsPerRow;
        const rowWidth = (itemsInThisRow - 1) * spacing;
        const rowStartX = (canvasWidth - rowWidth) / 2;
        const x = Math.max(safePadding, Math.min(canvasWidth - safePadding, rowStartX + col * spacing));
        const y = startY + row * spacing;
        return createNode(lang, x, y, isMobile);
      });
    } else {
      // MOBILE layout - up to 2 columns, simpler
      const maxCols = 2;
      const itemsPerCol = Math.ceil(nodeCount / maxCols);
      const numCols = Math.min(maxCols, Math.ceil(nodeCount / itemsPerCol));
      const totalGridWidth = (numCols - 1) * spacing;
      const startX = (canvasWidth - totalGridWidth) / 2;

      nodesRef.current = languages.map((lang, i) => {
        const col = Math.floor(i / itemsPerCol);
        const row = i % itemsPerCol;
        const itemsInThisCol = (col === numCols - 1)
          ? (nodeCount - col * itemsPerCol)
          : itemsPerCol;
        const colHeight = (itemsInThisCol - 1) * spacing;
        const colStartY = (canvasHeight - colHeight) / 2;
        const x = Math.max(safePadding, Math.min(canvasWidth - safePadding, startX + col * spacing));
        const y = Math.max(safePadding, Math.min(canvasHeight - safePadding, colStartY + row * spacing));
        return createNode(lang, x, y, isMobile);
      });
    }

    function findClosestNode(x, y, grabRadius) {
      let closestIndex = null;
      let closestDistSq = Number.MAX_VALUE;
      nodesRef.current.forEach((node, i) => {
        const dx = node.x - x;
        const dy = node.y - y;
        const distSq = dx * dx + dy * dy;
        if (distSq < grabRadius * grabRadius && distSq < closestDistSq) {
          closestDistSq = distSq;
          closestIndex = i;
        }
      });
      return closestIndex;
    }

    function dragNode(nodeIndex) {
      if (nodeIndex == null) return;
      const node = nodesRef.current[nodeIndex];
      node.x = pointer.x - dragOffset.x;
      node.y = pointer.y - dragOffset.y;
      node.vx = 0;
      node.vy = 0;
      node.isMoving = true;
      node.isStatic = false;
      
      // Reset static counter when dragged
      node.framesSinceLastMove = 0;
    }

    // Physics config - simplified for mobile
    const attractionStrength = isMobile ? 0.08 : 0.1;
    const damping = isMobile ? 0.84 : 0.86;
    const velocityThreshold = isMobile ? 0.1 : 0.05;
    const trailMax = isMobile ? 5 : 10; // Shorter trails on mobile

    // Node-to-node repulsion - reduced for mobile
    const nodeRepulsionStrength = isMobile ? 0.06 : 0.04;
    const nodeRepulsionRadius = isMobile ? spacing * 0.7 : spacing * 0.7;

    // Pointer repulsion
    const pointerRepulsionStrength = isMobile ? 0.15 : 0.28;
    const pointerRepulsionRadius = isMobile ? 100 : 180;

    // For mobile optimization - static detection
    const STATIC_THRESHOLD = 0.05; // Speed below which a node is considered static
    const STATIC_FRAMES = isMobile ? 30 : 60; // Frames to wait before considering a node static
    const MOBILE_FRAME_SKIP = 2; // Only render every Nth frame on mobile
    
    function animate(timestamp) {
      // Skip frames on mobile for better performance
      frameCountRef.current++;
      
      if (isMobile && frameCountRef.current % MOBILE_FRAME_SKIP !== 0 && !pointer.active) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate delta time for smoother animation
      const deltaTime = timestamp - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = timestamp;
      
      // Fix for the background issue on desktop
      if (!isMobile) {
        // Create gradient background to match the theme
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / dpr);
        gradient.addColorStop(0, '#2e003e'); // bgGradientStart from theme
        gradient.addColorStop(1, '#120026'); // bgGradientEnd from theme
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      } else {
        // Use clearRect to maintain transparent background on mobile
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }

      // If dragging a node on mobile
      if (isMobile && draggedNodeIndex !== null && pointer.active) {
        dragNode(draggedNodeIndex);
      }

      // Update physics
      let anySignificantMovement = false;
      
      nodesRef.current.forEach((node, i) => {
        // If already determined static and no pointer activity, skip physics
        if (isMobile && node.isStatic && !pointer.active && 
            i !== draggedNodeIndex &&
            Math.abs(node.x - node.homeX) < 1 && 
            Math.abs(node.y - node.homeY) < 1) {
          return;
        }
        
        // If currently dragging, skip physics for that node
        if (i === draggedNodeIndex) return;

        let fx = 0, fy = 0;

        // Attract to home
        fx += (node.homeX - node.x) * attractionStrength;
        fy += (node.homeY - node.y) * attractionStrength;

        // Node repulsion - optimized for mobile
        if (!isMobile || !node.isStatic) {
          // On mobile, static nodes don't repel other nodes
          const repulsionSamples = isMobile ? 4 : nodesRef.current.length;
          for (let j = 0; j < repulsionSamples; j++) {
            // On mobile, only sample a few nearby nodes instead of all
            const sampleIndex = isMobile 
              ? Math.floor(Math.random() * nodesRef.current.length) 
              : j;
              
            if (i !== sampleIndex) {
              const otherNode = nodesRef.current[sampleIndex];
              const dx = node.x - otherNode.x;
              const dy = node.y - otherNode.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < nodeRepulsionRadius * nodeRepulsionRadius) {
                const dist = Math.sqrt(distSq) || 0.01;
                const repulsionForce = 
                  (1 - dist / nodeRepulsionRadius) * nodeRepulsionStrength * 100;
                fx += (dx / dist) * repulsionForce;
                fy += (dy / dist) * repulsionForce;
              }
            }
          }
        }

        // Pointer repulsion if active
        if (pointer.active) {
          const dxm = node.x - pointer.x;
          const dym = node.y - pointer.y;
          const distSq = dxm * dxm + dym * dym;
          if (distSq < pointerRepulsionRadius * pointerRepulsionRadius) {
            const dist = Math.sqrt(distSq) || 0.01;
            const strength =
              (1 - dist / pointerRepulsionRadius) * pointerRepulsionStrength * 80;
            fx += (dxm / dist) * strength;
            fy += (dym / dist) * strength;
            
            // Reset static status when affected by pointer
            if (node.isStatic && strength > 0.01) {
              node.isStatic = false;
              node.framesSinceLastMove = 0;
            }
          }
        }

        // Less random jitter on mobile
        if (!isMobile || !node.isStatic) {
          fx += (Math.random() - 0.5) * (isMobile ? 0.01 : 0.02);
          fy += (Math.random() - 0.5) * (isMobile ? 0.01 : 0.02);
        }

        // Apply damping
        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        
        // Stop very small movements
        if (Math.abs(node.vx) < velocityThreshold) node.vx = 0;
        if (Math.abs(node.vy) < velocityThreshold) node.vy = 0;

        const oldX = node.x;
        const oldY = node.y;
        
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes in bounds
        node.x = Math.max(safePadding, Math.min(canvasWidth - safePadding, node.x));
        node.y = Math.max(safePadding, Math.min(canvasHeight - safePadding, node.y));

        // Calculate if node is significantly moving
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        node.isMoving = speed > STATIC_THRESHOLD;
        
        if (node.isMoving) {
          node.framesSinceLastMove = 0;
          anySignificantMovement = true;
        } else {
          node.framesSinceLastMove++;
          
          // Mark as static after a period of minimal movement
          if (node.framesSinceLastMove > STATIC_FRAMES) {
            node.isStatic = true;
          }
        }
        
        // Selective trail updates (only for moving nodes)
        if ((!isMobile || node.isMoving) && 
            (Math.abs(node.x - oldX) > 0.1 || Math.abs(node.y - oldY) > 0.1)) {
          node.trail.push({ x: node.x, y: node.y });
          if (node.trail.length > trailMax) node.trail.shift();
        }
      });

      // Update alpha (fade-in) once for all nodes
      nodesRef.current.forEach((node) => {
        node.alpha = Math.min(1, node.alpha + 0.02); // fade in speed
      });

      // Draw everything with cached colors
      drawScene(
        nodesRef.current, 
        ctx, 
        nodeRadius, 
        isMobile, 
        cacheRef.current.textColor, 
        cacheRef.current.buttonColor, 
        cacheRef.current.outlineColor
      );

      animationRef.current = requestAnimationFrame(animate);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);

      // Remove event listeners to avoid leaks
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('mouseleave', handlePointerUp);
    };
  }, [isMobile, createNode]);

  return (
    <FadeInSection>
      <div className="canvas-container" id="lang">
        <canvas ref={canvasRef} className="complex-canvas" />
      </div>
    </FadeInSection>
  );
}