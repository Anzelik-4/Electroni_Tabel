import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import styles from './AppLayout.module.scss';
import { HeaderPageLayout } from '../headerPageLayout/headerPageLayout';
import { getUserRole, isAuthenticated } from '../../../utils/auth';

interface AppLayoutProps {
  // Можно добавить пропсы для кастомизации, если нужно
}

export const AppLayout: React.FC<AppLayoutProps> = () => {
  const location = useLocation();
  
  // Проверяем, находится ли пользователь на странице авторизации
  const isLoginPage = location.pathname === '/login';
  
  // Если это страница авторизации, не показываем шапку
  if (isLoginPage) {
    return <Outlet />;
  }
  
  // Проверяем авторизацию
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Получаем роль пользователя
  const userRole = getUserRole();
  
  // Определяем заголовок и подзаголовок в зависимости от страницы
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/student') {
      return {
        title: 'Электронный табель',
        subtitle: 'Главная'
      };
    } else if (path === '/teacher') {
      return {
        title: 'Электронный табель',
        subtitle: 'Главная'
      };
    } else if (path === '/student/schedule') {
      return {
        title: 'Расписание',
        subtitle: 'Ваше расписание занятий'
      };
    } else if (path === '/teacher/groups') {
      return {
        title: 'Группы',
        subtitle: 'Управление группами студентов'
      };
    }
    
    // По умолчанию
    return {
      title: 'Табель посещения',
      subtitle: 'Система учёта посещаемости'
    };
  };
  
  const { title, subtitle } = getPageInfo();
  
  // Если роль не определена, перенаправляем на логин
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className={styles.appLayout}>
      {/* Шапка страницы */}
      <HeaderPageLayout 
        title={title}
        subtitle={subtitle}
        userRole={userRole}
        userName="Иванов Иван Иванович" // TODO: Получать из данных пользователя
      />
      
      {/* Основной контент страницы */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};