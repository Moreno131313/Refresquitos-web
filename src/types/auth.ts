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
  email: 'duvanmoreno13@gmail.com',
  password: 'Moreno123@$#',
  name: 'Administrador'
} as const; 