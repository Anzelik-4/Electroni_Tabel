import type { User, UserRole } from '../types/user';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export type { User, UserRole };

// Используем sessionStorage для изоляции сессий между вкладками
export const setAuth = (user: User, token: string): void => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const getUser = (): User | null => {
  const data = sessionStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
};

export const getUserRole = (): UserRole | null => getUser()?.role ?? null;

export const isAuthenticated = (): boolean => getToken() !== null;

export const logout = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};