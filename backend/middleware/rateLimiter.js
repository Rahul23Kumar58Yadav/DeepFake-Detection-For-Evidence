// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 requests per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Profile endpoint rate limiter (less strict)
const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many profile requests, please try again later.' },
});

module.exports = {
  apiLimiter,
  authLimiter,
  profileLimiter,
};