// GlassCard.jsx - Optimized Contact Form
import React, { useState, useEffect, useCallback } from 'react';
import './GlassCard.css';

const GlassCard = () => {
  // Form state with validation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  
  // Generate optimized particles for background effect
  const [particles, setParticles] = useState([]);
  
  // Memoize particle generation to improve performance
  const generateParticles = useCallback(() => {
    const newParticles = [];
    // Reduce particle count for better performance
    const count = window.innerWidth < 768 ? 6 : 10;
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 8 + 4, // Slightly smaller particles
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5
      });
    }
    
    setParticles(newParticles);
  }, []);
  
  useEffect(() => {
    generateParticles();
    
    // Debounce resize event for performance
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(generateParticles, 250);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [generateParticles]);

  // Optimized validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        return /^\S+@\S+\.\S+$/.test(value) ? '' : 'Invalid email format';
      case 'phone':
        return value && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value) 
          ? 'Invalid phone number' : '';
      case 'message':
        return !value.trim() ? 'Message is required' : '';
      default:
        return '';
    }
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Live validation only if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  // Mark field as touched when focused out
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const formErrors = {};
    let isValid = true;
    
    // Only validate required fields
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== 'phone' && field !== 'subject') {
        const error = validateField(field, value);
        if (error) {
          formErrors[field] = error;
          isValid = false;
        }
      }
    });
    
    setErrors(formErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (!isValid) return;
    
    // Simulate form submission
    try {
      setLoading(true);
      
      // Simulate API call - replace with your actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setSuccess(true);
      setTouched({});
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-form-container">
      {/* Optimized background particles */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>
      
      <div className="glass-card">
        <h2 className="glass-card-title">Contact Me</h2>
        
        {!success ? (
          <form onSubmit={handleSubmit} className="glass-form" noValidate>
            {/* Name field with floating label */}
            <div className="form-group">
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.name && touched.name ? "input-error" : ""}
                placeholder=" "
                aria-required="true"
              />
              <label htmlFor="name" className="floating-label">Name</label>
              <div className={`error-message ${errors.name && touched.name ? "visible" : ""}`}>
                {errors.name}
              </div>
            </div>

            {/* Email field with floating label */}
            <div className="form-group">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email && touched.email ? "input-error" : ""}
                placeholder=" "
                aria-required="true"
              />
              <label htmlFor="email" className="floating-label">Email</label>
              <div className={`error-message ${errors.email && touched.email ? "visible" : ""}`}>
                {errors.email}
              </div>
            </div>

            {/* Phone field (optional) */}
            <div className="form-group">
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phone && touched.phone ? "input-error" : ""}
                placeholder=" "
              />
              <label htmlFor="phone" className="floating-label">Phone (optional)</label>
              <div className={`error-message ${errors.phone && touched.phone ? "visible" : ""}`}>
                {errors.phone}
              </div>
            </div>

            {/* Subject dropdown */}
            <div className="form-group custom-select">
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select a subject</option>
                <option value="job">Job Opportunity</option>
                <option value="project">Project Inquiry</option>
                <option value="collaboration">Collaboration</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message textarea with floating label */}
            <div className="form-group">
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.message && touched.message ? "input-error" : ""}
                placeholder=" "
                aria-required="true"
              />
              <label htmlFor="message" className="floating-label">Message</label>
              <div className={`error-message ${errors.message && touched.message ? "visible" : ""}`}>
                {errors.message}
              </div>
            </div>

            {/* Form error message */}
            {errors.form && (
              <div className="error-message visible">{errors.form}</div>
            )}

            {/* Submit button with glitch effect */}
            <button
              type="submit"
              className={`glitch-button ${loading ? 'loading' : ''}`}
              data-text="Send Message"
              disabled={loading}
            >
              Send Message
            </button>
          </form>
        ) : (
          <div className="success-message visible">
            <h3>Thank you for reaching out!</h3>
            <p>I'll get back to you as soon as possible.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlassCard;