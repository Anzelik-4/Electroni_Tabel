export type UserRole = 'student' | 'teacher' | null;

// Храним данные в localStorage для сохранения между сессиями
const AUTH_KEY = 'isAuthenticated';
const ROLE_KEY = 'userRole';

export const setAuthenticated = (value: boolean): void => {
  localStorage.setItem(AUTH_KEY, String(value));
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const setUserRole = (role: UserRole): void => {
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
};

export const getUserRole = (): UserRole => {
  const role = localStorage.getItem(ROLE_KEY);
  if (role === 'student' || role === 'teacher') {
    return role;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(ROLE_KEY);
};