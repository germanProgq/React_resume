import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../../theme';

/* 1) BACKGROUND GRADIENT SHIFT */
const subtleGradient = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* 2) SPIN ANIMATIONS FOR OUR SHAPES */
const spinRing = keyframes`
  0%   { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
`;
const spinSquare = keyframes`
  0%   { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
`;
const spinTriangle = keyframes`
  0%   { transform: rotateX(0deg) rotateZ(0deg); }
  100% { transform: rotateX(360deg) rotateZ(360deg); }
`;

/* 3) STARFIELD ANIMATION (STARS "TWINKLE") */
const starTwinkle = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
`;

/* 4) FORM SUCCESS ANIMATION */
const successPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(${props => getNeonAccentRGB()}, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(${props => getNeonAccentRGB()}, 0); }
  100% { transform: scale(1); }
`;

/* 
  PAGE CONTAINER 
  - Full height with content sections
  - Smooth scrolling enabled
*/
const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  position: relative;
  scroll-behavior: smooth;
  
  /* We'll use the theme imported from theme.js now */
`;

/*
  FORM CONTAINER
  - Filled by a gradient background
  - Perspective for 3D shapes behind it
  - Takes full viewport height
*/
const FormContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    135deg,
    var(--theme-bg-gradient-start),
    var(--theme-bg-gradient-end)
  );
  background-size: 400% 400%;
  animation: ${subtleGradient} 15s ease infinite;
  
  /* Provide 3D perspective for shapes in the background. */
  perspective: 1000px;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

/*
  STARFIELD LAYER
  - Absolutely placed behind everything
  - Repeated radial-gradient to fake many stars
  - Twinkle animation
*/
const Stars = styled.div`
  position: absolute;
  top: 0; 
  left: 0;
  width: 200%;
  height: 200%;
  pointer-events: none;
  z-index: 0;

  background: radial-gradient(
      circle at 10px 10px,
      #fff 1px,
      transparent 2px
    ) repeat;
  background-size: 50px 50px;
  animation: ${starTwinkle} 2s alternate infinite;
  opacity: 0.3;
`;

/*
  SCENE CONTAINER
  - Holds the 3D shapes
  - We'll rotate this container with mousemove
*/
const SceneContainer = styled.div`
  position: absolute;
  top: 0; 
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  pointer-events: none;
  z-index: 1; /* behind the form but above the starfield */
  transition: transform 0.2s ease-out;
`;

/* ROTATING SHAPES (3D) */
const Ring = styled.div`
  position: absolute;
  width: 18rem;
  height: 18rem;
  border: 0.5rem solid var(--theme-neon-accent);
  border-radius: 50%;
  opacity: 0.3;
  top: 50%;
  left: 30%;
  margin: -9rem 0 0 -9rem; /* center relative to itself */
  animation: ${spinRing} 20s linear infinite;
  box-shadow: 0 0 20px var(--theme-neon-accent);
`;

const Square = styled.div`
  position: absolute;
  width: 10rem;
  height: 10rem;
  border: 0.5rem solid var(--theme-neon-accent);
  opacity: 0.25;
  top: 20%;
  left: 70%;
  margin: -5rem 0 0 -5rem;
  animation: ${spinSquare} 15s ease-in-out infinite alternate;
  box-shadow: 0 0 15px var(--theme-neon-accent);
`;

const Triangle = styled.div`
  position: absolute;
  width: 0; 
  height: 0;
  border-left: 6rem solid transparent;
  border-right: 6rem solid transparent;
  border-bottom: 10rem solid var(--theme-neon-accent);
  opacity: 0.2;
  top: 80%;
  left: 50%;
  margin: -5rem 0 0 -6rem;
  animation: ${spinTriangle} 25s linear infinite;
  filter: drop-shadow(0 0 10px var(--theme-neon-accent));
`;

/*
  CONTACT FORM (flat card)
*/
const StyledForm = styled.form`
  position: relative;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  border: 2px solid var(--theme-neon-accent);
  border-radius: 12px;
  background-color: rgba(20, 0, 30, 0.7);
  color: var(--theme-text-primary);
  z-index: 2; /* above the 3D shapes */
  backdrop-filter: blur(5px);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 15px var(--theme-neon-accent);
  }
  
  /* Success animation when form is submitted */
  &.submitted {
    animation: ${successPulse} 1.5s ease;
    border-color: #50c878; /* Emerald green */
  }
