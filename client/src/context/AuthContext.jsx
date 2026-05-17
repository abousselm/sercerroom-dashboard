import { createContext, useState, useContext, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Restaurer l'utilisateur au chargement de l'application
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !user) {
      API.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          setToken(storedToken);
        })
        .catch(() => {
          // Token invalide, nettoyer
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
