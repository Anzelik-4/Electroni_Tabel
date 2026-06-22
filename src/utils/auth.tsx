import type { User, UserRole } from '../types/user';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export type { User, UserRole };

/** Сохранить сессию после успешного входа */
export const setAuth = (user: User, token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/** Получить токен текущей сессии */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** Получить профиль текущего пользователя */
export const getUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
};

/** Получить роль (student / teacher) */
export const getUserRole = (): UserRole | null => getUser()?.role ?? null;

/** Проверка: пользователь авторизован? */
export const isAuthenticated = (): boolean => getToken() !== null;

/** Выход: очистить сессию */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};