export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthPayload {
  sub: string;           // User ID
  org: string;           // Organization ID
  role: UserRole;
  jti: string;           // Token Unique ID
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
  accessToken: string;
}
