import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. SCROLL ANIMATION COMPONENT
// ==========================================
export const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true 
}) => {
  const directionVariants = {
    up: { y: distance, opacity: 0 },
    down: { y: -distance, opacity: 0 },
    left: { x: distance, opacity: 0 },
    right: { x: -distance, opacity: 0 },
    zoom: { scale: 0.8, opacity: 0 },
    fade: { opacity: 0 }
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      whileInView={{ 
        x: 0, 
        y: 0, 
        scale: 1, 
        opacity: 1 
      }}
      viewport={{ once, margin: '-100px' }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 2. STAGGER CHILDREN ANIMATION
// ==========================================
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1,
  initialDelay = 0 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ==========================================
// 3. ANIMATED BUTTON COMPONENTS
// ==========================================

// Ripple Effect Button
export const RippleButton = ({ 
  children, 
  onClick, 
  style = {},
  className = '',
  disabled = false 
}) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={addRipple}
      disabled={disabled}
      className={className}
      style={{
        ...styles.rippleButton,
        ...style,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            ...styles.ripple,
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  );
};

// Gradient Hover Button
export const GradientButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  style = {},
  disabled = false 
}) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      hoverGradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      hoverGradient: 'linear-gradient(135deg, #db2777, #e11d48)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      hoverGradient: 'linear-gradient(135deg, #059669, #047857)',
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        background: variants[variant].hoverGradient,
        boxShadow: '0 15px 40px rgba(59, 130, 246, 0.4)'
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        ...styles.gradientButton,
        background: variants[variant].background,
        ...style,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </motion.button>
  );
};

