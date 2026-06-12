import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'stayease_user';
const TOKEN_KEYS = ['stayease_token', 'token'];
const ROLE_KEYS = ['stayease_role', 'role'];

function readFirst(keys) {
  return keys.map((key) => localStorage.getItem(key)).find(Boolean) || null;
}

function removeAll(keys) {
  keys.forEach((key) => localStorage.removeItem(key));
}

/**
 * AuthProvider manages authentication state including JWT token,
 * user profile (username, email, role), and session persistence.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = readFirst(TOKEN_KEYS);
      const stored = localStorage.getItem(SESSION_KEY);
      const role = readFirst(ROLE_KEYS);

      if (!token || !stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      return { ...parsed, role: role || parsed.role };
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      removeAll(TOKEN_KEYS);
      localStorage.removeItem(SESSION_KEY);
      removeAll(ROLE_KEYS);
      return null;
    }
  });

  /**
   * Clear all authentication data from state and localStorage.
   * Called on logout or when token expires.
   */
  const clearSession = useCallback(() => {
    removeAll(TOKEN_KEYS);
    localStorage.removeItem(SESSION_KEY);
    removeAll(ROLE_KEYS);
    setUser(null);
  }, []);

  /**
   * Persist authentication response from backend.
   * Stores JWT token, user profile, and role separately for quick access.
   */
  const saveSession = useCallback((authResponse) => {
    try {
      if (!authResponse?.token || !authResponse?.username) {
        throw new Error('Invalid auth response');
      }

      const { token, username, email, role } = authResponse;

      TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username, email, role }));
      if (role) {
        ROLE_KEYS.forEach((key) => localStorage.setItem(key, role));
      }

      setUser({ username, email, role });
    } catch (error) {
      console.error('Failed to save auth session:', error);
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const getToken = useCallback(() => readFirst(TOKEN_KEYS), []);

  /**
   * Update profile fields in frontend session storage.
   * This keeps backend as source of truth until profile APIs are available.
   */
  const updateProfile = useCallback((updates) => {
    setUser((prevUser) => {
      if (!prevUser) {
        return prevUser;
      }

      const nextUser = {
        ...prevUser,
        username: updates?.username ?? prevUser.username,
        email: updates?.email ?? prevUser.email,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        saveSession,
        updateProfile,
        clearSession,
        getToken,
        isAuthenticated: !!user && !!readFirst(TOKEN_KEYS),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
