import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: '#ef4444' },
      { strength: 2, label: 'Fair', color: '#f59e0b' },
      { strength: 3, label: 'Good', color: '#10b981' },
      { strength: 4, label: 'Strong', color: '#059669' }
    ];
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password');
        }

        setIsSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Reset password error:', error);
        setErrors({ general: error.message || 'Failed to reset password. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
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

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  if (tokenError) {
    return (
      <div style={styles.container}>
        <div style={styles.background}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                ...styles.particle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
              }}
              animate={{
                y: [0, Math.random() * 60 - 30],
                opacity: [0.15, 0.4, 0.15],
                scale: [1, 1.4, 1],
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.errorCard}
        >
          <AlertCircle style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Invalid Reset Link</h2>
          <p style={styles.errorMessage}>{tokenError}</p>
          <motion.a
            href="/forgot-password"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.errorButton}
          >
            Request New Reset Link
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
            }}
            animate={{
              y: [0, Math.random() * 60 - 30],
              opacity: [0.15, 0.4, 0.15],
              scale: [1, 1.4, 1],
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
          animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={styles.decorativeGradient1}
        />
        <motion.div
          animate={{ y: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={styles.decorativeGradient2}
        />

        <motion.div variants={itemVariants} style={styles.card}>
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={itemVariants} style={styles.header}>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    style={styles.iconWrapper}
                  >
                    <Key style={styles.headerIcon} />
                  </motion.div>
                  <h1 style={styles.title}>Reset Password</h1>
                  <p style={styles.subtitle}>
                    Enter your new password below
                  </p>
                </motion.div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.generalError}
                  >
                    {errors.general}
                  </motion.div>
                )}

                <motion.form
                  variants={itemVariants}
                  onSubmit={handleSubmit}
                  style={styles.form}
                >
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>New Password</label>
                    <motion.div
                      animate={{ scale: focusedField === 'newPassword' ? 1.02 : 1 }}
                      style={styles.inputWrapper}
                    >
                      <Lock style={{
                        ...styles.inputIcon,
                        color: focusedField === 'newPassword' ? '#3b82f6' : '#64748b'
                      }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('newPassword')}
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

                    {formData.newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={styles.strengthContainer}
                      >
                        <div style={styles.strengthBar}>
                          {[1, 2, 3, 4].map((level) => (
                            <motion.div
                              key={level}
                              initial={{ scaleX: 0 }}
                              animate={{
                                scaleX: passwordStrength.strength >= level ? 1 : 0,
                                backgroundColor: passwordStrength.color
                              }}
                              transition={{ duration: 0.3 }}
                              style={styles.strengthSegment}
                            />
                          ))}
                        </div>
                        <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </motion.div>
                    )}

                    {errors.newPassword && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.errorText}
                      >
                        {errors.newPassword}
                      </motion.span>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <motion.div
                      animate={{ scale: focusedField === 'confirmPassword' ? 1.02 : 1 }}
                      style={styles.inputWrapper}
                    >
                      <Lock style={{
                        ...styles.inputIcon,
                        color: focusedField === 'confirmPassword' ? '#3b82f6' : '#64748b'
                      }} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        style={styles.input}
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                      >
                        {showConfirmPassword ? <EyeOff style={styles.eyeIcon} /> : <Eye style={styles.eyeIcon} />}
                      </motion.button>
                    </motion.div>
                    {errors.confirmPassword && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.errorText}
                      >
                        {errors.confirmPassword}
                      </motion.span>
                    )}
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
                        <span>Reset Password</span>
                        <ArrowRight style={styles.buttonIcon} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                variants={successVariants}
                initial="hidden"
                animate="visible"
                style={styles.successContainer}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  style={styles.successIconWrapper}
                >
                  <CheckCircle style={styles.successIcon} />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    style={styles.successRing}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={styles.successContent}
                >
                  <h2 style={styles.successTitle}>Password Reset Successful!</h2>
                  <p style={styles.successMessage}>
                    Your password has been successfully reset.
                  </p>
                  <p style={styles.successNote}>
                    Redirecting you to login page...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
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
    background: 'rgba(59, 130, 246, 0.25)',
    borderRadius: '50%',
    filter: 'blur(1px)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
  },
  decorativeGradient1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '320px',
    height: '320px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  decorativeGradient2: {
    position: 'absolute',
    bottom: '-140px',
    left: '-140px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '18px',
    marginBottom: '1.5rem',
    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.35)',
  },
  headerIcon: { width: '36px', height: '36px', color: 'white' },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  generalError: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
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
  inputIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    transition: 'color 0.3s ease',
  },
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
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    display: 'flex',
    gap: '2px',
    overflow: 'hidden',
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    transformOrigin: 'left',
    borderRadius: '2px',
  },
  strengthLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    minWidth: '60px',
    textAlign: 'right',
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '1rem',
    marginTop: '0.5rem',
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
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1rem 0',
  },
  successIconWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    color: '#10b981',
    position: 'relative',
    zIndex: 2,
  },
  successRing: {
    position: 'absolute',
    inset: 0,
    border: '3px solid #10b981',
    borderRadius: '50%',
    opacity: 0.3,
  },
  successContent: {
    marginBottom: '2rem',
  },
  successTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.75rem',
  },
  successMessage: {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  },
  successNote: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '1rem',
  },
  errorCard: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem 2rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    maxWidth: '480px',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    color: '#ef4444',
    margin: '0 auto 1.5rem',
  },
  errorTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem',
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  errorButton: {
    display: 'inline-block',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  },
};

export default ResetPassword