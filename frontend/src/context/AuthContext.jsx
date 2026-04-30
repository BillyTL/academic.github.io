import { createContext, useState, useEffect } from 'react';
import { login as apiLogin, fetchMe } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('educore_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('educore_user');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    const { token: t, user: u } = data.data;
    localStorage.setItem('educore_token', t);
    localStorage.setItem('educore_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('educore_token');
    localStorage.removeItem('educore_user');
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    try {
      const { data } = await fetchMe();
      setUser((u) => ({ ...u, ...data.data }));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}
