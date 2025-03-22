import React, { useRef, useEffect, useState } from 'react';
import FadeInSection from '../fadeIn/FadeInSection';
import { languages } from '../../texts/programmingLanguages';
import './ProgrammingLanguages.css';

// Create a color with opacity
function withOpacity(color, opacity) {
  return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;
}

export default function ProgrammingLanguages() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const animationFrameIdRef = useRef(null);

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

    // Explicitly set touch-action to allow normal scrolling
    canvas.style.touchAction = "auto";
    
    // Optimize for mobile: limit devicePixelRatio to 1.5
    const maxDPR = isMobile ? 1.5 : (window.devicePixelRatio || 1);
    const dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    function resizeCanvas() {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        // Mobile needs more vertical space for the nodes
        const height = isMobile 
          ? Math.max(rect.height, Math.ceil(languages.length / 2) * 160 + 100)
          : rect.height;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    
    // Mobile optimization: use smaller node size
    const nodeRadius = isMobile ? 35 : 50;
    const safePadding = nodeRadius * 2;
    const nodeSpacing = isMobile ? 160 : 150;

    // Create nodes with mobile-optimized positions
    function createNodes() {
      const nodes = [];
      const nodeCount = languages.length;
      
      if (isMobile) {
        // Mobile: 2-column layout
        const cols = 2;
        const itemsPerCol = Math.ceil(nodeCount / cols);
        const spacingX = nodeSpacing * 1.5;
        const spacingY = nodeSpacing;
        
        languages.forEach((lang, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          const x = canvasWidth / 2 + (col === 0 ? -spacingX/2 : spacingX/2);
          const y = safePadding + row * spacingY;
          
          // Create node with orbit pattern instead of physics
          nodes.push({
            name: lang.name,
            color: lang.color || '#ff00b5',
            x,
            y,
            baseX: x,
            baseY: y,
            orbitRadius: 5 + Math.random() * 5,
            orbitSpeed: 0.025 + Math.random() * 0.025,
            orbitAngle: Math.random() * Math.PI * 2,
            glowPhase: Math.random() * Math.PI * 2,
            glowSpeed: 0.03 + Math.random() * 0.02,
            // Each node follows a different pattern
            patternType: i % 3
          });
        });
      } else {
        // Desktop: grid layout
        const maxItemsPerRow = Math.floor((canvasWidth - safePadding * 2) / nodeSpacing);
        const itemsPerRow = Math.min(maxItemsPerRow, 6);
        const numRows = Math.ceil(nodeCount / itemsPerRow);
        const totalGridHeight = (numRows - 1) * nodeSpacing;
        const startY = (canvasHeight - totalGridHeight) / 2;
        
        languages.forEach((lang, i) => {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const itemsInThisRow = (row === numRows - 1)
            ? (nodeCount - row * itemsPerRow)
            : itemsPerRow;
          const rowWidth = (itemsInThisRow - 1) * nodeSpacing;
          const rowStartX = (canvasWidth - rowWidth) / 2;
          const x = Math.max(safePadding, Math.min(canvasWidth - safePadding, rowStartX + col * nodeSpacing));
          const y = startY + row * nodeSpacing;
          
          nodes.push({
            name: lang.name,
            color: lang.color || '#ff00b5',
            x,
            y,
            baseX: x,
            baseY: y,
            orbitRadius: 8 + Math.random() * 10,
            orbitSpeed: 0.02 + Math.random() * 0.02,
            orbitAngle: Math.random() * Math.PI * 2,
            glowPhase: Math.random() * Math.PI * 2,
            glowSpeed: 0.02 + Math.random() * 0.01,
            patternType: i % 4
          });
        });
      }
      
      return nodes;
    }
    
    const nodes = createNodes();
    
    // Mobile-optimized drawing function
    function drawMobileNodes(ctx, nodes, timestamp) {
      // Get theme colors from CSS
      const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-text-primary')
        .trim();
      
      // Pre-cache often used values
      const time = timestamp / 1000;
      
      nodes.forEach(node => {
        ctx.save();
        
        // Update node position based on pattern type
        switch(node.patternType) {
          case 0: // Simple circular orbit
            node.x = node.baseX + Math.cos(node.orbitAngle) * node.orbitRadius;
            node.y = node.baseY + Math.sin(node.orbitAngle) * node.orbitRadius;
            node.orbitAngle += node.orbitSpeed;
            break;
          case 1: // Figure-8 pattern
            const scale = node.orbitRadius * 1.2;
            node.x = node.baseX + Math.sin(node.orbitAngle) * scale;
            node.y = node.baseY + Math.sin(node.orbitAngle * 2) * (scale / 2);
            node.orbitAngle += node.orbitSpeed * 0.7;
            break;
          case 2: // Pulsing in place with slight drift
            const drift = node.orbitRadius * 0.3;
            node.x = node.baseX + Math.cos(time * 0.3) * drift;
            node.y = node.baseY + Math.sin(time * 0.2) * drift;
            break;
          default: // Lissajous pattern (complex looking but cheap to compute)
            const a = 3, b = 2; // Lissajous figure parameters
            node.x = node.baseX + Math.sin(a * node.orbitAngle) * node.orbitRadius;
            node.y = node.baseY + Math.sin(b * node.orbitAngle) * node.orbitRadius;
            node.orbitAngle += node.orbitSpeed * 0.5;
        }
        
        // Glow effect
        const glowIntensity = 0.3 + 0.2 * Math.sin(node.glowPhase);
        node.glowPhase += node.glowSpeed;
        
        // Draw a simplified node with better performance
        
        // Outer glow (single circle instead of gradient)
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = withOpacity(node.color, 0.2 * glowIntensity);
        ctx.fill();
        
        // Main circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Simple outline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
        
        // Mini orbit (replaces satellite with less computation)
        if (node.patternType !== 2) { // Skip for certain patterns
          const miniOrbitSize = 5;
          const miniX = node.x + Math.cos(node.orbitAngle * 3) * (nodeRadius - 10);
          const miniY = node.y + Math.sin(node.orbitAngle * 3) * (nodeRadius - 10);
          
          ctx.beginPath();
          ctx.arc(miniX, miniY, miniOrbitSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        }
        
        // Node label - single pass (no shadow)
        ctx.fillStyle = textColor;
        ctx.font = `bold ${isMobile ? 16 : 18}px "Segoe UI", system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, node.x, node.y);
        
        ctx.restore();
      });
    }
    
    // Lower and adaptive frame rate for better performance
    let lastFrameTime = 0;
    const targetFrameRate = isMobile ? 24 : 30; // Lower for mobile
    const frameInterval = 1000 / targetFrameRate;
    
    function animate(timestamp) {
      const elapsed = timestamp - lastFrameTime;
      
      // Only draw a new frame if enough time has passed
      if (elapsed >= frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMobileNodes(ctx, nodes, timestamp);
      }
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }
    
    // Store in ref so cleanup works properly
    animationFrameIdRef.current = requestAnimationFrame(animate);
    
    // Check if canvas is visible for performance optimization
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Start animation when visible
          if (!animationFrameIdRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(animate);
          }
        } else {
          // Stop animation when not visible
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(canvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      observer.disconnect();
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