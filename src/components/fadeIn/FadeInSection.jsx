// src/components/ScrollFadeSection.jsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FadeInSection({ children }) {
  const domRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  // Randomly choose an animation variant only once per mount
  const animationVariant = useMemo(() => {
    const variants = [
      { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }, // fade up
      { initial: { opacity: 0, x: -100 }, animate: { opacity: 1, x: 0 } }, // slide in from left
      { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } } // zoom in
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    if (domRef.current) observer.observe(domRef.current);
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        ref={domRef}
        initial={animationVariant.initial}
        animate={isVisible ? animationVariant.animate : animationVariant.initial}
        transition={{ duration: 0.6 }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
