import React, { useState, useEffect, useRef } from 'react';
import './MagicCursor.css';
import { theme } from '../../../theme';
import { isMobile } from 'react-device-detect';

export default function MagicCursor({ children }) {
  // Refs
  const dotRef = useRef(null);
  const latestCursorPos = useRef({ x: -100, y: -100 });
  const dotPosRef = useRef({ x: -100, y: -100 });

  // Positions
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [dotPos, setDotPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });

  // 2) Track cursor position (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e) => {
        const x = e.clientX;
        const y = e.clientY;
        setCursorPos({ x, y });
        latestCursorPos.current = { x, y };
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // 3) Animation loop for inner dot and outer ring (desktop only)
  useEffect(() => {
    if (isMobile) return;
    let animationFrame;
    const updatePositions = () => {
      // Update inner dot quickly toward the latest cursor position
      setDotPos(prevDot => {
        const { x: targetX, y: targetY } = latestCursorPos.current;
        const dotFactor = 0.3;
        const newX = prevDot.x + (targetX - prevDot.x) * dotFactor;
        const newY = prevDot.y + (targetY - prevDot.y) * dotFactor;
        const newDot = { x: newX, y: newY };
        dotPosRef.current = newDot;
        return newDot;
      });

      // Update outer ring with a higher base factor and lower threshold
      setRingPos(prevRing => {
        const target = dotPosRef.current;
        const dx = target.x - prevRing.x;
        const dy = target.y - prevRing.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const baseFactor = 0.2;
        const threshold = 10;
        let ringFactor = baseFactor;
        if (distance > threshold) {
          ringFactor = baseFactor + (distance - threshold) * 0.03;
          ringFactor = Math.min(ringFactor, 0.5);
        }
        const newX = prevRing.x + dx * ringFactor;
        const newY = prevRing.y + dy * ringFactor;
        return { x: newX, y: newY };
      });

      animationFrame = requestAnimationFrame(updatePositions);
    };

    updatePositions();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Calculate dynamic ring scale
  const dx = dotPos.x - ringPos.x;
  const dy = dotPos.y - ringPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const ringScale = 1 + Math.min(distance / 100, 0.1);

  if (!isMobile) {
    return (
      <div className="magic-cursor-container">
        {/* Inner dot */}
        <div
          ref={dotRef}
          className="cursor-dot"
          style={{
            left: dotPos.x,
            top: dotPos.y,
            backgroundColor: theme.neonAccent,
          }}
        />
        {/* Outer ring */}
        <div
          className="cursor-ring"
          style={{
            left: ringPos.x,
            top: ringPos.y,
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            border: `1px solid ${theme.neonAccent}`,
          }}
        />
        <div className="cursor-content">{children}</div>
      </div>
    );
  }

  // Mobile fallback (no custom cursor)
  return (
    <div className="magic-cursor-container">
      <div className="cursor-content">{children}</div>
    </div>
  );
}
