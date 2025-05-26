export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    email: string;
    name: string;
  };
}

export const ADMIN_CREDENTIALS = {
  email: 'admin@refresquitos.com',
  password: 'RefresquitosSecure2024!',
  name: 'Administrador'
} as const; 