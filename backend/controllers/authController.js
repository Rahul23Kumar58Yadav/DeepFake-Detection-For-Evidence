// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: Send error
const sendError = (res, status, message) => res.status(status).json({ error: message });

// Register
const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return sendError(res, 400, 'All fields are required');
  if (password !== confirmPassword)
    return sendError(res, 400, 'Passwords do not match');
  if (password.length < 8)
    return sendError(res, 400, 'Password must be at least 8 characters');

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return sendError(res, 400, 'Email already registered');

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    await user.save();
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt 
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 500, 'Registration failed. Please try again.');
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return sendError(res, 400, 'Email and password are required');

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return sendError(res, 401, 'Invalid email or password');

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        location: user.location,
        lastLogin: user.lastLogin 
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Login failed. Please try again.');
  }
};

// Get Current User (Profile)
const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || '',
    location: req.user.location || '',
    createdAt: req.user.createdAt,
    lastLogin: req.user.lastLogin,
    joinDate: req.user.createdAt,
  });
};

// Update Profile (Enhanced with phone and location)
const updateProfile = async (req, res) => {
  const { name, email, phone, location } = req.body;
  
  // Validate name
  if (!name || name.trim().length < 2)
    return sendError(res, 400, 'Name must be at least 2 characters');

  // Validate email if provided
  if (email) {
    if (!/^\S+@\S+\.\S+$/.test(email))
      return sendError(res, 400, 'Valid email is required');
    
    // Check if email is already taken by another user
    if (email.toLowerCase() !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.user._id } 
      });
      if (existingUser) 
        return sendError(res, 400, 'Email already in use');
      
      req.user.email = email.toLowerCase().trim();
    }
  }

  try {
    // Update user fields
    req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    if (location !== undefined) req.user.location = location.trim();
    
    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      location: req.user.location,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    sendError(res, 500, 'Failed to update profile');
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return sendError(res, 400, 'Both passwords are required');
  if (newPassword.length < 8)
    return sendError(res, 400, 'New password must be at least 8 characters');

  const isMatch = await req.user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 401, 'Current password is incorrect');

  req.user.password = newPassword;
  await req.user.save();

  res.json({ message: 'Password changed successfully' });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, 400, 'Email is required');

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return same message (prevent enumeration)
    const resetLink = user
      ? `${process.env.CLIENT_URL}/reset-password?token=${user.generateResetToken()}`
      : null;

    if (user) {
      console.log('Password Reset Link:', resetLink);
      // TODO: Send email via nodemailer
    }

    res.json({
      message: 'If an account exists, reset instructions have been sent.',
      success: true,
      ...(process.env.NODE_ENV === 'development' && user && {
        devToken: user.generateResetToken(),
        devLink: resetLink,
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, 500, 'Failed to process request');
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return sendError(res, 400, 'Token and new password are required');
  if (newPassword.length < 8)
    return sendError(res, 400, 'Password must be at least 8 characters');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return sendError(res, 400, 'Invalid or expired reset token');
  }

  if (decoded.type !== 'password-reset')
    return sendError(res, 400, 'Invalid token type');

  try {
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, 404, 'User not found');

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully', success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 500, 'Failed to reset password');
  }
};

// Logout (client-side)
const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Delete Account
const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: 'Account deleted successfully' });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  deleteAccount,
};