`;

const FormHeading = styled.h2`
  color: var(--theme-text-primary);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  letter-spacing: 1px;
  text-shadow: 0 0 10px var(--theme-neon-accent);
`;

/* INPUT LABEL FOR BETTER UX */
const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--theme-text-primary);
  font-size: 0.9rem;
  transform-origin: left;
  transition: all 0.3s ease;
  opacity: 0.8;
`;

/* FORM GROUP - WRAPS EACH INPUT */
const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

/* SHARED INPUT STYLES */
const commonInputStyle = `
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: var(--theme-nav-bg);
  color: var(--theme-text-primary);
  outline: 2px solid transparent;
  transition: all 0.3s;
  font-size: 1rem;

  &:focus {
    outline-color: var(--theme-outline-color);
    box-shadow: 0 0 8px rgba(var(--theme-neon-accent-rgb), 0.4);
    background-color: rgba(30, 30, 60, 0.7);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    transition: opacity 0.3s;
  }
  
  &:focus::placeholder {
    opacity: 0.3;
  }
`;

const StyledInput = styled.input`
  ${commonInputStyle}
`;

const StyledTextArea = styled.textarea`
  ${commonInputStyle}
  resize: vertical;
  min-height: 6rem;
`;

/* VALIDATION ERROR MESSAGE */
const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.3rem;
  height: 1rem;
  transition: all 0.3s;
`;

/*
  SUBMIT BUTTON
  - Cool hover effects
  - Loading and success states
*/
const SubmitButton = styled.button`
  padding: 0.85rem 1.5rem;
  background-color: var(--theme-button-primary-bg);
  color: var(--theme-text-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover:not(:disabled) {
    background-color: var(--theme-button-primary-hover-bg);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(var(--theme-neon-accent-rgb), 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  /* Button ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 0 0;
  }
  
  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      transform: scale(50, 50);
      opacity: 0;
    }
  }
`;

/* LOADING SPINNER */
const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  animation: spin 0.8s linear infinite;
  margin-right: ${props => props.standalone ? '0' : '0.5rem'};
  display: inline-block;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/* SUCCESS MESSAGE CONTAINER */
const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--theme-text-primary);
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }
`;

/* FLOATING SHAPES FOR SUCCESS STATE */
const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const Particle = styled.div`
  position: absolute;
  width: ${props => props.size || '10px'};
  height: ${props => props.size || '10px'};
  background-color: ${props => props.color || theme.neonAccent};
  border-radius: ${props => props.shape === 'circle' ? '50%' : '0'};
  opacity: ${props => props.opacity || '0.7'};
  animation: float 4s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '20%'};
  left: ${props => props.left || '20%'};
  
  @keyframes float {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
    100% {
      transform: translateY(0) rotate(360deg);
    }
  }
