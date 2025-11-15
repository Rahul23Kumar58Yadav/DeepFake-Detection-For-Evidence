import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Video, Shield, Zap, Database, CheckCircle, 
  ArrowRight, Sparkles, TrendingUp, Users, 
  Lock, Eye, AlertTriangle, Award
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id^="section-"]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const Particles = () => (
    <div style={styles.particles}>
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const StatCard = ({ end, label, icon: Icon }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [end]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={styles.statCard}
      >
        <Icon style={styles.statIcon} />
        <div style={styles.statNumber}>
          {count.toLocaleString()}+
        </div>
        <div style={styles.statLabel}>{label}</div>
      </motion.div>
    );
  };

  const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      style={styles.featureCard}
    >
      <div style={styles.featureCardContent}>
        <div style={styles.featureIconBox}>
          <Icon style={styles.featureIcon} />
        </div>
        <h3 style={styles.featureTitle}>{title}</h3>
        <p style={styles.featureDescription}>{description}</p>
      </div>
    </motion.div>
  );

  const StepCard = ({ number, title, description, delay }) => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      style={styles.stepCard}
    >
      <div stylep={styles.stepNumberBox}>
        {number}
      </div>
      <div style={styles.stepContent}>
        <h3 style={styles.stepTitle}>{title}</h3>
        <p style={styles.stepDescription}>{description}</p>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <Particles />
        
        <motion.div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.badge}
          >
            <Sparkles style={styles.badgeIcon} />
            <span style={styles.badgeText}>AI-Powered Detection Technology</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={styles.mainHeading}
          >
            Detect <span style={styles.gradientText}>Deepfakes</span><br />
            With Confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={styles.subtitle}
          >
            Advanced AI technology to identify manipulated audio and video content.
            Protect yourself and your business from deepfake threats with our cutting-edge detection system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={styles.ctaContainer}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.primaryButton}
              onClick={() => navigate('/audio')}
            >
              <Mic style={styles.buttonIcon} />
              Try Audio Detector
              <ArrowRight style={styles.buttonIcon} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.secondaryButton}
              onClick={() => navigate('/video')}
            >
              <Video style={styles.buttonIcon} />
              Try Video Detector
              <ArrowRight style={styles.buttonIcon} />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={styles.trustBadges}
          >
            <span style={styles.trustBadge}>
              <Shield style={styles.trustIcon} /> 99.9% Accuracy
            </span>
            <span style={styles.trustBadge}>
              <Zap style={styles.trustIcon} /> Real-time Analysis
            </span>
            <span style={styles.trustBadge}>
              <Lock style={styles.trustIcon} /> Enterprise Security
            </span>
          </motion.div>
        </motion.div>

        {/* IMPROVED SCROLL INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={styles.scrollIndicator}
          onClick={() => {
            document.querySelector('#section-stats')?.scrollIntoView({ behavior: 'smooth' });
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={styles.scrollMouse}>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={styles.scrollDot}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="section-stats" style={styles.statsSection}>
        <div style={styles.sectionContainer}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionTitle}
          >
            Trusted by Thousands Worldwide
          </motion.h2>
          <div style={styles.statsGrid}>
            <StatCard end={50000} label="Deepfakes Detected" icon={Eye} />
            <StatCard end={10000} label="Active Users" icon={Users} />
            <StatCard end={99} label="Accuracy Rate" icon={TrendingUp} />
            <StatCard end={24} label="Support Available" icon={Award} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="section-features" style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionHeader}
          >
            <h2 style={styles.sectionTitle}>Powerful Features</h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to detect and analyze deepfake content
            </p>
          </motion.div>

          <div style={styles.featuresGrid}>
            <FeatureCard
              icon={Mic}
              title="Audio Analysis"
              description="Detect manipulated voice recordings with advanced spectral analysis and AI-powered voice authentication."
              delay={0.1}
            />
            <FeatureCard
              icon={Video}
              title="Video Detection"
              description="Identify face-swap and synthetic media in videos using deep learning facial recognition technology."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Processing"
              description="Get instant results with our optimized detection algorithms that process media in seconds."
              delay={0.3}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Bank-level encryption and secure processing ensure your sensitive media stays protected."
              delay={0.4}
            />
            <FeatureCard
              icon={Database}
              title="Evidence Logging"
              description="Comprehensive reports with timestamps, confidence scores, and detailed forensic analysis."
              delay={0.5}
            />
            <FeatureCard
              icon={CheckCircle}
              title="Confidence Reports"
              description="Clear, actionable insights with percentage-based confidence scores and visual indicators."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="section-howitworks" style={styles.howItWorksSection}>
        <div style={styles.sectionContainer}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.sectionHeader}
          >
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <p style={styles.sectionSubtitle}>
              Simple, fast, and accurate deepfake detection in three steps
            </p>
          </motion.div>

          <div style={styles.stepsContainer}>
            <StepCard
              number={1}
              title="Upload Your Media"
              description="Drag and drop or select audio/video files from your device. We support all major formats including MP3, WAV, MP4, and AVI."
              delay={0.1}
            />
            <StepCard
              number={2}
              title="AI Analysis"
              description="Our advanced neural networks analyze your media using multiple detection algorithms including facial recognition, voice biometrics, and frame consistency checks."
              delay={0.3}
            />
            <StepCard
              number={3}
              title="Get Results"
              description="Receive a comprehensive report with confidence scores, visual indicators, and detailed evidence of manipulation if detected."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={styles.ctaBox}
        >
          <AlertTriangle style={styles.ctaIcon} />
          <h2 style={styles.ctaTitle}>Ready to Protect Against Deepfakes?</h2>
          <p style={styles.ctaText}>
            Join thousands of users who trust our AI-powered detection system
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.ctaButton}
            onClick={() => navigate('/audio')}
          >
            Get Started Free <ArrowRight style={styles.buttonIcon} />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// STYLES — UPDATED WITH IMPROVED SCROLL INDICATOR
// ──────────────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(to bottom, #0f172a, #1e3a8a20, #0f172a)',
    color: 'white',
    overflow: 'hidden',
  },
  
  heroSection: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    overflow: 'hidden',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    background: 'rgba(59, 130, 246, 0.2)',
    borderRadius: '50%',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 1rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '2rem',
  },
  badgeIcon: {
    width: '1rem',
    height: '1rem',
    color: '#fbbf24',
  },
  badgeText: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  mainHeading: {
    fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.1,
  },
  gradientText: {
    background: 'linear-gradient(to right, #60a5fa, #a78bfa, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#9ca3af',
    maxWidth: '800px',
    margin: '0 auto 2.5rem',
    lineHeight: 1.7,
  },
  ctaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.2s',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  buttonIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  trustBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  trustIcon: {
    width: '1rem',
    height: '1rem',
    color: '#60a5fa',
  },

  // IMPROVED SCROLL INDICATOR
  scrollIndicator: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    cursor: 'pointer',
  },
  scrollMouse: {
    width: '18px',
    height: '28px',
    border: '1.5px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollDot: {
    position: 'absolute',
    top: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '3px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '2px',
  },

  statsSection: {
    padding: '6rem 1rem',
    width: '100%',
    background: 'rgba(15, 23, 42, 0.5)',
  },
  sectionContainer: {
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '0 1rem',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '3rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    width: '100%',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    width: '2rem',
    height: '2rem',
    marginBottom: '0.75rem',
    color: '#60a5fa',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    color: '#9ca3af',
    marginTop: '0.5rem',
    textAlign: 'center',
  },

  featuresSection: {
    padding: '6rem 1rem',
    width: '100%',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#9ca3af',
    marginTop: '1rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%',
  },
  featureCard: {
    position: 'relative',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
    backdropFilter: 'blur(16px)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  featureCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  featureIconBox: {
    width: '3.5rem',
    height: '3.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  featureIcon: {
    width: '1.75rem',
    height: '1.75rem',
    color: 'white',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  featureDescription: {
    color: '#9ca3af',
    lineHeight: 1.6,
  },

  howItWorksSection: {
    padding: '6rem 1rem',
    width: '100%',
    background: 'rgba(15, 23, 42, 0.5)',
  },
  stepsContainer: {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  stepCard: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  stepNumberBox: {
    flexShrink: 0,
    width: '4rem',
    height: '4rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  stepDescription: {
    color: '#9ca3af',
    lineHeight: 1.6,
  },

  ctaSection: {
    padding: '6rem 1rem',
    width: '100%',
  },
  ctaBox: {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto',
    padding: '4rem 2rem',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
    backdropFilter: 'blur(16px)',
    borderRadius: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
  },
  ctaIcon: {
    width: '4rem',
    height: '4rem',
    color: '#fbbf24',
    margin: '0 auto 1.5rem',
  },
  ctaTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.125rem',
    color: '#9ca3af',
    marginBottom: '2rem',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.2s',
  },
};

export default Home;