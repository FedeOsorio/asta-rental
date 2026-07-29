interface UserState {
  id: string;
  email: string;
  role: 'admin' | 'agent';
  organizationId: string;
  organizationName?: string;
}

class AuthStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: UserState | null = null;
  private listeners: Set<() => void> = new Set();

  setAuth(accessToken: string, user: UserState, refreshToken?: string) {
    this.accessToken = accessToken;
    this.user = user;
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    this.notify();
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.notify();
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('refreshToken');
      if (stored) {
        this.refreshToken = stored;
      }
    }
    return this.refreshToken;
  }

  clear() {
    this.accessToken = null;
    this.user = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
    this.notify();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUser(): UserState | null {
    return this.user;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const authStore = new AuthStore();
