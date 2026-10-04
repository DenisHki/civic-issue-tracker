import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import { AuthContext } from './auth-context';
import type { User } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
  }, [token]);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
  );
}
