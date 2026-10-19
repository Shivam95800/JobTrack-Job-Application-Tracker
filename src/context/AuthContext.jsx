import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

const DEMO_USER = {
  id: 'demo_user_1',
  name: 'Alex Hunter',
  email: 'demo@jobtrack.app',
  role: 'Full Stack Engineer',
  avatar: 'AH',
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = storageService.get('auth_current_user');
    return saved || DEMO_USER;
  });

  const [users, setUsers] = useState(() => {
    const saved = storageService.get('auth_users_list');
    return saved && saved.length > 0 ? saved : [DEMO_USER];
  });

  useEffect(() => {
    if (currentUser) {
      storageService.set('auth_current_user', currentUser);
    } else {
      storageService.remove('auth_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    storageService.set('auth_users_list', users);
  }, [users]);

  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      setCurrentUser(existing);
      return { success: true, user: existing };
    }

    // Auto-create or login with simple password
    const initials = trimmedEmail
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase();

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmedEmail.split('@')[0].replace('.', ' '),
      email: trimmedEmail,
      role: 'Job Seeker',
      avatar: initials,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const signup = (name, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      setCurrentUser(existing);
      return { success: true, user: existing };
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'JS';

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      email: trimmedEmail,
      role: 'Job Seeker',
      avatar: initials,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const loginAsDemo = () => {
    setCurrentUser(DEMO_USER);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        signup,
        loginAsDemo,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
