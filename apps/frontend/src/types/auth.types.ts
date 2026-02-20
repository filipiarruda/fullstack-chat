export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
