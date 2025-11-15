import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Mail, Phone, MapPin, Github, Twitter, 
  Linkedin, Facebook, Heart, Sun, Moon,
  Sparkles, Lock, Zap, CheckCircle
} from 'lucide-react';

const Footer = () => {
  const [theme, setTheme] = useState('dark');
  const [email, setEmail] = useState('');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleNewsletterSubmit = () => {
    if (email && /\S+@\S+\.\S+/.test(email)) {
      console.log('Newsletter signup:', email);
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    } else {
      alert('Please enter a valid email address');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewsletterSubmit();
    }
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Audio Detector', path: '/audio' },
      { name: 'Video Detector', path: '/video' },
      { name: 'API Access', path: '/api' },
      { name: 'Pricing', path: '/pricing' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
    ],
    resources: [
      { name: 'Documentation', path: '/docs' },
      { name: 'Help Center', path: '/help' },
      { name: 'Community', path: '/community' },
      { name: 'Status', path: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Security', path: '/security' },
    ],
  };

  const socialLinks = [
    { icon: Github, url: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
  ];

  const features = [
    { icon: Lock, text: '256-bit Encryption' },
    { icon: Zap, text: 'Real-time Analysis' },
    { icon: CheckCircle, text: '99.9% Accuracy' },
  ];

  return (
    <footer style={styles.footer}>
      {/* Gradient Divider */}
      <div style={styles.gradientDivider}>
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={styles.gradientLine}
        />
      </div>

      <div style={styles.container}>
        {/* Top Section */}
        <div style={styles.topSection}>
          {/* Brand Column */}
          <div style={styles.brandColumn}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={styles.footerLogo}
            >
              <div style={styles.logoIcon}>
                <Shield style={styles.logoSvg} />
              </div>
              <div style={styles.logoText}>
                <span style={styles.logoName}>DeepGuard</span>
                <span style={styles.logoTagline}>AI Detection</span>
              </div>
            </motion.div>
            <p style={styles.brandDescription}>
              Advanced AI-powered deepfake detection technology. 
              Protect yourself and your business from manipulated media.
            </p>

            {/* Trust Badges */}
            <div style={styles.trustBadges}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -3 }}
                    style={styles.trustBadge}
                  >
                    <Icon style={styles.trustIcon} />
                    <span style={styles.trustText}>{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Links */}
            <div style={styles.socialLinks}>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    style={styles.socialLink}
                    aria-label={social.label}
                  >
                    <Icon style={styles.socialIcon} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div style={styles.linksGrid}>
            {/* Product */}
            <div style={styles.linkColumn}>
              <h4 style={styles.columnTitle}>Product</h4>
              <ul style={styles.linkList}>
                {footerLinks.product.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    style={styles.linkItem}
                  >
                    <a href={link.path} style={styles.link}>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div style={styles.linkColumn}>
              <h4 style={styles.columnTitle}>Company</h4>
              <ul style={styles.linkList}>
                {footerLinks.company.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    style={styles.linkItem}
                  >
                    <a href={link.path} style={styles.link}>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div style={styles.linkColumn}>
              <h4 style={styles.columnTitle}>Resources</h4>
              <ul style={styles.linkList}>
                {footerLinks.resources.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    style={styles.linkItem}
                  >
                    <a href={link.path} style={styles.link}>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div style={styles.linkColumn}>
              <h4 style={styles.columnTitle}>Legal</h4>
              <ul style={styles.linkList}>
                {footerLinks.legal.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    style={styles.linkItem}
                  >
                    <a href={link.path} style={styles.link}>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div style={styles.newsletterColumn}>
            <h4 style={styles.columnTitle}>Stay Updated</h4>
            <p style={styles.newsletterText}>
              Subscribe to our newsletter for the latest updates on deepfake detection.
            </p>
            <div style={styles.newsletterForm}>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={styles.emailInput}
                />
              </div>
              <motion.button
                onClick={handleNewsletterSubmit}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={styles.subscribeButton}
              >
                <Sparkles style={styles.buttonIcon} />
                <span>Subscribe</span>
              </motion.button>
            </div>

            {/* Theme Toggle */}
            <div style={styles.themeToggleSection}>
              <span style={styles.themeLabel}>Theme:</span>
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.themeToggle}
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                  style={styles.themeIconWrapper}
                >
                  {theme === 'dark' ? (
                    <Moon style={styles.themeIcon} />
                  ) : (
                    <Sun style={styles.themeIcon} />
                  )}
                </motion.div>
                <span style={styles.themeText}>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          <div style={styles.copyright}>
            <span style={styles.copyrightText}>
              © {currentYear} DeepGuard AI. All rights reserved.
            </span>
            <span style={styles.madeWith}>
              Made with <Heart style={styles.heartIcon} /> for a safer digital world
            </span>
          </div>

          {/* Contact Info */}
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <Mail style={styles.contactIcon} />
              <a href="mailto:support@deepguard.ai" style={styles.contactLink}>
                support@deepguard.ai
              </a>
            </div>
            <div style={styles.contactItem}>
              <Phone style={styles.contactIcon} />
              <a href="tel:+1234567890" style={styles.contactLink}>
          9652245820
              </a>
            </div>
            <div style={styles.contactItem}>
              <MapPin style={styles.contactIcon} />
              <span style={styles.contactText}>Haridwar, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background particles */}
      <div style={styles.particles}>
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 30 - 15],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    position: 'relative',
    background: 'linear-gradient(to bottom, #0f172a, #020617)',
    color: 'white',
    overflow: 'hidden',
  },
  gradientDivider: {
    height: '3px',
    width: '100%',
    overflow: 'hidden',
  },
  gradientLine: {
    height: '100%',
    width: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
    backgroundSize: '200% 100%',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '4rem 1.5rem 2rem',
    position: 'relative',
    zIndex: 10,
  },
  particles: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: '3px',
    height: '3px',
    background: 'rgba(59, 130, 246, 0.3)',
    borderRadius: '50%',
  },
  
  // Top Section
  topSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
  },
  
  // Brand Column
  brandColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)',
  },
  logoSvg: {
    width: '24px',
    height: '24px',
    color: 'white',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 1,
  },
  logoTagline: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    letterSpacing: '0.5px',
  },
  brandDescription: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    maxWidth: '350px',
  },
  trustBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  trustIcon: {
    width: '16px',
    height: '16px',
    color: '#3b82f6',
  },
  trustText: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
  },
  socialLinks: {
    display: 'flex',
    gap: '0.75rem',
  },
  socialLink: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  socialIcon: {
    width: '20px',
    height: '20px',
    color: '#94a3b8',
  },
  
  // Links Grid
  linksGrid: {
    display: 'contents',
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  columnTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  linkItem: {
    listStyle: 'none',
  },
  link: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    display: 'inline-block',
  },
  
  // Newsletter Column
  newsletterColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  newsletterText: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  newsletterForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
  },
  inputIcon: {
    width: '18px',
    height: '18px',
    color: '#64748b',
    flexShrink: 0,
  },
  emailInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '0.95rem',
  },
  subscribeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)',
  },
  buttonIcon: {
    width: '18px',
    height: '18px',
  },
  
  // Theme Toggle
  themeToggleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  themeLabel: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  themeIconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  themeIcon: {
    width: '18px',
    height: '18px',
    color: '#fbbf24',
  },
  themeText: {
    color: '#cbd5e1',
  },
  
  // Divider
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '2rem 0',
  },
  
  // Bottom Section
  bottomSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  copyright: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  copyrightText: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  madeWith: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  heartIcon: {
    width: '14px',
    height: '14px',
    color: '#ef4444',
  },
  contactInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  contactIcon: {
    width: '16px',
    height: '16px',
    color: '#64748b',
  },
  contactLink: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  contactText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
};

export default Footer;