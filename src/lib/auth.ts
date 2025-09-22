export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

export function getStoredAuth(): AuthState {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    } catch {
      // Clear invalid data
      clearAuth();
    }
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
}

export function setAuth(token: string, user: User): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    // For mock JWT, we'll just check if it exists and is recent
    const parts = token.split('-');
    if (parts.length === 3 && parts[0] === 'mock' && parts[1] === 'jwt' && parts[2] === 'token') {
      const timestamp = parseInt(parts[3] || '0');
      const now = Date.now();
      // Consider token expired after 24 hours
      return (now - timestamp) > (24 * 60 * 60 * 1000);
    }
    return false;
  } catch {
    return true;
  }
}