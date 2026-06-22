import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeaderPageLayout.module.scss';
import { Logo } from '../../ui/logo/logo';
import { Button } from '../../ui/button/button';
import { logout } from '../../../utils/auth';

interface HeaderPageLayoutProps {
  title: string;
  subtitle: string;
  userRole: 'student' | 'teacher';
  userName?: string;
  className?: string;
}

export const HeaderPageLayout: React.FC<HeaderPageLayoutProps> = ({
  title,
  subtitle,
  userRole,
  userName = 'ФИО',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Очищаем данные авторизации
    logout();
    // Перенаправляем на страницу авторизации
    navigate('/login');
  };

  // Определяем текст роли для отображения
  const roleText = userRole === 'student' ? 'Студент' : 'Преподаватель';

  return (
    <header className={`${styles.header} ${className}`}>
      {/* Левая часть: Логотип + заголовок/подзаголовок */}
      <div className={styles.leftSection}>
        <Logo />
        
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      {/* Правая часть: ФИО + роль + кнопка выхода */}
      <div className={styles.rightSection}>
        <div className={styles.userGroup}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{roleText}</span>
        </div>
        
        {/* Кнопка выхода с стандартными размерами из компонента Button */}
        <Button onClick={handleLogout}>
          Выйти
        </Button>
      </div>
    </header>
  );
};