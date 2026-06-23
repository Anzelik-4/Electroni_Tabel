import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import styles from './AppLayout.module.scss';
import { HeaderPageLayout } from '../headerPageLayout/headerPageLayout';
import { getUserRole, isAuthenticated, getUser } from '../../../utils/auth';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/login';
  
  if (isLoginPage) {
    return <Outlet />;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = getUserRole();
  const userData = getUser();
  
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
    }
    
    return {
      title: 'Табель посещения',
      subtitle: 'Система учёта посещаемости'
    };
  };
  
  const { title, subtitle } = getPageInfo();
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className={styles.appLayout}>
      <HeaderPageLayout 
        title={title}
        subtitle={subtitle}
        userRole={userRole}
        userName={userData?.fullName || 'ФИО'}
      />
      
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};