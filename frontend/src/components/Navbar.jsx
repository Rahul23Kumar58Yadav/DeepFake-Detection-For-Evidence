import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Mic, Video, User, LogIn, LogOut, Menu, X, 
  Shield, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth(); // Get real user data
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Set active link based on current URL path
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/' || path === '/home') {
      setActiveLink('home');
    } else if (path.includes('/audio')) {
      setActiveLink('audio');
    } else if (path.includes('/video')) {
      setActiveLink('video');
    } else if (path.includes('/profile')) {
      setActiveLink('profile');
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsMobileMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isUserMenuOpen && !e.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home, id: 'home' },
    { name: 'Audio Detector', path: '/audio', icon: Mic, id: 'audio' },
    { name: 'Video Detector', path: '/video', icon: Video, id: 'video' },
    { name: 'Profile', path: '/profile', icon: User, id: 'profile' },
  ];

  const handleLinkClick = (id, e) => {
    e.preventDefault();
    setActiveLink(id);
    setIsMobileMenuOpen(false);
    
    const link = navLinks.find(l => l.id === id);
    if (link) {
      navigate(link.path);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      style={{
        ...styles.navbar,
        background: isScrolled 
          ? 'rgba(15, 23, 42, 0.9)' 
          : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(10px)',
        boxShadow: isScrolled 
          ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
          : 'none',
      }}
    >
      <div style={styles.container}>
        {/* Logo */}
        <motion.a
          href="/"
          style={styles.logo}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={styles.logoIcon}
          >
            <Shield style={styles.logoSvg} />
          </motion.div>
          <div style={styles.logoText}>
            <span style={styles.logoName}>DeepGuard</span>
            <span style={styles.logoTagline}>AI Detection</span>
          </div>
        </motion.a>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={styles.desktopNav}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeLink === link.id;
              
              return (
                <motion.a
                  key={link.id}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.id, e)}
                  style={styles.navLink}
                  whileHover={{ y: -2 }}
                >
                  <Icon style={{
                    ...styles.linkIcon,
                    color: isActive ? '#3b82f6' : '#94a3b8'
                  }} />
                  <span style={{
                    ...styles.linkText,
                    color: isActive ? 'white' : '#cbd5e1'
                  }}>
                    {link.name}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      style={styles.activeIndicator}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              );
            })}
          </div>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
          <div style={styles.desktopActions}>
            {isAuthenticated && user ? (
              // User Menu (Desktop)
              <div className="user-menu-container" style={styles.userMenuContainer}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={styles.userButton}
                >
                  <div style={styles.userAvatar}>
                    {getUserInitials(user.name)}
                  </div>
                  <span style={styles.userName}>{user.name}</span>
                  <motion.div
                    animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown style={styles.chevronIcon} />
                  </motion.div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={styles.dropdownMenu}
                    >
                      <div style={styles.dropdownHeader}>
                        <div style={styles.dropdownAvatar}>
                          {getUserInitials(user.name)}
                        </div>
                        <div style={styles.dropdownUserInfo}>
                          <div style={styles.dropdownUserName}>{user.name}</div>
                          <div style={styles.dropdownUserEmail}>{user.email}</div>
                        </div>
                      </div>
                      
                      <div style={styles.dropdownDivider} />
                      
                      <motion.a
                        href="/profile"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        style={styles.dropdownItem}
                      >
                        <User style={styles.dropdownItemIcon} />
                        <span>Profile</span>
                      </motion.a>
                      
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={handleLogout}
                        style={{...styles.dropdownItem, ...styles.logoutItem}}
                      >
                        <LogOut style={{...styles.dropdownItemIcon, color: '#ef4444'}} />
                        <span style={{color: '#ef4444'}}>Logout</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Login Button (Desktop)
              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={styles.loginButton}
              >
                <LogIn style={styles.buttonIcon} />
                <span>Login</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.mobileMenuButton}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X style={styles.menuIcon} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu style={styles.menuIcon} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.mobileMenu}
          >
            <div style={styles.mobileMenuContent}>
              {/* User Info (Mobile) */}
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={styles.mobileUserInfo}
                >
                  <div style={styles.mobileUserAvatar}>
                    {getUserInitials(user.name)}
                  </div>
                  <div style={styles.mobileUserDetails}>
                    <div style={styles.mobileUserName}>{user.name}</div>
                    <div style={styles.mobileUserEmail}>{user.email}</div>
                  </div>
                </motion.div>
              )}

              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = activeLink === link.id;
                
                return (
                  <motion.a
                    key={link.id}
                    href={link.path}
                    onClick={(e) => handleLinkClick(link.id, e)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (user ? index + 1 : index) * 0.1 }}
                    style={{
                      ...styles.mobileNavLink,
                      background: isActive 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'transparent',
                      borderLeft: isActive 
                        ? '3px solid #3b82f6' 
                        : '3px solid transparent',
                    }}
                  >
                    <Icon style={{
                      ...styles.mobileLinkIcon,
                      color: isActive ? '#3b82f6' : '#94a3b8'
                    }} />
                    <span style={{
                      ...styles.mobileLinkText,
                      color: isActive ? 'white' : '#cbd5e1'
                    }}>
                      {link.name}
                    </span>
                  </motion.a>
                );
              })}

              {/* Mobile Auth Button */}
              {isAuthenticated && user ? (
                <motion.button
                  onClick={handleLogout}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  style={styles.mobileLogoutButton}
                >
                  <LogOut style={styles.buttonIcon} />
                  <span>Logout</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleLogin}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  style={styles.mobileLoginButton}
                >
                  <LogIn style={styles.buttonIcon} />
                  <span>Login</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
  },
  
  // Logo
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
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
  
  // Desktop Navigation
  desktopNav: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  linkIcon: {
    width: '18px',
    height: '18px',
    transition: 'color 0.3s ease',
  },
  linkText: {
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'color 0.3s ease',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '2px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    borderRadius: '2px',
  },
  
  // Desktop Actions
  desktopActions: {
    display: 'flex',
    gap: '1rem',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
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

  // User Menu (Desktop)
  userMenuContainer: {
    position: 'relative',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
  },

  // Dropdown Menu
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    right: 0,
    minWidth: '240px',
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
  },
  dropdownAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0,
  },
  dropdownUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownUserName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownUserEmail: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0.5rem 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  dropdownItemIcon: {
    width: '18px',
    height: '18px',
    color: '#94a3b8',
  },
  logoutItem: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '0.5rem',
  },
  
  // Mobile Menu Button
  mobileMenuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: 'white',
  },
  menuIcon: {
    width: '24px',
    height: '24px',
  },
  
  // Mobile Menu
  mobileMenu: {
    overflow: 'hidden',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  mobileMenuContent: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '10px',
    marginBottom: '0.5rem',
  },
  mobileUserAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0,
  },
  mobileUserDetails: {
    flex: 1,
    minWidth: 0,
  },
  mobileUserName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mobileUserEmail: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  mobileLinkIcon: {
    width: '20px',
    height: '20px',
  },
  mobileLinkText: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  mobileLoginButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem',
    marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)',
  },
  mobileLogoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem',
    marginTop: '0.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default Navbar;