// Scale Button
export const ScaleButton = ({ 
  children, 
  onClick, 
  style = {},
  hoverScale = 1.05,
  disabled = false 
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: hoverScale, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      style={{
        ...styles.scaleButton,
        ...style,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </motion.button>
  );
};

// ==========================================
// 4. PAGE TRANSITION WRAPPER
// ==========================================
export const PageTransition = ({ 
  children, 
  type = 'fade',
  duration = 0.5 
}) => {
  const transitions = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slideUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 }
    },
    slideDown: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 }
    },
    slideLeft: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 }
    },
    slideRight: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 }
    },
    rotate: {
      initial: { opacity: 0, rotate: -5 },
      animate: { opacity: 1, rotate: 0 },
      exit: { opacity: 0, rotate: 5 }
    }
  };

  return (
    <motion.div
      initial={transitions[type].initial}
      animate={transitions[type].animate}
      exit={transitions[type].exit}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 5. HOVER CARD COMPONENT
// ==========================================
export const HoverCard = ({ 
  children, 
  style = {},
  intensity = 'medium' 
}) => {
  const intensityValues = {
    low: { scale: 1.02, y: -5, shadow: '0 10px 30px rgba(0, 0, 0, 0.2)' },
    medium: { scale: 1.05, y: -10, shadow: '0 20px 50px rgba(0, 0, 0, 0.3)' },
    high: { scale: 1.08, y: -15, shadow: '0 30px 70px rgba(0, 0, 0, 0.4)' }
  };

  return (
    <motion.div
      whileHover={{
        scale: intensityValues[intensity].scale,
        y: intensityValues[intensity].y,
        boxShadow: intensityValues[intensity].shadow
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        ...styles.hoverCard,
        ...style
      }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 6. FLOATING ANIMATION
// ==========================================
export const FloatingElement = ({ 
  children, 
  duration = 3,
  distance = 15 
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 7. TYPING ANIMATION
// ==========================================
export const TypewriterText = ({ 
  text, 
  delay = 0,
  speed = 0.05 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, delay + (currentIndex * speed * 1000));

    return () => clearTimeout(timeout);
  }, [currentIndex, text, delay, speed]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  );
};

// ==========================================
// 8. LOADING SPINNER
// ==========================================
export const LoadingSpinner = ({ 
  size = 40,
  color = '#3b82f6' 
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        border: `4px solid rgba(59, 130, 246, 0.2)`,
        borderTop: `4px solid ${color}`,
        borderRadius: '50%'
      }}
    />
  );
};

// ==========================================
// 9. PULSE ANIMATION
// ==========================================
export const PulseElement = ({ 
  children, 
  scale = 1.05,
  duration = 2 
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 10. SHAKE ANIMATION (for errors)
// ==========================================
export const ShakeElement = ({ 
  children, 
  trigger 
}) => {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 11. DEMO SHOWCASE COMPONENT
// ==========================================
const AnimationShowcase = () => {
  const [shakeError, setShakeError] = useState(false);

  return (
    <div style={styles.showcase}>
      <h1 style={styles.showcaseTitle}>Animation Components Showcase</h1>

      {/* Scroll Reveal */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>1. Scroll Reveal Animations</h2>
        <div style={styles.grid}>
          <ScrollReveal direction="up">
            <div style={styles.demoCard}>Slide Up</div>
          </ScrollReveal>
          <ScrollReveal direction="down">
            <div style={styles.demoCard}>Slide Down</div>
          </ScrollReveal>
          <ScrollReveal direction="left">
            <div style={styles.demoCard}>Slide Left</div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div style={styles.demoCard}>Slide Right</div>
          </ScrollReveal>
          <ScrollReveal direction="zoom">
            <div style={styles.demoCard}>Zoom In</div>
          </ScrollReveal>
          <ScrollReveal direction="fade">
            <div style={styles.demoCard}>Fade In</div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stagger Children */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>2. Stagger Container</h2>
        <StaggerContainer staggerDelay={0.15}>
          <div style={styles.demoCard}>Item 1</div>
          <div style={styles.demoCard}>Item 2</div>
          <div style={styles.demoCard}>Item 3</div>
          <div style={styles.demoCard}>Item 4</div>
        </StaggerContainer>
      </section>

      {/* Buttons */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>3. Animated Buttons</h2>
        <div style={styles.buttonGrid}>
          <RippleButton onClick={() => console.log('Ripple!')}>
            Ripple Effect
          </RippleButton>
          
          <GradientButton variant="primary">
            Primary Gradient
          </GradientButton>
          
          <GradientButton variant="secondary">
            Secondary Gradient
          </GradientButton>
          
          <GradientButton variant="success">
            Success Gradient
          </GradientButton>
          
          <ScaleButton>
            Scale Button
          </ScaleButton>
        </div>
      </section>

      {/* Hover Cards */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>4. Hover Cards</h2>
        <div style={styles.grid}>
          <HoverCard intensity="low">
            <div style={styles.demoCard}>Low Intensity</div>
          </HoverCard>
          <HoverCard intensity="medium">
            <div style={styles.demoCard}>Medium Intensity</div>
          </HoverCard>
          <HoverCard intensity="high">
            <div style={styles.demoCard}>High Intensity</div>
          </HoverCard>
        </div>
      </section>

      {/* Floating Elements */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>5. Floating Animation</h2>
        <FloatingElement duration={2} distance={20}>
          <div style={styles.demoCard}>I'm Floating! 🎈</div>
        </FloatingElement>
      </section>

      {/* Typewriter */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>6. Typewriter Effect</h2>
        <div style={styles.typewriterDemo}>
          <TypewriterText 
            text="AI-Powered Deepfake Detection Technology" 
            speed={0.05}
          />
        </div>
      </section>

      {/* Loading Spinner */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>7. Loading Spinner</h2>
        <div style={styles.centerContent}>
          <LoadingSpinner size={60} color="#3b82f6" />
        </div>
      </section>

      {/* Pulse */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>8. Pulse Animation</h2>
        <PulseElement scale={1.1} duration={1.5}>
          <div style={styles.demoCard}>Pulsing Element ✨</div>
        </PulseElement>
      </section>

      {/* Shake */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>9. Shake Animation (Error)</h2>
        <ShakeElement trigger={shakeError}>
          <div style={styles.demoCard}>Click button to shake me!</div>
        </ShakeElement>
        <button 
          onClick={() => {
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
          }}
          style={styles.triggerButton}
        >
          Trigger Shake
        </button>
      </section>

      {/* Usage Instructions */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📖 Usage Examples</h2>
        <div style={styles.codeBlock}>
          <pre style={styles.code}>{`
// Import components
import { ScrollReveal, GradientButton, PageTransition } from './AnimationUtils';

// Use in your components
<ScrollReveal direction="up" delay={0.2}>
  <YourContent />
</ScrollReveal>

<GradientButton variant="primary" onClick={handleClick}>
  Click Me
</GradientButton>

// Wrap pages for transitions
<PageTransition type="slideUp">
  <YourPage />
</PageTransition>
          `}</pre>
        </div>
      </section>
    </div>
  );
};

// Styles
const styles = {
  showcase: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    color: 'white',
    padding: '4rem 2rem',
  },
  showcaseTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '4rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto 4rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#cbd5e1',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  buttonGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  demoCard: {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  rippleButton: {
    position: 'relative',
    overflow: 'hidden',
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  ripple: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.6)',
    pointerEvents: 'none',
  },
  gradientButton: {
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  },
  scaleButton: {
    padding: '0.875rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  hoverCard: {
    cursor: 'pointer',
  },
  typewriterDemo: {
    fontSize: '1.5rem',
    fontWeight: 600,
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
  },
  triggerButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  codeBlock: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'auto',
  },
  code: {
    color: '#cbd5e1',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    margin: 0,
  },
};

export default AnimationShowcase;