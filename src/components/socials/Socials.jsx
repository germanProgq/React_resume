import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme, applyTheme } from '../../theme.js';
import { 
  FaInstagram, FaFacebookF, FaTwitter, FaGithub, FaTelegramPlane,
  FaLinkedinIn, FaYoutube, FaPinterestP, FaTiktok, FaDiscord,
  FaMediumM, FaDribbble, FaBehance, FaRedditAlien, FaSnapchatGhost,
  FaWhatsapp, FaPatreon, FaGlobe
} from 'react-icons/fa';

// ========== KEYFRAMES ==========

// A smoother, fluid card animation for hover on desktop
const smoothWeirdAnimation = keyframes`
  0%   { transform: translate(0,0) rotate(0deg) scale(1.2); }
  20%  { transform: translate(5px,-5px) rotate(5deg) scale(1.15); }
  40%  { transform: translate(-5px,5px) rotate(-5deg) scale(1.05); }
  60%  { transform: translate(3px,3px) rotate(3deg) scale(1.1); }
  80%  { transform: translate(-3px,-3px) rotate(-3deg) scale(1.05); }
  100% { transform: translate(0,0) rotate(0deg) scale(1); }
`;

const bgWeirdAnimation = keyframes`
  0%   { transform: rotate(0deg) scale(1); opacity: 0; }
  25%  { transform: rotate(90deg) scale(1.1); opacity: 0.5; }
  50%  { transform: rotate(180deg) scale(0.9); opacity: 1; }
  75%  { transform: rotate(270deg) scale(1.05); opacity: 0.5; }
  100% { transform: rotate(360deg) scale(1); opacity: 0; }
`;

const clickAnimation = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

const fadeInUp = keyframes`
  0%   { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  75% { transform: translateY(8px) rotate(-2deg); }
`;

const shimmer = keyframes`
  0%   { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const spinRing = keyframes`
  0% { transform: perspective(500px) rotateX(60deg) rotateZ(0deg); }
  100% { transform: perspective(500px) rotateX(60deg) rotateZ(360deg); }
`;

// ========== STYLED COMPONENTS ==========

const Showcase = styled.section`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, rgba(10,10,20,1) 0%, rgba(0,0,0,1) 80%);
  overflow: hidden;
  perspective: 1000px;
  padding: 3rem 1rem;
  z-index: 1;
`;

const HexGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(500px) rotateX(60deg);
  z-index: -2;
`;

const SpinningRing = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  border: 4px solid var(--theme-neon-accent);
  border-radius: 50%;
  transform: perspective(500px) rotateX(60deg);
  animation: ${spinRing} 12s linear infinite;
  opacity: 0.15;
  z-index: -1;
  top: 20%;
  left: 70%;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    top: 15%;
    left: 60%;
  }
`;

const ShowcaseTitle = styled.h2`
  color: var(--theme-text-primary);
  font-size: 2.8rem;
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out both;
  text-shadow: 0 0 15px var(--theme-neon-accent);
  letter-spacing: 3px;
  font-weight: 700;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: var(--theme-neon-accent);
    border-radius: 3px;
    box-shadow: 0 0 10px var(--theme-neon-accent);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

/**
 * SliderWrapper holds the arrows and the SocialsContainer.
 * We position arrows absolutely so they overlay the slider on mobile.
 */
const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
  margin: 0 auto;
  padding: 0 15px; /* Add padding to make space for arrows */
`;

/**
 * On mobile, we turn SocialsContainer into a horizontal slider:
 *  - single row, overflow-x: auto
 *  - hidden scrollbar (optional)
 *  - can swipe with finger
 */
const SocialsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  perspective: 1000px;

  @media (min-width: 769px) {
    /* Desktop: keep original wrap/flex behavior */
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    /* Mobile: single row slider */
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 1rem;
    scroll-snap-type: x mandatory; /* for snapping */
    -webkit-overflow-scrolling: touch;
    
    /* Hide scrollbar for all browsers */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
      width: 0;
      height: 0;
      background: transparent;
    }
    
    /* Add padding to prevent cards from hitting screen edge */
    padding: 10px 10px;
    margin: 0 -10px;
    
    /* Prevent hover effects from causing scrollbars */
    overflow-y: hidden;
  }
`;

