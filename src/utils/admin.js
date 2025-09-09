import { ADMIN_CONFIG } from './constants';

/**
 * Check if the current user is an admin
 * @param {string} userEmail - The user's email address
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isAdmin = (userEmail) => {
  return userEmail === ADMIN_CONFIG.EMAIL;
};

/**
 * Get admin status for the current user
 * @param {object} user - The user object from auth
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const getAdminStatus = (user) => {
  return user ? isAdmin(user.email) : false;
};

/**
 * Get admin display name
 * @returns {string} - Admin display name
 */
export const getAdminDisplayName = () => {
  return 'Admin';
};