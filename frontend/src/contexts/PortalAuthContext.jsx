import { createContext, useCallback, useEffect, useState } from 'react';
import portalApi from '../api/portalApi';

const PortalAuthContext = createContext();

const TOKEN_KEY = 'portal_token';
const USER_KEY = 'portal_user';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error leyendo portal_user', error);
    return null;
  }
};

export const PortalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await portalApi.get('/portal/profile');
      setProfile(response.data);
      if (response.data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error al obtener perfil de portal', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    try {
      const response = await portalApi.post('/auth/login', {
        username: email.toLowerCase(),
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      await fetchProfile();
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Credenciales invalidas';
      return { success: false, message };
    }
  };

  const register = async ({ name, email, phone, password }) => {
    try {
      const response = await portalApi.post('/portal/register', {
        name,
        email,
        phone,
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      await fetchProfile();
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo registrar';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setProfile(null);
    window.location.href = '/portal/login';
  };

  return (
    <PortalAuthContext.Provider
      value={{ user, profile, loading, login, register, logout, refreshProfile: fetchProfile }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
};

export { PortalAuthContext };
