import React, { useRef, useEffect, useState } from 'react';
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

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return "#" + RR + GG + BB;
}

// Draw each node
function drawScene(nodes, ctx, nodeRadius, isMobile) {
  nodes.forEach((node) => {
    ctx.save();

    // On mobile, skip alpha fade-in to reduce per-frame work:
    // (Use node.alpha = 1 directly)
    ctx.globalAlpha = isMobile ? 1 : node.alpha;

    if (!isMobile) {
      // --- DESKTOP DRAW (original effects) ---
      // Draw trail
      ctx.beginPath();
      ctx.lineWidth = 2; 
      ctx.strokeStyle = 'rgba(255, 0, 181, 0.15)';
      node.trail.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Pulsing halo
      const pulseSize = 4 + Math.abs(Math.sin(node.pulseOffset)) * 6;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 8 + pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 181, ${0.2 - Math.abs(Math.sin(node.pulseOffset)) * 0.08})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      node.pulseOffset += 0.02;

      // Main circle with gradient
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, nodeRadius
      );
      const baseColor = node.color || '#ff00b5';
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, shadeColor(baseColor, -15));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer glow
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 0, 181, 0.12)';
      ctx.stroke();

      // Outline
      ctx.lineWidth = 2;
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-outline-color')
        .trim();
      ctx.stroke();

      // Satellite
      const satRadius = 6;
      const satX = node.x + node.satelliteRadius * Math.cos(node.satelliteAngle);
      const satY = node.y + node.satelliteRadius * Math.sin(node.satelliteAngle);

      // Satellite glow
      ctx.beginPath();
      ctx.arc(satX, satY, satRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      // Satellite body
      ctx.beginPath();
      ctx.arc(satX, satY, satRadius, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-button-primary-bg')
        .trim();
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
      node.satelliteAngle += 0.02; 
    } else {
      // --- MOBILE DRAW (simplified) ---
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.color || '#ff00b5';
      ctx.fill();

      // Light outline
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.stroke();
    }

    // Node label
    ctx.save();
    ctx.translate(Math.round(node.x), Math.round(node.y));

    // On mobile, skip the shadow fill (draw once only)
    if (!isMobile) {
      // Shadow pass
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = `bold ${20}px "Segoe UI", system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, 1, 1);
    }

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-text-primary')
      .trim();
    ctx.font = `bold ${isMobile ? 18 : 20}px "Segoe UI", system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, 0, 0);

    ctx.restore();
    ctx.restore(); // restore alpha
  });
}

