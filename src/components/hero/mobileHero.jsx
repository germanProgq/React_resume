import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { theme } from '../../theme';

const AutoFitText = ({
  children,
  targetWidth = 0.9,
  minFontSize = 10,
  maxFontSize = 200,
  style = {},
  ...props
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const resizeText = () => {
      if (containerRef.current && textRef.current) {
        const target = window.innerWidth * targetWidth;
        let currentFontSize = maxFontSize;
        textRef.current.style.fontSize = `${currentFontSize}px`;
        while (textRef.current.offsetWidth > target && currentFontSize > minFontSize) {
          currentFontSize -= 1;
          textRef.current.style.fontSize = `${currentFontSize}px`;
        }
        setFontSize(currentFontSize);
      }
    };

    resizeText();
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [children, targetWidth, minFontSize, maxFontSize]);

  return (
    <div ref={containerRef} style={{ width: '90vw', textAlign: 'center' }}>
      <span ref={textRef} style={{ fontSize, ...style }} {...props}>
        {children}
      </span>
    </div>
  );
};

const MobileHero = () => {
  const [isExploring, setIsExploring] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [removeComponent, setRemoveComponent] = useState(false);

  // Motion values for tilt
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  // Smoother tilt springs
  const springConfig = { damping: 30, stiffness: 300 };
  const springX = useSpring(tiltX, springConfig);
  const springY = useSpring(tiltY, springConfig);

  // Transform springs to rotation
  const rotateX = useTransform(springY, [-100, 100], [4, -4]);
  const rotateY = useTransform(springX, [-100, 100], [-4, 4]);

  // Parallax transforms for title and button
  const titleX = useTransform(springX, [-100, 100], [8, -8]);
  const titleY = useTransform(springY, [-100, 100], [4, -4]);
  const buttonX = useTransform(springX, [-100, 100], [4, -4]);
  const buttonY = useTransform(springY, [-100, 100], [8, -8]);

  // Card animation control
  const cardControls = useAnimation();

  // Refs for container and card
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [constraints, setConstraints] = useState(null);

  // Light rays configuration instead of particles
  const [lightRays, setLightRays] = useState([]);
  const generateLightRays = () => {
    const rays = [];
    for (let i = 0; i < 8; i++) {
      rays.push({
        id: i,
        originX: 50 + (Math.random() * 30 - 15),
        originY: 50 + (Math.random() * 30 - 15),
        angle: Math.random() * 360,
        length: Math.random() * 30 + 20,
        width: Math.random() * 5 + 3,
        color: Math.random() > 0.6 ? theme.neonAccent : theme.textPrimary,
        opacity: Math.random() * 0.5 + 0.1,
        animationDuration: Math.random() * 10 + 10
      });
    }
    setLightRays(rays);
  };

  // Generate ambient glow spots
  const [glowSpots, setGlowSpots] = useState([]);
  const generateGlowSpots = () => {
    const spots = [];
    for (let i = 0; i < 5; i++) {
      spots.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 20,
        color: i % 2 === 0 ? theme.neonAccent : theme.textPrimary,
        opacity: Math.random() * 0.3 + 0.1,
        animationDuration: Math.random() * 8 + 12
      });
    }
    setGlowSpots(spots);
  };

  useEffect(() => {
    generateLightRays();
    generateGlowSpots();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Measure container and card for drag constraints
  useEffect(() => {
    if (containerRef.current && cardRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      setConstraints({
        top: -containerRect.height / 2 + cardRect.height / 2,
        left: -containerRect.width / 2 + cardRect.width / 2,
        right: containerRect.width / 2 - cardRect.width / 2,
        bottom: containerRect.height / 2 - cardRect.height / 2
      });
    }
  }, []);

  // Device orientation for tilt effect
  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event) => {
        if (!isExploring) {
          const x = event.beta ?? 0;
          const y = event.gamma ?? 0;
          tiltX.set(Math.min(Math.max(y * 1.2, -8), 8));
          tiltY.set(Math.min(Math.max(x * 1.2, -8), 8));
        }
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [isExploring, tiltX, tiltY]);

  const handleExploreClick = () => {
    setIsExploring(true);
    setTimeout(() => {
      setShowWelcome(true);
      setTimeout(() => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
        setTimeout(() => {
          document.body.style.overflow = 'auto';
          setRemoveComponent(true);
        }, 1500);
      }, 2500);
    }, 1200);
  };

  const handleDragEnd = () => {
    if (!isExploring) {
      cardControls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 250, damping: 30 }
      });
    }
  };

  // Floating & glow animations
  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: [0.45, 0.05, 0.55, 0.95]
    }
  };
  
  const glowAnimation = {
    boxShadow: [
      `0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px ${theme.neonAccent}40`,
      `0 10px 30px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.neonAccent}70`,
      `0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px ${theme.neonAccent}40`
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: [0.45, 0.05, 0.55, 0.95]
    }
  };

  const buttonGlowAnimation = {
    boxShadow: [
      `0 0 15px ${theme.neonAccent}60`,
      `0 0 25px ${theme.neonAccent}90`,
      `0 0 15px ${theme.neonAccent}60`
    ],
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: [0.45, 0.05, 0.55, 0.95]
    }
  };

  // Card warp effect
  const cardVariants = {
    initial: {
      scale: 1,
      borderRadius: '20px',
      // Changed width & height to make the card bigger
      width: '90%',
      height: '60vh',
      opacity: 1
    },
    exploring: {
      scale: [1, 1.1, 0.9, 30],
      borderRadius: ['20px', '25px', '40px', '0px'],
      width: ['90%', '93%', '85%', '100%'],
      height: ['60vh', '63vh', '55vh', '100vh'],
      opacity: [1, 1, 1, 0],
      rotateZ: [0, 3, -2, 0],
      transition: {
        duration: 2.2,
        times: [0, 0.2, 0.4, 1],
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  // Light ray animation
  const rayVariants = {
    initial: (ray) => ({
      opacity: ray.opacity,
      rotate: ray.angle,
      scale: 1
    }),
    exploring: (ray) => ({
      opacity: [ray.opacity, ray.opacity * 1.5, 0],
      rotate: [ray.angle, ray.angle + 20, ray.angle + 180],
      scale: [1, 1.5, 10],
      transition: {
        duration: 2.2,
        times: [0, 0.4, 1],
        ease: 'easeInOut'
      }
    }),
    animate: (ray) => ({
      opacity: [ray.opacity * 0.7, ray.opacity, ray.opacity * 0.7],
      rotate: [ray.angle - 5, ray.angle, ray.angle + 5],
      transition: {
        duration: ray.animationDuration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'linear'
      }
    })
  };

  // Glow spot animation
  const glowSpotVariants = {
    initial: (spot) => ({
      opacity: spot.opacity,
      scale: 1
    }),
    exploring: (spot) => ({
      opacity: [spot.opacity, spot.opacity * 1.8, 0],
      scale: [1, 1.5, 8],
      transition: {
        duration: 2.2,
        times: [0, 0.3, 1],
        ease: 'easeInOut'
      }
    }),
    animate: (spot) => ({
      opacity: [spot.opacity * 0.8, spot.opacity, spot.opacity * 0.8],
      scale: [0.9, 1, 0.9],
      transition: {
        duration: spot.animationDuration,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: [0.45, 0.05, 0.55, 0.95]
      }
    })
  };

  // Welcome message animation
  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1.1,
      transition: {
        duration: 1.0,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    exit: {
      opacity: 0,
      scale: 1.3,
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  if (removeComponent) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.bgGradientStart}, ${theme.bgGradientEnd})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 50,
          width: '100vw',
          height: 'calc(100vh - 30px)',
          top: '30px',
          bottom: '0'
        }}
      >
        {/* SVG Defs for light effects */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="rayGradient" cx="0%" cy="50%" r="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Ambient glow spots */}
        {glowSpots.map((spot) => (
          <motion.div
            key={`glow-${spot.id}`}
            custom={spot}
            variants={glowSpotVariants}
            initial="initial"
            animate={isExploring ? "exploring" : "animate"}
            className="fixed"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: `${spot.size}px`,
              height: `${spot.size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${spot.color}50 0%, ${spot.color}00 70%)`,
              filter: 'blur(15px)',
              zIndex: isExploring ? 60 : 40,
              willChange: 'transform, opacity'
            }}
          />
        ))}

        {/* Light rays */}
        {lightRays.map((ray) => (
          <motion.div
            key={`ray-${ray.id}`}
            custom={ray}
            variants={rayVariants}
            initial="initial"
            animate={isExploring ? "exploring" : "animate"}
            className="fixed"
            style={{
              left: `${ray.originX}%`,
              top: `${ray.originY}%`,
              width: `${ray.length}vh`,
              height: `${ray.width}px`,
              background: `linear-gradient(90deg, ${ray.color} 0%, ${ray.color}50 50%, ${ray.color}00 100%)`,
              transformOrigin: 'left center',
              filter: 'blur(3px)',
              zIndex: isExploring ? 61 : 41,
              willChange: 'transform, opacity'
            }}
          />
        ))}

        {/* Main volumetric light effect in center */}
        <motion.div
          className="fixed pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: '60vh',
            height: '60vh',
            marginLeft: '-30vh',
            marginTop: '-30vh',
            background: `radial-gradient(circle, ${theme.neonAccent}20 0%, ${theme.neonAccent}10 35%, ${theme.neonAccent}00 70%)`,
            filter: 'blur(30px)',
            zIndex: 45,
            opacity: 0.8
          }}
          animate={
            isExploring 
              ? {
                  scale: [1, 1.5, 5],
                  opacity: [0.8, 1, 0],
                  transition: { duration: 2, times: [0, 0.3, 1], ease: 'easeInOut' }
                }
              : {
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.7, 0.9, 0.7],
                  transition: { duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                }
          }
        />

        {/* Card */}
        <motion.div
          ref={cardRef}
          className="flex flex-col items-center justify-center overflow-hidden"
          style={{
            position: 'fixed',
            left: '50%',
            top: 'calc(50% + 15px)',
            marginLeft: '-45%',   // Half of card width (90%)
            marginTop: '-30vh',  // Half of card height (60vh)
            rotateX: isExploring ? 0 : rotateX,
            rotateY: isExploring ? 0 : rotateY,
            transformStyle: 'preserve-3d',
            transformPerspective: '1200px',
            background: `radial-gradient(ellipse at center, ${theme.buttonPrimaryHoverBg} 0%, ${theme.buttonPrimaryBg} 70%, ${theme.navBg} 100%)`,
            color: theme.textPrimary,
            border: `2px solid ${theme.neonAccent}30`,
            backdropFilter: 'blur(5px)',
            zIndex: 55,
            willChange: 'transform'
          }}
          variants={cardVariants}
          initial="initial"
          animate={isExploring ? 'exploring' : cardControls}
          drag={!isExploring}
          dragConstraints={constraints || { top: 0, right: 0, bottom: 0, left: 0 }}
          dragElastic={0.1}
          whileDrag={{ scale: 1.03 }}
          dragTransition={{ bounceStiffness: 500, bounceDamping: 25 }}
          onDragEnd={handleDragEnd}
          {...(!isExploring && { animate: { ...floatAnimation, ...glowAnimation } })}
        >
          {!isExploring && (
            <>
              {/* Interior card light effect */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${theme.neonAccent}20 0%, transparent 70%)`,
                  opacity: 0.8,
                  zIndex: 0
                }}
              />

              {/* Decorative SVG overlay */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <radialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={`${theme.neonAccent}40`} />
                      <stop offset="70%" stopColor={`${theme.neonAccent}10`} />
                      <stop offset="100%" stopColor={`${theme.neonAccent}00`} />
                    </radialGradient>
                    <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={`${theme.neonAccent}50`} />
                      <stop offset="50%" stopColor={`${theme.neonAccent}20`} />
                      <stop offset="100%" stopColor={`${theme.neonAccent}50`} />
                    </linearGradient>
                  </defs>
                  
                  <circle cx="50" cy="50" r="45" fill="url(#cardGlow)" />
                  <path
                    d="M20,20 L80,20 L80,80 L20,80 Z"
                    fill="none"
                    stroke={`${theme.neonAccent}20`}
                    strokeWidth="0.3"
                    strokeDasharray="3,3"
                  />
                  <path
                    d="M10,10 L90,10 L90,90 L10,90 Z"
                    fill="none"
                    stroke="url(#edgeGlow)"
                    strokeWidth="0.4"
                  />
                  <path 
                    d="M50,0 L50,100" 
                    stroke={`${theme.neonAccent}10`} 
                    strokeWidth="40" 
                    strokeLinecap="round"
                    filter="blur(20px)"
                  />
                  <path 
                    d="M0,50 L100,50" 
                    stroke={`${theme.neonAccent}10`} 
                    strokeWidth="40" 
                    strokeLinecap="round"
                    filter="blur(20px)"
                  />
                </svg>
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col items-center justify-between h-full w-full z-10"
              style={{
                alignContent: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                msFlexDirection: 'column',
                WebkitJustifyContent: 'space-between',
              }}
              >
                {/* Top section */}
                <div>
                  <motion.div 
                    style={{
                       x: titleX, y: titleY, 
                       marginBottom: '2vh'
                     }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {/* Increased to text-5xl, adjusted textShadow */}
                    <h1
                      className="text-5xl font-bold mb-3 text-center"
                      style={{
                        textShadow: `0 0 6px ${theme.neonAccent}80`,
                        color: theme.textPrimary,
                        letterSpacing: '1px'
                      }}
                    >
                      German Vinokurov
                    </h1>
                    <motion.div
                      className="w-24 h-1 mx-auto mb-6"
                      style={{
                        background: theme.neonAccent,
                        boxShadow: `0 0 10px ${theme.neonAccent}`
                      }}
                      animate={{
                        width: ['24px', '100px', '24px'],
                        transition: { duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* Middle section - bigger button */}
                <div className="flex justify-center align-center items-center w-full my-8"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  textAlign: 'center',
                  alignContent: 'center',
                }}
                >
                  <motion.button
                    // Bigger padding and text size
                    className="py-6 px-16 rounded-full text-2xl font-bold flex justify-center align-center items-center"
                    style={{
                      background: `linear-gradient(45deg, ${theme.neonAccent}, ${theme.linkHoverColor})`,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.textPrimary}20`,
                      borderRadius: '32px',
                      minWidth: '80%',
                      minHeight: '4vh',
                      position: 'relative',

                      x: buttonX,
                      y: buttonY
                    }}
                    onClick={handleExploreClick}
                    animate={buttonGlowAnimation}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  >
                    Start Exploring
                  </motion.button>
                </div>
                
                {/* Bottom section
                <motion.p
                  // Kept as text-lg but you can tweak as needed
                  className="text-lg text-center px-6"
                  style={{
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignContent: 'center',
                    color: theme.textSecondary,
                    maxWidth: '280px',
                    lineHeight: '1.5'
                  }}
                  animate={{
                    x: [0, -3, 3, 0],
                    y: [0, -1, 1, 0],
                    transition: { duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                  }}
                >
                  Click the button once you are ready to explore
                </motion.p> */}
              </div>
            </>
          )}
        </motion.div>

        {/* Welcome Message */}
        {showWelcome && (
          <motion.div
            className="fixed"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 70
            }}
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Light burst effect behind welcome text */}
            <motion.div
              className="absolute"
              style={{
                width: '200vw',
                height: '200vh',
                background: `radial-gradient(circle, ${theme.neonAccent}40 0%, ${theme.neonAccent}00 50%)`,
                filter: 'blur(40px)',
                zIndex: -1
              }}
              animate={{
                scale: [0.5, 1.5, 1],
                opacity: [0, 1, 0.7],
                transition: { duration: 1.8, times: [0, 0.4, 1], ease: 'easeOut' }
              }}
            />
            
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                filter: [
                  `drop-shadow(0 0 20px ${theme.neonAccent})`,
                  `drop-shadow(0 0 35px ${theme.neonAccent})`,
                  `drop-shadow(0 0 20px ${theme.neonAccent})`
                ],
                transition: { duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
              }}
            >
              {/* Reduced the initial style fontSize from 160px to 80px 
                  so it's not too overwhelming on mobile. */}
              <AutoFitText
                style={{
                  color: theme.textPrimary,
                  textShadow: `0 0 40px ${theme.neonAccent}`,
                  fontWeight: 'bold',
                  letterSpacing: '8px',
                  fontSize: '80px',
                }}
              >
                WELCOME
              </AutoFitText>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default MobileHero;
