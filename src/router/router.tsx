import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from '../components/pages/login/login.tsx';
import { MainStudent } from '../components/pages/mainStudent/mainStudent.tsx';
import { MainTeacher } from '../components/pages/mainTeacher/mainTeacher.tsx';
import { AppLayout } from '../components/layout/appLayout/appLayout.tsx';
import { getUserRole, isAuthenticated, type UserRole } from '../utils/auth';

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
      {/* Страница логина без шапки */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Все защищённые страницы с шапкой */}
      <Route element={<AppLayout />}>
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <MainStudent />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <MainTeacher />
            </ProtectedRoute>
          }
        />
        
        {/* Дополнительные страницы можно добавлять сюда */}
        {/* <Route path="/student/schedule" element={<StudentSchedule />} /> */}
        {/* <Route path="/teacher/groups" element={<TeacherGroups />} /> */}
      </Route>
      
      {/* Корневой путь */}
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />} 
      />
      
      {/* Все остальные пути */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};