/**
 * Arrow buttons visible on mobile only.
 * Absolutely positioned on left/right.
 */
const ArrowButton = styled.button`
  display: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--theme-neon-accent);
  color: var(--theme-text-primary);
  font-size: 1.2rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  opacity: 0.6;

  &:hover {
    background: rgba(255,255,255,0.2);
    opacity: 1;
  }

  &.left {
    left: -5px;
  }
  &.right {
    right: -5px;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const SocialCard = styled.a`
  position: relative;
  width: 180px;
  height: 180px;
  background: rgba(20, 0, 30, 0.55);
  border-radius: 20px;
  border: 2px solid transparent;
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  overflow: hidden;
  transition: transform 0.5s ease-in-out, border-color 0.5s ease, box-shadow 0.5s ease;
  transform-style: preserve-3d;
  animation: ${fadeInUp} 0.6s ease-out both;
  animation-delay: ${props => props.index * 0.1}s;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, var(--theme-neon-accent), transparent, var(--theme-neon-accent));
    border-radius: 20px;
    transform: rotate(0deg);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  &.active::before {
    animation: ${bgWeirdAnimation} 1s forwards;
  }
  &.active {
    animation: ${smoothWeirdAnimation} 1.8s forwards;
    border-color: var(--theme-neon-accent);
    box-shadow: 0 15px 35px rgba(0,0,0,0.35), 0 0 15px var(--theme-neon-accent);
  }
  &.clicked {
    animation: ${clickAnimation} 0.3s forwards;
  }
  /* Reveal text and shrink icon */
  &.active .platform-name {
    transform: translateY(0);
    opacity: 1;
  }
  &.active .platform-username {
    opacity: 1;
  }
  &.active .icon-container {
    transform: scale(1);
  }
  /* Make unhover transitions faster for text and icon */
  &:not(.active) .platform-name {
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  }
  &:not(.active) .platform-username {
    transition: opacity 0.2s ease-out;
  }
  &:not(.active) .icon-container {
    transition: transform 0.2s ease-out;
  }

  /* For smaller screens: smaller card size */
  @media (max-width: 768px) {
    width: 130px;
    height: 130px;
    flex: 0 0 auto; /* so it doesn't shrink in the slider */
    scroll-snap-align: center; /* snap to center for better experience */
  }

  @media (pointer: coarse) {
    transition: transform 0.4s ease-in-out, border-color 0.4s ease, box-shadow 0.4s ease;
  }
`;

const IconContainer = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: ${props => props.bgColor || 'var(--theme-neon-accent)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
  transition: transform 0.5s ease-in-out, box-shadow 0.5s ease;
  transform: scale(1.2);
  box-shadow: 0 0 10px 1px ${props => props.bgColor || 'var(--theme-neon-accent)'};

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    transform: scale(1.1);
  }
`;

const IconWrapper = styled.div`
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  font-size: 2rem;
  color: white;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PlatformName = styled.h3`
  color: var(--theme-text-primary);
  font-size: 1.2rem;
  margin: 0;
  margin-bottom: 0.5rem;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.4s ease;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.3rem;
  }
`;

const PlatformUsername = styled.p`
  color: var(--theme-text-secondary);
  font-size: 0.9rem;
  margin: 0;
  opacity: 0;
  transition: opacity 0.4s ease;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const FloatingCircle = styled.div`
  position: absolute;
  width: ${props => props.size || '50px'};
  height: ${props => props.size || '50px'};
  border-radius: 50%;
  background: ${props => props.color || 'var(--theme-neon-accent)'};
  opacity: ${props => props.opacity || '0.2'};
  top: ${props => props.top || '10%'};
  left: ${props => props.left || '10%'};
  z-index: 0;
  animation: ${floatAnimation} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  box-shadow: 0 0 20px ${props => props.color || 'var(--theme-neon-accent)'};

  @media (max-width: 768px) {
    width: calc(${props => props.size || '50px'} * 0.7);
    height: calc(${props => props.size || '50px'} * 0.7);
  }
`;