export default function ProgrammingLanguages() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 600px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clamp device pixel ratio on mobile to reduce huge offscreen buffers
    const rawDPR = window.devicePixelRatio || 1;
    const maxDPRForMobile = isMobile ? 1.5 : rawDPR; // 1 or 1.5 to save CPU/GPU
    const dpr = Math.min(rawDPR, maxDPRForMobile);

    canvas.style.touchAction = "auto"; // allow scrolling on mobile
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Interaction state
    const pointer = { x: 0, y: 0, active: false };
    let draggedNodeIndex = null;
    let dragOffset = { x: 0, y: 0 };

    function safePreventDefault(e) {
      if (e.cancelable) e.preventDefault();
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const xDevice = (e.clientX - rect.left) * (canvas.width / rect.width);
      const yDevice = (e.clientY - rect.top) * (canvas.height / rect.height);
      return {
        x: xDevice / dpr,
        y: yDevice / dpr,
      };
    }

    function handlePointerDown(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;

      if (isMobile) {
        // On mobile, bigger grab radius
        const grabRadius = 80;
        const nodeIndex = findClosestNode(x, y, grabRadius);
        if (nodeIndex !== null) {
          const node = nodes[nodeIndex];
          node.vx = 0;
          node.vy = 0;
          node.trail = [];
          dragOffset.x = x - node.x;
          dragOffset.y = y - node.y;
          draggedNodeIndex = nodeIndex;
          dragNode(draggedNodeIndex);
        }
      }
    }

    function handlePointerMove(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }

    function handlePointerUp() {
      pointer.active = false;
      draggedNodeIndex = null;
    }

    // Mouse
    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getCanvasCoords(e);
      handlePointerDown(x, y);
    });
    canvas.addEventListener('mousemove', (e) => {
      const { x, y } = getCanvasCoords(e);
      handlePointerMove(x, y);
    });
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handlePointerUp);

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { x, y } = getCanvasCoords(touch);
        if (findClosestNode(x, y, 85) !== null) {
          safePreventDefault(e);
        }
        handlePointerDown(x, y);
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (draggedNodeIndex !== null) safePreventDefault(e);
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { x, y } = getCanvasCoords(touch);
        handlePointerMove(x, y);
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

    function resizeCanvas() {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        if (isMobile) {
          // Force a taller canvas for mobile if needed
          const neededRows = Math.ceil(languages.length / 2);
          const estimatedHeight = Math.max(rect.height, neededRows * 220 + 200);
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

    const spacing = isMobile ? 220 : 150;
    const nodeRadius = isMobile ? 35 : 50;
    const safePadding = isMobile ? nodeRadius * 2.5 : nodeRadius * 2;

    let nodes;

    function createNode(lang, homeX, homeY) {
      const offsetRange = 150;
      return {
        name: lang.name,
        color: lang.color,
        homeX,
        homeY,
        x: homeX + (Math.random() * offsetRange - offsetRange / 2),
        y: homeY + (Math.random() * offsetRange - offsetRange / 2),
        vx: 0,
        vy: 0,
        alpha: 0, // (desktop fade-in)
        pulseOffset: Math.random() * Math.PI * 2,
        satelliteAngle: Math.random() * Math.PI * 2,
        satelliteRadius: 25 + Math.random() * 8,
        trail: [],
      };
    }

    // Generate positions
    if (!isMobile) {
      // DESKTOP grid
      const maxItemsPerRow = Math.floor((canvasWidth - safePadding * 2) / spacing);
      const itemsPerRow = Math.min(maxItemsPerRow, 6);
      const numRows = Math.ceil(nodeCount / itemsPerRow);
      const totalGridHeight = (numRows - 1) * spacing;
      const startY = (canvasHeight - totalGridHeight) / 2;

      nodes = languages.map((lang, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const itemsInThisRow = (row === numRows - 1)
          ? (nodeCount - row * itemsPerRow)
          : itemsPerRow;
        const rowWidth = (itemsInThisRow - 1) * spacing;
        const rowStartX = (canvasWidth - rowWidth) / 2;
        const x = Math.max(safePadding, Math.min(canvasWidth - safePadding, rowStartX + col * spacing));
        const y = startY + row * spacing;
        return createNode(lang, x, y);
      });
    } else {
      // MOBILE layout - up to 2 columns
      const maxCols = 2;
      const itemsPerCol = Math.ceil(nodeCount / maxCols);
      const numCols = Math.min(maxCols, Math.ceil(nodeCount / itemsPerCol));
      const totalGridWidth = (numCols - 1) * spacing;
      const startX = (canvasWidth - totalGridWidth) / 2;

      nodes = languages.map((lang, i) => {
        const col = Math.floor(i / itemsPerCol);
        const row = i % itemsPerCol;
        const itemsInThisCol = (col === numCols - 1)
          ? (nodeCount - col * itemsPerCol)
          : itemsPerCol;
        const colHeight = (itemsInThisCol - 1) * spacing;
        const colStartY = (canvasHeight - colHeight) / 2;
        const x = Math.max(safePadding, Math.min(canvasWidth - safePadding, startX + col * spacing));
        const y = Math.max(safePadding, Math.min(canvasHeight - safePadding, colStartY + row * spacing));
        return createNode(lang, x, y);
      });
    }

    // Desktop physics
    const attractionStrength = 0.1;
    const damping = 0.86;
    const velocityThreshold = 0.05;

    // Node-to-node repulsion (desktop only)
    const nodeRepulsionStrength = 0.04;
    const nodeRepulsionRadius = spacing * 0.7;

    // Pointer repulsion (desktop only)
    const pointerRepulsionStrength = 0.28;
    const pointerRepulsionRadius = 180;

    function skipRepulsionAndPointerForces(node) {
      // Just snap them gently back home
      const fx = (node.homeX - node.x) * 0.1;
      const fy = (node.homeY - node.y) * 0.1;
      node.vx = (node.vx + fx) * 0.8;
      node.vy = (node.vy + fy) * 0.8;
      if (Math.abs(node.vx) < velocityThreshold) node.vx = 0;
      if (Math.abs(node.vy) < velocityThreshold) node.vy = 0;
      node.x += node.vx;
      node.y += node.vy;
    }

    function findClosestNode(x, y, grabRadius) {
      let closestIndex = null;
      let closestDistSq = Number.MAX_VALUE;
      nodes.forEach((node, i) => {
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
      const node = nodes[nodeIndex];
      node.x = pointer.x - dragOffset.x;
      node.y = pointer.y - dragOffset.y;
      node.vx = 0;
      node.vy = 0;
    }

    let animationFrameId;

    // Separate FPS for mobile vs. desktop
    const desiredFPS = isMobile ? 15 : 30;
    const frameInterval = 1000 / desiredFPS;
    let lastTime = 0;

    // Optional: track if nodes are "stable" so we can stop animating 
    // when everything is at rest on mobile (big battery saver).
    let wasStable = false;

    function animate(timestamp) {
      const elapsed = timestamp - lastTime;
      if (elapsed > frameInterval) {
        lastTime = timestamp - (elapsed % frameInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isMobile && draggedNodeIndex !== null && pointer.active) {
          dragNode(draggedNodeIndex);
        }

        let allStable = true;

        nodes.forEach((node, i) => {
          if (isMobile && i === draggedNodeIndex) {
            // Skip physics if dragging
            return;
          }
          if (isMobile) {
            skipRepulsionAndPointerForces(node);
          } else {
            // DESKTOP => original approach
            let fx = 0, fy = 0;
            // Attract to home
            fx += (node.homeX - node.x) * attractionStrength;
            fy += (node.homeY - node.y) * attractionStrength;

            // Node repulsion (desktop only)
            nodes.forEach((otherNode, j) => {
              if (i !== j) {
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
            });

            // Pointer repulsion (desktop only)
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
              }
            }

            // Random jitter
            fx += (Math.random() - 0.5) * 0.02;
            fy += (Math.random() - 0.5) * 0.02;

            // Apply damping
            node.vx = (node.vx + fx) * damping;
            node.vy = (node.vy + fy) * damping;
            if (Math.abs(node.vx) < velocityThreshold) node.vx = 0;
            if (Math.abs(node.vy) < velocityThreshold) node.vy = 0;

            node.x += node.vx;
            node.y += node.vy;

            // Keep in bounds
            node.x = Math.max(safePadding, Math.min(canvasWidth - safePadding, node.x));
            node.y = Math.max(safePadding, Math.min(canvasHeight - safePadding, node.y));
          }

          // Check if stable
          if (Math.abs(node.vx) > 0.01 || Math.abs(node.vy) > 0.01) {
            allStable = false;
          }
        });

        // Update fade-in alpha and small trail
        nodes.forEach((node) => {
          if (!isMobile) {
            // Desktop => increment alpha
            node.alpha = Math.min(1, node.alpha + 0.03);
          } else {
            // Mobile => skip alpha fade, set to 1
            node.alpha = 1;
          }

          // Keep only 1 or 2 points in the trail on mobile
          const maxTrail = isMobile ? 1 : 10;
          node.trail.push({ x: node.x, y: node.y });
          if (node.trail.length > maxTrail) node.trail.shift();
        });

        // Draw everything
        drawScene(nodes, ctx, nodeRadius, isMobile);

        // If on mobile everything is stable, we can stop animating:
        if (isMobile && allStable && !wasStable) {
          wasStable = true;
          // Wait one more frame to confirm we’re fully stable
          cancelAnimationFrame(animationFrameId);
          // Re-run one more time to finalize
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        // If it was stable and something changed (e.g. pointer down),
        // we can reset and keep animating.
        if (isMobile && !allStable) {
          wasStable = false;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('mouseleave', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
      canvas.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isMobile]);

  return (
    <FadeInSection>
      <div className="canvas-container" id="lang">
        <canvas ref={canvasRef} className="complex-canvas" />
      </div>
    </FadeInSection>
  );
}
