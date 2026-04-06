import { createContext, useContext, useMemo, useState } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

const parseUserFromToken = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const user = useMemo(() => parseUserFromToken(token), [token]);
  const loading = false;

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const accessToken = res.data.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    return res.data;
  };

  const register = async (email, password, fullName) => {
    const res = await API.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