const CubeFace = styled.div`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform-style: preserve-3d;
  backface-visibility: hidden;
`;

const Cube = styled.div`
  position: absolute;
  width: ${props => props.size || '100px'};
  height: ${props => props.size || '100px'};
  transform-style: preserve-3d;
  animation: ${shimmer} 20s linear infinite;
  top: ${props => props.top || '10%'};
  left: ${props => props.left || '10%'};
  opacity: 0.3;
  z-index: 0;
  
  ${CubeFace}:nth-child(1) {
    transform: translateZ(calc(${props => props.size || '100px'} / 2));
  }
  ${CubeFace}:nth-child(2) {
    transform: rotateY(180deg) translateZ(calc(${props => props.size || '100px'} / 2));
  }
  ${CubeFace}:nth-child(3) {
    transform: rotateY(90deg) translateZ(calc(${props => props.size || '100px'} / 2));
  }
  ${CubeFace}:nth-child(4) {
    transform: rotateY(-90deg) translateZ(calc(${props => props.size || '100px'} / 2));
  }
  ${CubeFace}:nth-child(5) {
    transform: rotateX(90deg) translateZ(calc(${props => props.size || '100px'} / 2));
  }
  ${CubeFace}:nth-child(6) {
    transform: rotateX(-90deg) translateZ(calc(${props => props.size || '100px'} / 2));
  }

  @media (max-width: 768px) {
    width: calc(${props => props.size || '100px'} * 0.7);
    height: calc(${props => props.size || '100px'} * 0.7);
  }
`;

// ========== SOCIAL CARD WRAPPER ==========

const SocialCardWrapper = ({ children, href, style, index, onTouchStart }) => {
  const [active, setActive] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [touchTransform, setTouchTransform] = useState({});

  const handleMouseEnter = () => setActive(true);
  const handleMouseLeave = () => {
    setActive(false);
    setTouchTransform({});
  };
  const handleFocus = () => setActive(true);
  const handleBlur = () => setActive(false);

  // For mobile/touch devices, simpler 3D rotation
  const handleTouchStart = (e) => {
    setActive(true);
    // Call the parent's onTouchStart if provided
    if (onTouchStart) onTouchStart(e);
  };
  
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    // Reduced maxRotation on mobile
    const maxRotation = 6;
    const rotateY = (-1) * (x / rect.width * maxRotation);
    const rotateX = (y / rect.height * maxRotation);
    setTouchTransform({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    });
  };
  
  const handleTouchEnd = () => {
    setActive(false);
    setTouchTransform({});
  };

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  const mergedStyle = { ...style, ...touchTransform };
  const classNames = `${active ? 'active' : ''}${clicked ? ' clicked' : ''}`;

  return (
    <SocialCard
      href={href}
      style={mergedStyle}
      className={classNames}
      index={index}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
    </SocialCard>
  );
};

// ========== MAIN COMPONENT ==========

