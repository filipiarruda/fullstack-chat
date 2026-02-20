import { LoginCredentials, AuthResponse } from '@/types/auth.types';
import { apiClient } from '@/lib/api';
import { authLib } from '@/lib/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials,
      { skipAuth: true },
    );
    authLib.setToken(response.access_token);
  },

  logout(): void {
    authLib.removeToken();
  },

  getToken(): string | null {
    return authLib.getToken();
  },

  isAuthenticated(): boolean {
    return authLib.isAuthenticated();
  },

  getCurrentUserId(): string | null {
    const decoded = authLib.getDecodedToken();
    return decoded?.sub || null;
  },

  getCurrentUserEmail(): string | null {
    const decoded = authLib.getDecodedToken();
    return decoded?.email || null;
  },
};
