import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from '../components/pages/login/login.tsx';
import { MainStudent } from '../components/pages/mainStudent/mainStudent.tsx';
import { MainTeacher } from '../components/pages/mainTeacher/mainTeacher.tsx';
import { ActivePolls } from '../components/pages/activePolls/activePolls.tsx';
import { AppLayout } from '../components/layout/appLayout/appLayout.tsx';
import { getUserRole, isAuthenticated, type UserRole } from '../utils/auth';
import { Absences } from '../components/pages/absences/absences.tsx';
import { Teaching } from '../components/pages/teaching/teaching.tsx';
import { Curatorship } from '../components/pages/curatorship/curatorship.tsx';
import { Reports } from '../components/pages/reports/reports.tsx';
import { EditGroup } from '../components/pages/editGroup/editGroup.tsx';

interface ProtectedRouteProps {
  children: ReactNode;
  role: UserRole;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  if (isAuthenticated()) {
    const role = getUserRole();
    if (role === 'student') {
      return <Navigate to="/student" replace />;
    } else if (role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
  }
  return <>{children}</>;
};

export const Router = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route element={<AppLayout />}>
        {/* Главная страница студента */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <MainStudent />
            </ProtectedRoute>
          }
        />
        
        {/* Страница активных опросов (только для студента) */}
        <Route
          path="/student/polls"
          element={
            <ProtectedRoute role="student">
              <ActivePolls />
            </ProtectedRoute>
          }
        />

        {/* Страница просмотра пропусков (только для студента) */}
        <Route
          path="/student/absences"
          element={
            <ProtectedRoute role="student">
              <Absences />
            </ProtectedRoute>
          }
        />
        
        {/* Главная страница преподавателя */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <MainTeacher />
            </ProtectedRoute>
          }
        />

        {/* Страница преподавание (только преподаватель) */}
        <Route
          path="/teacher/teaching"
          element={
            <ProtectedRoute role="teacher">
              <Teaching />
            </ProtectedRoute>
          }
        />

        {/* Страница раздела кураторство (только преподаватель) */}
        <Route
          path="/teacher/curatorship"
          element={
            <ProtectedRoute role="teacher">
              <Curatorship />
            </ProtectedRoute>
          }
        />

        {/* Страница отчетности своей группы (только преподаватель) */}
        <Route
          path="/teacher/reports"
          element={
            <ProtectedRoute role="teacher">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Страница редактирования списка своей группы (только преподаватель) */}
        <Route
          path="/teacher/edit-group"
          element={
            <ProtectedRoute role="teacher">
              <EditGroup />
            </ProtectedRoute>
          }
        />

      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};