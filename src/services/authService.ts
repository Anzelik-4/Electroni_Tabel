import type { DbStudent, DbTeacher, User } from '../types/user';

const API_URL = '/api';

/** Поиск преподавателя по логину и паролю */
const findTeacher = async (
  login: string,
  password: string,
): Promise<User | null> => {
  const params = new URLSearchParams({ login, password });
  const response = await fetch(`${API_URL}/teachers?${params}`);

  if (!response.ok) {
    throw new Error('Ошибка соединения с сервером');
  }

  const teachers: DbTeacher[] = await response.json();
  const teacher = teachers[0];

  if (!teacher) {
    return null;
  }

  const { password: _, ...profile } = teacher;

  return { ...profile, role: 'teacher' };
};

/** Поиск студента по логину и паролю */
const findStudent = async (
  login: string,
  password: string,
): Promise<User | null> => {
  const params = new URLSearchParams({ login, password });
  const response = await fetch(`${API_URL}/students?${params}`);

  if (!response.ok) {
    throw new Error('Ошибка соединения с сервером');
  }

  const students: DbStudent[] = await response.json();
  const student = students[0];

  if (!student) {
    return null;
  }

  const { password: _, ...profile } = student;

  return { ...profile, role: 'student' };
};

/**
 * Проверяет логин/пароль сначала среди преподавателей, затем среди студентов.
 * Возвращает профиль без пароля или null, если никто не найден.
 */
export const authenticateUser = async (
  login: string,
  password: string,
): Promise<User | null> => {
  const teacher = await findTeacher(login, password);

  if (teacher) {
    return teacher;
  }

  return findStudent(login, password);
};

/** Генерация уникального токена сессии */
export const generateToken = (): string => crypto.randomUUID();