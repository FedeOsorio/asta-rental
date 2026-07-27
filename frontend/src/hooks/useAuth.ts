'use client';

import { useState, useEffect } from 'react';
import { authStore } from '../lib/auth-store';
import { fetchApi } from '../lib/api-client';

export function useAuth() {
  const [user, setUser] = useState(authStore.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setUser(authStore.getUser());
    });

    // Check session via refresh token on mount
    async function checkSession() {
      try {
        const data = await fetchApi('/auth/refresh', { method: 'POST' });
        authStore.setAccessToken(data.accessToken);

        const me = await fetchApi('/auth/me');
        authStore.setAuth(data.accessToken, {
          id: me.userId,
          email: me.email || 'user@agency.com',
          role: me.role,
          organizationId: me.organizationId
        });
      } catch {
        authStore.clear();
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    authStore.setAuth(data.accessToken, data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      authStore.clear();
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };
}
