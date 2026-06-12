import axiosInstance from '../api/axiosInstance';

/**
 * Authenticate user with username and password.
 * Returns JWT token and user profile (username, email, role).
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise} {token, username, email, role, message}
 * @throws {AxiosError} on 401 (invalid credentials) or network error
 */
export const login = async ({ username, password }) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

/**
 * Register new user account.
 * Returns JWT token and user profile (username, email, role).
 *
 * @param {string} username - 3-50 chars, alphanumeric + underscore/hyphen
 * @param {string} email - valid email address
 * @param {string} password - min 8 chars, uppercase, lowercase, number
 * @param {string} role - 'USER' or 'ADMIN'
 * @returns {Promise} {token, username, email, role, message}
 * @throws {AxiosError} on 409 (duplicate username/email) or network error
 */
export const register = async ({ username, email, password, role }) => {
  try {
    const response = await axiosInstance.post('/api/auth/register', {
      username,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};
