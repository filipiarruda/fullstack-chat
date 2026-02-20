import { DecodedToken, LoginCredentials, AuthResponse } from '@/types/auth.types';

const decode = (token: string): DecodedToken => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid token');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    throw new Error('Failed to decode token');
  }
};

export const authLib = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      
      // Decode to get expiration
      try {
        const decoded = decode(token);
        const expirationDate = new Date(decoded.exp * 1000);
        document.cookie = `auth_token=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`;
      } catch {
        // If decoding fails, set cookie without expiration (session cookie)
        document.cookie = `auth_token=${token}; path=/; SameSite=Strict`;
      }
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Remove cookie by setting expired date
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = decode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return decode(token);
    } catch {
      return null;
    }
  },
};
