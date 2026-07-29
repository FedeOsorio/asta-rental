'use client';

import { useState, useEffect } from 'react';
import { authStore } from '../lib/auth-store';
import { fetchApi, refreshAccessToken } from '../lib/api-client';

let sessionCheckPromise: Promise<void> | null = null;

export function useAuth() {
  const [user, setUser] = useState(authStore.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setUser(authStore.getUser());
    });

    // Check session via refresh token on mount
    async function checkSession() {
      if (authStore.getUser()) {
        setLoading(false);
        return;
      }

      try {
        const accessToken = await refreshAccessToken();
        const me = await fetchApi('/auth/me');
        authStore.setAuth(accessToken, {
          id: me.userId,
          email: me.email,
          role: me.role,
          organizationId: me.organizationId,
          organizationName: me.organizationName
        });
      } catch (error) {
        // Silently fail and clear store if refresh token is invalid/expired
        authStore.clear();
      }
    }

    if (!sessionCheckPromise) {
      sessionCheckPromise = checkSession().finally(() => {
        sessionCheckPromise = null;
        setLoading(false);
      });
    } else {
      sessionCheckPromise.finally(() => setLoading(false));
    }

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    authStore.setAuth(data.accessToken, data.user, data.refreshToken);
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
