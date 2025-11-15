import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Chrome } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = ({ onLogin }) => {
  const {login} = useAuth()
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState('');

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setApiError('');

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        login(data.user, data.token);

        navigate(from, { replace: true });
      } catch (error) {
        console.error('Login error:', error);
        setApiError(error.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleGoogleSignIn = () => {
    setApiError('Google Sign In will be implemented soon');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={styles.content}
      >
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={styles.decorativeCircle1}
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={styles.decorativeCircle2}
        />

        <motion.div variants={itemVariants} style={styles.card}>
          <motion.div variants={itemVariants} style={styles.header}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              style={styles.iconWrapper}
            >
              <Sparkles style={styles.headerIcon} />
            </motion.div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to continue to your account</p>
          </motion.div>

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.apiError}
            >
              {apiError}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              style={styles.googleButton}
            >
              <Chrome style={styles.googleIcon} />
              <span>Continue with Google</span>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or sign in with email</span>
            <span style={styles.dividerLine}></span>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <motion.div
                animate={{ scale: focusedField === 'email' ? 1.02 : 1 }}
                style={styles.inputWrapper}
              >
                <Mail style={{
                  ...styles.inputIcon,
                  color: focusedField === 'email' ? '#3b82f6' : '#64748b'
                }} />
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                />
              </motion.div>
              {errors.email && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.errorText}
                >
                  {errors.email}
                </motion.span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <motion.div
                animate={{ scale: focusedField === 'password' ? 1.02 : 1 }}
                style={styles.inputWrapper}
              >
                <Lock style={{
                  ...styles.inputIcon,
                  color: focusedField === 'password' ? '#3b82f6' : '#64748b'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff style={styles.eyeIcon} /> : <Eye style={styles.eyeIcon} />}
                </motion.button>
              </motion.div>
              {errors.password && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.errorText}
                >
                  {errors.password}
                </motion.span>
              )}
            </div>

            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Remember me</span>
              </label>
              <a href="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={styles.loader}
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight style={styles.buttonIcon} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} style={styles.footer}>
            <span style={styles.footerText}>Don't have an account?</span>
            <a href="/register" style={styles.footerLink}>Sign up now</a>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.trustBadge}>
          <Lock style={styles.trustIcon} />
          <span style={styles.trustText}>Secured with 256-bit encryption</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    background: 'rgba(59, 130, 246, 0.3)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '16px',
    marginBottom: '1rem',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  },
  headerIcon: { width: '32px', height: '32px', color: 'white' },
  title: { fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' },
  subtitle: { fontSize: '0.95rem', color: '#94a3b8' },
  apiError: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  googleIcon: { width: '20px', height: '20px' },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
  },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' },
  dividerText: { fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '0.25rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    transition: 'all 0.3s ease',
  },
  inputIcon: { width: '20px', height: '20px', flexShrink: 0, transition: 'color 0.3s ease' },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'white',
    fontSize: '1rem',
    padding: '0.25rem 0',
  },
  eyeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  eyeIcon: { width: '20px', height: '20px', color: '#64748b' },
  errorText: { fontSize: '0.85rem', color: '#ef4444', marginTop: '0.25rem' },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  checkboxText: { fontSize: '0.9rem', color: '#cbd5e1' },
  forgotLink: {
    fontSize: '0.9rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 500,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  },
  buttonIcon: { width: '20px', height: '20px' },
  loader: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  footerText: { fontSize: '0.95rem', color: '#94a3b8' },
  footerLink: {
    fontSize: '0.95rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  trustIcon: { width: '16px', height: '16px', color: '#10b981' },
  trustText: { fontSize: '0.85rem', color: '#64748b' },
};

export default Login;