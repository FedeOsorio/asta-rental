import { authStore } from './auth-store';

const API_BASE_URL = 'http://localhost:4000';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authStore.getAccessToken();

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
    credentials: 'include' // Send refresh cookie
  });

  // Handle 401 Unauthorized (token expired -> attempt auto-refresh)
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        authStore.setAccessToken(refreshData.accessToken);

        // Retry original request with new access token
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include'
        });
      } else {
        authStore.clear();
      }
    } catch {
      authStore.clear();
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
