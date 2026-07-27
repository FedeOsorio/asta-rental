interface UserState {
  id: string;
  email: string;
  role: 'admin' | 'agent';
  organizationId: string;
}

class AuthStore {
  private accessToken: string | null = null;
  private user: UserState | null = null;
  private listeners: Set<() => void> = new Set();

  setAuth(accessToken: string, user: UserState) {
    this.accessToken = accessToken;
    this.user = user;
    this.notify();
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    this.notify();
  }

  clear() {
    this.accessToken = null;
    this.user = null;
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