`;

export default function ContactForm() {
  // Form state and validation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  
  // Add theme-specific RGB values for the particle effects
  const getNeonAccentRGB = () => {
    // Extract RGB values from the hex color
    const hex = theme.neonAccent.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };
  
  // For interactive UI elements
  const sceneRef = useRef(null);
  const formRef = useRef(null);
  
  // Mouse movement effect
  const handleMouseMove = (e) => {
    if (!sceneRef.current) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Calculate percentage distance from the center
    const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
    
    // Apply rotation (inverted for natural feel)
    sceneRef.current.style.transform = `rotateY(${-x * 15}deg) rotateX(${y * 15}deg)`;
  };
  
  // Reset scene rotation when mouse leaves
  const handleMouseLeave = () => {
    if (!sceneRef.current) return;
    sceneRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };
  
  // Form validation
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
        break;
      case 'message':
        if (!value.trim()) error = 'Message is required';
        else if (value.trim().length < 10) error = 'Message must be at least 10 characters';
        break;
      default:
        break;
    }
    
    return error;
  };
  
  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark form as touched on first interaction
    if (!formTouched) setFormTouched(true);
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Validate all fields at once
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set form as touched to show any errors
    setFormTouched(true);
    
    // Check if form is valid
    if (!validateForm()) return;
    
    // Start submission
    setIsSubmitting(true);
    
    try {
      // Get current date and time
      const submissionDate = new Date().toISOString();
      
      // Prepare the data to send to Google Sheets
      const formDataToSend = {
        ...formData,
        timestamp: submissionDate
      };
      
      // Send data to Google Apps Script web app
      console.log('Sending form data to Google Sheet:', formDataToSend);
      
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbyyjTttMoH1KEb9qx8DJw-QRFp8_-_xSIBrPlGlJRmpbTpIQfd-BvJTxuQyvYgcvAmY/exec', // Replace with your deployed script URL
          {
            method: 'POST',
            body: JSON.stringify(formDataToSend),
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'no-cors' // Using no-cors to avoid CORS issues with Google Apps Script
          }
        );
        
        console.log('Response received:', response);
        
        // In no-cors mode, we can't read the response content
        // so we'll assume success if we made it this far
        formRef.current.classList.add('submitted');
        
        // Reset form after delay
        setTimeout(() => {
          setIsSuccess(true);
        }, 1000);
        
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error('Network error when contacting Google Sheets');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        form: 'There was an error submitting the form. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset the form to try again
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setErrors({});
    setIsSuccess(false);
    setFormTouched(false);
    formRef.current.classList.remove('submitted');
  };
  
  return (
    <PageContainer id='contact'>
      {/* CONTACT FORM SECTION */}
      <FormContainer
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Starfield behind everything */}
        <Stars />
        
        {/* Rotating shapes for the 3D scene */}
        <SceneContainer ref={sceneRef}>
          <Ring />
          <Square />
          <Triangle />
        </SceneContainer>

        {/* The actual contact form (flat) */}
        {!isSuccess ? (
          <StyledForm ref={formRef} onSubmit={handleSubmit}>
            <FormHeading>Get In Touch</FormHeading>
            
            <FormGroup>
              <InputLabel htmlFor="name">Your Name</InputLabel>
              <StyledInput
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
              {formTouched && errors.name && (
                <ErrorMessage>{errors.name}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <InputLabel htmlFor="email">Email Address</InputLabel>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {formTouched && errors.email && (
                <ErrorMessage>{errors.email}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup>
              <InputLabel htmlFor="subject">Subject (Optional)</InputLabel>
              <StyledInput
                id="subject"
                name="subject"
                type="text"
                placeholder="What's this about?"
                value={formData.subject}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <InputLabel htmlFor="message">Your Message</InputLabel>
              <StyledTextArea
                id="message"
                name="message"
                rows="4"
                placeholder="Tell us what you're thinking about..."
                value={formData.message}
                onChange={handleChange}
              />
              {formTouched && errors.message && (
                <ErrorMessage>{errors.message}</ErrorMessage>
              )}
            </FormGroup>

            {errors.form && (
              <ErrorMessage style={{ marginBottom: '1rem' }}>{errors.form}</ErrorMessage>
            )}

            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                'Send Message'
              )}
            </SubmitButton>
          </StyledForm>
        ) : (
          <StyledForm>
            <FloatingElements>
              <Particle size="15px" color={theme.neonAccent} shape="circle" top="10%" left="10%" delay="0s" />
              <Particle size="20px" color={theme.neonAccent} shape="circle" top="20%" left="80%" delay="0.2s" />
              <Particle size="12px" color={theme.linkHoverColor} shape="circle" top="70%" left="20%" delay="0.4s" />
              <Particle size="25px" color={theme.neonAccent} shape="circle" top="60%" left="85%" delay="0.6s" />
              <Particle size="18px" color={theme.linkHoverColor} shape="circle" top="85%" left="50%" delay="0.8s" />
            </FloatingElements>
            
            <SuccessMessage>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
              <SubmitButton onClick={handleReset}>
                Send Another Message
              </SubmitButton>
            </SuccessMessage>
          </StyledForm>
        )}
      </FormContainer>
    </PageContainer>
  );
}