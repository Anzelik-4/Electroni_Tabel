// router.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
// import type { ReactNode } from 'react';
// Импортируйте ваши страницы (создайте их позже)
import Login from '../components/pages/login/login.tsx';
import { MainStudent } from '../components/pages/mainStudent/mainStudent.tsx';
// Компонент для защиты маршрутов (опционально)
interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'student' | 'teacher';
}
const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  // Здесь ваша логика проверки авторизации
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userRole = localStorage.getItem('role') as 'student' | 'teacher' | null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
// Основной компонент маршрутизации
export const Router = () => {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<Login />} />
      {/* Защищенные маршруты */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainStudent />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      /> */}
      {/* 404 страница /}
      {/ <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};