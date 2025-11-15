import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  X,
  Save,
  Upload,
  Download,
  Trash2,
  FileAudio,
  FileVideo,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Eye,
  Lock,
  Loader,
  LogOut,
  MapPin,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser, getAuthHeaders } = useAuth();
  const hasFetchedRef = useRef(false);

  // User Data - Initialize with authUser data
  const [userData, setUserData] = useState(authUser);
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  // 2. Fetch data + listen for refresh
  useEffect(() => {
    if (!authUser) return;

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUserData();
    }

    const handleRefresh = () => {
      console.log("Profile refresh triggered");
      fetchUserData();
    };

    window.addEventListener("profile-refresh", handleRefresh);

    return () => {
      window.removeEventListener("profile-refresh", handleRefresh);
    };
  }, [authUser, navigate]);
  const stats =
    activityData.length > 0
      ? {
          totalScans: activityData.length,
          deepfakesDetected: activityData.filter((i) => i.result === "deepfake")
            .length,
          authenticFiles: activityData.filter((i) => i.result === "authentic")
            .length,
          avgConfidence: (
            activityData.reduce((sum, i) => sum + i.confidence, 0) /
            activityData.length
          ).toFixed(1),
        }
      : {
          totalScans: 0,
          deepfakesDetected: 0,
          authenticFiles: 0,
          avgConfidence: "0",
        };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const headers = getAuthHeaders();

      if (!headers.Authorization) {
        logout();
        navigate("/login");
        return;
      }

      // Fetch user profile
      const userResponse = await fetch(`${API_URL}/auth/profile`, {
        headers,
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        if (userResponse.status === 429) {
          throw new Error(
            "Too many requests. Please wait a moment and refresh."
          );
        }
        throw new Error("Failed to fetch user data");
      }

      const user = await userResponse.json();

      setUserData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(user)) {
          return user;
        }
        return prevData;
      });

      setEditFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });
      try {
      const detectionsResponse = await fetch(`${API_URL}/detections/history`, {
        headers,
      });

      if (detectionsResponse.ok) {
        const detectionsData = await detectionsResponse.json();
        
        const formattedData = detectionsData.map((item) => ({
          id: item._id,
          fileName: item.fileName,
          type: item.fileType,
          result: item.result === "REAL" ? "authentic" : 
                  item.result === "FAKE" ? "deepfake" : "uncertain",
          confidence: item.confidence,
          timestamp: item.createdAt,
          fileSize: typeof item.fileSize === "number" 
            ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` 
            : item.fileSize,
          userId: item.userId,
        }));

        setActivityData(formattedData); // ✅ This sets the state
      }
    } catch (analysisError) {
      console.warn("Could not fetch detections:", analysisError);
      setActivityData([]);
    }

    setIsLoading(false);
  } catch (err) {
    console.error("Error fetching data:", err);
    setError(err.message || "Failed to load profile data");
    setIsLoading(false);
  }
};

// ✅ Handlers start here - NO formattedData mapping
const handleEditProfile = () => {
  setEditFormData({
    name: userData.name || "",
    email: userData.email || "",
    phone: userData.phone || "",
    location: userData.location || "",
  });
  setIsEditModalOpen(true);
};

      
   
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update local state only
      setUserData(updatedUser);

      // Update auth context
      updateUser(updatedUser);

      setIsEditModalOpen(false);
      setIsSaving(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleDownload = async (activity) => {
    alert("Download feature coming soon!");
  };

  const handleDeleteClick = (activity) => {
    setItemToDelete(activity);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        // ✅ FIXED: Use /api/detections endpoint
        const response = await fetch(
          `${API_URL}/detections/${itemToDelete.id}`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          setActivityData((prev) =>
            prev.filter((item) => item.id !== itemToDelete.id)
          );
          setIsDeleteConfirmOpen(false);
          setItemToDelete(null);
          console.log("✅ Detection deleted successfully");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete");
        }
      } catch (err) {
        console.error("Error deleting detection:", err);
        alert(`Failed to delete record: ${err.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarText = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "white",
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  // Loading State
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader style={styles.loadingIcon} />
        </motion.div>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Error Loading Profile</h2>
        <p style={styles.errorMessage}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            hasFetchedRef.current = false;
            fetchUserData();
          }}
          style={styles.retryButton}
        >
          Retry
        </motion.button>
      </div>
    );
  }

  // No user data
  if (!userData) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.background}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              opacity: [0.1, 0.3, 0.1],
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
        {/* Header Section */}
        <motion.div variants={itemVariants} style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>My Profile</h1>
            <p style={styles.pageSubtitle}>
              Manage your account and view detection history
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut style={styles.logoutIcon} />
            <span>Logout</span>
          </motion.button>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants} style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.profileLeft}>
              <motion.div whileHover={{ scale: 1.05 }} style={styles.avatar}>
                <div style={avatarText}>{getUserInitials(userData.name)}</div>
              </motion.div>
              <div style={styles.profileInfo}>
                <h2 style={styles.userName}>{userData.name}</h2>
                <div style={styles.infoRow}>
                  <Mail style={styles.infoIcon} />
                  <span style={styles.infoText}>{userData.email}</span>
                </div>
                {userData.phone && (
                  <div style={styles.infoRow}>
                    <Phone style={styles.infoIcon} />
                    <span style={styles.infoText}>{userData.phone}</span>
                  </div>
                )}
                {userData.location && (
                  <div style={styles.infoRow}>
                    <MapPin style={styles.infoIcon} />
                    <span style={styles.infoText}>{userData.location}</span>
                  </div>
                )}
                <div style={styles.infoRow}>
                  <Calendar style={styles.infoIcon} />
                  <span style={styles.infoText}>
                    Joined{" "}
                    {formatJoinDate(
                      userData.createdAt || userData.joinDate || new Date()
                    )}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditProfile}
              style={styles.editButton}
            >
              <Edit2 style={styles.editIcon} />
              <span>Edit Profile</span>
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <motion.div whileHover={{ y: -5 }} style={styles.statCard}>
              <Upload style={styles.statIcon} />
              <div style={styles.statValue}>{stats.totalScans}</div>
              <div style={styles.statLabel}>Total Scans</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              style={{ ...styles.statCard, ...styles.statCardDanger }}
            >
              <AlertCircle style={styles.statIconDanger} />
              <div style={styles.statValue}>{stats.deepfakesDetected}</div>
              <div style={styles.statLabel}>Deepfakes Found</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              style={{ ...styles.statCard, ...styles.statCardSuccess }}
            >
              <CheckCircle style={styles.statIconSuccess} />
              <div style={styles.statValue}>{stats.authenticFiles}</div>
              <div style={styles.statLabel}>Authentic Files</div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} style={styles.statCard}>
              <TrendingUp style={styles.statIcon} />
              <div style={styles.statValue}>{stats.avgConfidence}%</div>
              <div style={styles.statLabel}>Avg Confidence</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Activity Section */}
        <motion.div variants={itemVariants} style={styles.activitySection}>
          <div style={styles.activityHeader}>
            <h3 style={styles.sectionTitle}>Recent Activity</h3>
            <span style={styles.activityCount}>
              {activityData.length} items
            </span>
          </div>

          {activityData.length === 0 ? (
            <div style={styles.emptyState}>
              <FileAudio style={styles.emptyIcon} />
              <h4 style={styles.emptyTitle}>No Activity Yet</h4>
              <p style={styles.emptyText}>
                Start uploading files to see your detection history here
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/audio")}
                style={styles.startButton}
              >
                Start Detecting
              </motion.button>
            </div>
          ) : (
            <div style={styles.activityList}>
              {activityData.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  style={styles.activityItem}
                >
                  <div style={styles.activityLeft}>
                    <div
                      style={{
                        ...styles.fileTypeIcon,
                        background:
                          activity.type === "audio"
                            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                            : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      }}
                    >
                      {activity.type === "audio" ? (
                        <FileAudio style={styles.fileIcon} />
                      ) : (
                        <FileVideo style={styles.fileIcon} />
                      )}
                    </div>
                    <div style={styles.activityInfo}>
                      <div style={styles.fileName}>{activity.fileName}</div>
                      <div style={styles.fileDetails}>
                        <Clock style={styles.detailIcon} />
                        <span>{formatDate(activity.timestamp)}</span>
                        <span style={styles.separator}>•</span>
                        <span>{activity.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.activityRight}>
                    <div style={styles.resultBadge}>
                      <div
                        style={{
                          ...styles.resultIndicator,
                          background:
                            activity.result === "authentic"
                              ? "linear-gradient(135deg, #10b981, #059669)"
                              : activity.result === "deepfake"
                              ? "linear-gradient(135deg, #ef4444, #dc2626)"
                              : "linear-gradient(135deg, #f59e0b, #d97706)",
                        }}
                      >
                        {activity.result === "authentic" ? (
                          <CheckCircle style={styles.resultIcon} />
                        ) : activity.result === "deepfake" ? (
                          <AlertCircle style={styles.resultIcon} />
                        ) : (
                          <Eye style={styles.resultIcon} />
                        )}
                      </div>
                      <div style={styles.resultInfo}>
                        <div style={styles.resultLabel}>
                          {activity.result === "authentic"
                            ? "Authentic"
                            : activity.result === "deepfake"
                            ? "Deepfake"
                            : "Uncertain"}
                        </div>
                        <div style={styles.confidence}>
                          {activity.confidence}% confidence
                        </div>
                      </div>
                    </div>

                    <div style={styles.actions}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(activity)}
                        style={styles.actionButton}
                        title="Download Report"
                      >
                        <Download style={styles.actionIcon} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(activity)}
                        style={{
                          ...styles.actionButton,
                          ...styles.deleteButton,
                        }}
                        title="Delete"
                      >
                        <Trash2 style={styles.actionIcon} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit Profile</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => !isSaving && setIsEditModalOpen(false)}
                  style={styles.closeButton}
                  disabled={isSaving}
                >
                  <X style={styles.closeIcon} />
                </motion.button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <div style={styles.inputWrapper}>
                    <User style={styles.inputIcon} />
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      style={styles.modalInput}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <div style={styles.inputWrapper}>
                    <Mail style={styles.inputIcon} />
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      style={styles.modalInput}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <div style={styles.inputWrapper}>
                    <Phone style={styles.inputIcon} />
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      style={styles.modalInput}
                      placeholder="Enter your phone number"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Location</label>
                  <div style={styles.inputWrapper}>
                    <MapPin style={styles.inputIcon} />
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          location: e.target.value,
                        })
                      }
                      style={styles.modalInput}
                      placeholder="Enter your location"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditModalOpen(false)}
                  style={styles.cancelButton}
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  style={{
                    ...styles.saveButton,
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={styles.miniLoader}
                      >
                        <Loader style={{ width: "18px", height: "18px" }} />
                      </motion.div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save style={styles.buttonIcon} />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={styles.deleteModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.deleteIconWrapper}>
                <AlertCircle style={styles.deleteModalIcon} />
              </div>
              <h3 style={styles.deleteTitle}>Delete Detection Record?</h3>
              <p style={styles.deleteMessage}>
                Are you sure you want to delete "{itemToDelete?.fileName}"? This
                action cannot be undone.
              </p>
              <div style={styles.deleteActions}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmDelete}
                  style={styles.confirmDeleteButton}
                >
                  <Trash2 style={styles.buttonIcon} />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Styles remain the same...
const styles = {
  container: {
    minHeight: "100vh",
    background: "transparent",
    color: "white",
    paddingTop: "6rem",
    paddingBottom: "3rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    position: "relative",
  },
  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    width: "4px",
    height: "4px",
    background: "rgba(59, 130, 246, 0.3)",
    borderRadius: "50%",
  },
  content: {
    position: "relative",
    zIndex: 10,
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    paddingTop: "6rem",
  },
  loadingIcon: {
    width: "48px",
    height: "48px",
    color: "#3b82f6",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#94a3b8",
  },
  errorContainer: {
    minHeight: "100vh",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    paddingTop: "6rem",
    textAlign: "center",
  },
  errorIcon: {
    width: "64px",
    height: "64px",
    color: "#ef4444",
    marginBottom: "1rem",
  },
  errorTitle: {
    fontSize: "1.5rem",
    color: "white",
    marginBottom: "0.5rem",
  },
  errorMessage: {
    fontSize: "1rem",
    color: "#94a3b8",
    marginBottom: "2rem",
  },
  retryButton: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  header: {
    marginBottom: "2.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  pageTitle: {
    fontSize: "clamp(2rem, 5vw, 2.5rem)",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  pageSubtitle: {
    fontSize: "1.1rem",
    color: "#94a3b8",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    color: "#ef4444",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  logoutIcon: {
    width: "18px",
    height: "18px",
  },
  profileCard: {
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "2.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    marginBottom: "2rem",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2.5rem",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  profileLeft: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  userName: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  infoIcon: {
    width: "16px",
    height: "16px",
    color: "#64748b",
  },
  infoText: {
    fontSize: "0.95rem",
    color: "#94a3b8",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
  },
  editIcon: {
    width: "18px",
    height: "18px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "1.75rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    transition: "all 0.3s ease",
  },
  statCardDanger: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  statCardSuccess: {
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  statIcon: {
    width: "32px",
    height: "32px",
    color: "#3b82f6",
  },
  statIconDanger: {
    width: "32px",
    height: "32px",
    color: "#ef4444",
  },
  statIconSuccess: {
    width: "32px",
    height: "32px",
    color: "#10b981",
  },
  statValue: {
    fontSize: "2.25rem",
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    textAlign: "center",
  },
  activitySection: {
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "2.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  activityCount: {
    fontSize: "0.875rem",
    color: "#64748b",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    color: "#64748b",
    margin: "0 auto 1.5rem",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "white",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "2rem",
  },
  startButton: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    transition: "all 0.3s ease",
  },
  activityLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flex: 1,
    minWidth: "250px",
  },
  fileTypeIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileIcon: {
    width: "24px",
    height: "24px",
    color: "white",
  },
  activityInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  fileName: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "white",
  },
  fileDetails: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#64748b",
    flexWrap: "wrap",
  },
  detailIcon: {
    width: "14px",
    height: "14px",
  },
  separator: {
    color: "#475569",
  },
  activityRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  resultBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  resultIndicator: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  resultIcon: {
    width: "20px",
    height: "20px",
    color: "white",
  },
  resultInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
  },
  resultLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  confidence: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
  },
  actionButton: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  deleteButton: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  actionIcon: {
    width: "18px",
    height: "18px",
    color: "white",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: "24px",
    height: "24px",
    color: "#94a3b8",
  },
  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#cbd5e1",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
  },
  inputIcon: {
    width: "20px",
    height: "20px",
    color: "#64748b",
    flexShrink: 0,
  },
  modalInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: "1rem",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    padding: "1.5rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
  },
  buttonIcon: {
    width: "18px",
    height: "18px",
  },
  miniLoader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModal: {
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    width: "100%",
    maxWidth: "450px",
    padding: "2rem",
    textAlign: "center",
  },
  deleteIconWrapper: {
    width: "80px",
    height: "80px",
    margin: "0 auto 1.5rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "2px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalIcon: {
    width: "40px",
    height: "40px",
    color: "#ef4444",
  },
  deleteTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.75rem",
  },
  deleteMessage: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "2rem",
  },
  deleteActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  confirmDeleteButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)",
  },
};

export default Profile;
