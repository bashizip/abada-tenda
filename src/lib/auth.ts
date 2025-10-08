export const TEST_USER = 'test-user';
export const TEST_GROUPS = 'customers';

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

const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

export function getStoredAuth(): AuthState {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userJson = localStorage.getItem(USER_INFO_KEY);

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    } catch (e) {
      console.error("Failed to parse user info from localStorage", e);
      clearAuth();
    }
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
}

export function setAuth(token: string, user: User) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}