const SocialShowcase = () => {
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [autoScrolling, setAutoScrolling] = useState(true);
  const autoScrollIntervalRef = useRef(null);
  const isMobileRef = useRef(false);

  // For arrow buttons on mobile
  const handleScroll = (direction) => {
    if (!sliderRef.current) return;
    
    // Stop auto-scrolling when user manually navigates
    stopAutoScroll();
    
    // Get card width from the first card element + gap
    const cardWidth = 130; // Default card width on mobile
    const gap = 16; // Default gap
    const scrollAmount = (cardWidth + gap) * direction;
    
    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Start auto-scrolling for mobile
  const startAutoScroll = () => {
    if (!isMobileRef.current || !sliderRef.current) return;
    
    setAutoScrolling(true);
    autoScrollIntervalRef.current = setInterval(() => {
      if (sliderRef.current) {
        const currentScroll = sliderRef.current.scrollLeft;
        const scrollWidth = sliderRef.current.scrollWidth;
        const clientWidth = sliderRef.current.clientWidth;
        
        // If we're near the end, loop back to start
        if (currentScroll + clientWidth >= scrollWidth - 50) {
          sliderRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Otherwise scroll one card width
          sliderRef.current.scrollBy({
            left: 150, // Approx card width + gap
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // Scroll every 3 seconds
  };

  // Stop auto-scrolling
  const stopAutoScroll = () => {
    setAutoScrolling(false);
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  // Handle user interaction to stop auto-scrolling
  const handleUserInteraction = () => {
    stopAutoScroll();
  };

  useEffect(() => {
    applyTheme();
    
    // Check if we're on mobile
    isMobileRef.current = window.innerWidth <= 768;
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      // Skip parallax on touch devices
      if ('ontouchstart' in window || navigator.maxTouchPoints) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setMousePosition({ x, y });
    };

    const importSocialData = async () => {
      try {
        const contactModule = await import('../../texts/socials.jsx');
        if (contactModule.socials) {
          setSocials(contactModule.socials);
        } else {
          setSocials(getFallbackSocials());
        }
      } catch (error) {
        console.error("Failed to load social data:", error);
        setSocials(getFallbackSocials());
      } finally {
        setLoading(false);
        
        // Start auto-scrolling after data is loaded (only on mobile)
        if (isMobileRef.current) {
          // Small delay to ensure the slider is rendered
          setTimeout(() => {
            startAutoScroll();
          }, 1000);
        }
      }
    };
    
    // Window resize handler to update isMobile flag
    const handleResize = () => {
      const wasMobile = isMobileRef.current;
      isMobileRef.current = window.innerWidth <= 768;
      
      // If switching between mobile/desktop, handle auto-scrolling
      if (isMobileRef.current && !wasMobile) {
        startAutoScroll();
      } else if (!isMobileRef.current && wasMobile) {
        stopAutoScroll();
      }
    };

    importSocialData();
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
      stopAutoScroll();
    };
  }, []);

  // Attach scroll event listener to detect when user scrolls to end
  useEffect(() => {
    const handleScroll = () => {
      if (!sliderRef.current || !autoScrolling) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      
      // If user manually scrolls, stop auto-scrolling
      if (scrollLeft > 10) {
        stopAutoScroll();
      }
    };
    
    if (sliderRef.current) {
      sliderRef.current.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [autoScrolling]);

  // Slight 3D parallax for desktop
  const getCardTransform = (index) => {
    if (!containerRef.current) return {};
    const { x, y } = mousePosition;
    const container = containerRef.current;
    const maxRotation = 10;
    const rotateY = (-1) * (x / container.offsetWidth * maxRotation);
    const rotateX = (y / container.offsetHeight * maxRotation);
    const offsetFactor = (index % 3) - 1;
    return {
      transform: `rotateX(${rotateX + offsetFactor}deg) rotateY(${rotateY + offsetFactor}deg)`
    };
  };

  const getFallbackSocials = () => {
    return [
      {
        platform: 'Instagram',
        username: '@yourprofile',
        url: 'https://instagram.com/yourprofile',
        icon: <FaInstagram />,
        color: '#E1306C'
      },
      {
        platform: 'GitHub',
        username: '@yourname',
        url: 'https://github.com/yourname',
        icon: <FaGithub />,
        color: '#333333'
      },
      {
        platform: 'Telegram',
        username: '@yourtghandle',
        url: 'https://t.me/yourtghandle',
        icon: <FaTelegramPlane />,
        color: '#0088cc'
      },
      {
        platform: 'Facebook',
        username: '@yourfbhandle',
        url: 'https://facebook.com/yourfbhandle',
        icon: <FaFacebookF />,
        color: '#1877F2'
      }
    ];
  };

  const getIconComponent = (platform, providedIcon) => {
    if (providedIcon) return providedIcon;
    const lower = platform.toLowerCase();
    if (lower.includes('instagram')) return <FaInstagram />;
    if (lower.includes('facebook')) return <FaFacebookF />;
    if (lower.includes('github')) return <FaGithub />;
    if (lower.includes('telegram')) return <FaTelegramPlane />;
    if (lower.includes('twitter')) return <FaTwitter />;
    if (lower.includes('linkedin')) return <FaLinkedinIn />;
    if (lower.includes('youtube')) return <FaYoutube />;
    if (lower.includes('pinterest')) return <FaPinterestP />;
    if (lower.includes('tiktok')) return <FaTiktok />;
    if (lower.includes('discord')) return <FaDiscord />;
    if (lower.includes('medium')) return <FaMediumM />;
    if (lower.includes('dribbble')) return <FaDribbble />;
    if (lower.includes('behance')) return <FaBehance />;
    if (lower.includes('reddit')) return <FaRedditAlien />;
    if (lower.includes('snapchat')) return <FaSnapchatGhost />;
    if (lower.includes('whatsapp')) return <FaWhatsapp />;
    if (lower.includes('patreon')) return <FaPatreon />;
    return <FaGlobe />;
  };

  return (
    <Showcase ref={containerRef} id='socials'>
      <HexGrid />
      <SpinningRing />
      <FloatingCircle size="100px" top="10%" left="10%" color={theme.neonAccent} opacity="0.15" duration="8s" />
      <FloatingCircle size="150px" top="70%" left="80%" color={theme.neonAccent} opacity="0.1" duration="12s" delay="1s" />
      <FloatingCircle size="80px" top="30%" left="70%" color={theme.linkColor} opacity="0.12" duration="10s" delay="0.5s" />
      <FloatingCircle size="120px" top="80%" left="20%" color={theme.linkColor} opacity="0.08" duration="15s" delay="2s" />
      
      <Cube size="120px" top="15%" left="85%" duration="25s">
        <CubeFace size="120px" />
        <CubeFace size="120px" />
        <CubeFace size="120px" />
        <CubeFace size="120px" />
        <CubeFace size="120px" />
        <CubeFace size="120px" />
      </Cube>
      
      <Cube size="80px" top="75%" left="15%" duration="20s">
        <CubeFace size="80px" />
        <CubeFace size="80px" />
        <CubeFace size="80px" />
        <CubeFace size="80px" />
        <CubeFace size="80px" />
        <CubeFace size="80px" />
      </Cube>
      
      <ShowcaseTitle>Connect With Me</ShowcaseTitle>

      {loading ? (
        <div style={{ color: 'white' }}>Loading social profiles...</div>
      ) : (
        <SliderWrapper>
          <ArrowButton className="left" onClick={() => handleScroll(-1)}>
            ‹
          </ArrowButton>
          <SocialsContainer 
            ref={sliderRef}
            onTouchStart={handleUserInteraction}
          >
            {socials.map((social, index) => (
              <SocialCardWrapper 
                key={index}
                href={social.url}
                index={index}
                style={getCardTransform(index)}
                onTouchStart={handleUserInteraction}
              >
                <IconContainer bgColor={social.color} className="icon-container">
                  <IconWrapper className="icon-3d">
                    {getIconComponent(social.platform, social.icon)}
                  </IconWrapper>
                </IconContainer>
                <PlatformName className="platform-name">{social.platform}</PlatformName>
                <PlatformUsername className="platform-username">{social.username}</PlatformUsername>
              </SocialCardWrapper>
            ))}
          </SocialsContainer>
          <ArrowButton className="right" onClick={() => handleScroll(1)}>
            ›
          </ArrowButton>
        </SliderWrapper>
      )}
    </Showcase>
  );
};

export default SocialShowcase;