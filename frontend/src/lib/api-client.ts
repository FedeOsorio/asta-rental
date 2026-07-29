import { authStore } from './auth-store';

const API_BASE_URL = 'http://localhost:4000';

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = authStore.getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined,
        credentials: 'include',
        cache: 'no-store'
      });

      if (!refreshRes.ok) {
        authStore.clear();
        const errorData = await refreshRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Refresh failed');
      }

      const refreshData = await refreshRes.json();
      authStore.setAccessToken(refreshData.accessToken);
      if (refreshData.refreshToken) {
        authStore.setRefreshToken(refreshData.refreshToken);
      }
      return refreshData.accessToken;
    } catch (err) {
      authStore.clear();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = authStore.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send refresh cookie
    cache: 'no-store'
  });

  // Handle 401 Unauthorized (token expired -> attempt auto-refresh)
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const newToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store'
      });
    } catch {
      // Refresh failed, response remains 401
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      status: response.status,
      error: 'REQUEST_FAILED',
      message: `Error ${response.status}: ${response.statusText}`
    }));
    const err = new Error(errorData.message || errorData.error || `HTTP Error ${response.status}`);
    (err as any).status = errorData.status || response.status;
    (err as any).code = errorData.error;
    throw err;
  }

  return response.json();
}
