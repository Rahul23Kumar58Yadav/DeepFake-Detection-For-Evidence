import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login after 2 seconds
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={styles.card}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          style={styles.iconWrapper}
        >
          <LogOut style={styles.icon} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={styles.ring}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={styles.content}
        >
          <h2 style={styles.title}>Logging Out</h2>
          <p style={styles.message}>
            You have been successfully logged out.
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={styles.loader}
          />
          <p style={styles.note}>
            Redirecting to login page...
          </p>
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
  card: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem 2.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '100%',
  },
  iconWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
  },
  icon: {
    width: '60px',
    height: '60px',
    color: '#3b82f6',
    position: 'relative',
    zIndex: 2,
  },
  ring: {
    position: 'absolute',
    inset: 0,
    border: '3px solid #3b82f6',
    borderRadius: '50%',
    opacity: 0.3,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
  },
  message: {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '1rem',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(59, 130, 246, 0.2)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    marginTop: '0.5rem',
  },
  note: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '0.5rem',
  },
};

export default Logout;