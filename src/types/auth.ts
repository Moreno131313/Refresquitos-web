export interface User {
  email: string
  name: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    email: string;
    name: string;
  };
}

// Función para obtener credenciales de forma segura desde variables de entorno
export const getAuthCredentials = (): AuthCredentials => {
  return {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@refresquitos.com',
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'RefresquitosSecure2024!'
  }
}

export const validateCredentials = (email: string, password: string): boolean => {
  const validCredentials = getAuthCredentials()
  return email === validCredentials.email && password === validCredentials.password
}

// Credenciales por defecto (solo para fallback en desarrollo)
export const ADMIN_CREDENTIALS = {
  email: 'admin@refresquitos.com',
  password: 'RefresquitosSecure2024!',
  name: 'Administrador'
} as const; 