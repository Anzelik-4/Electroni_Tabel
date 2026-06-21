import React from 'react';
import styles from './Logo.module.scss';

// Импортируем изображение
import logoImage from '../../../assets/logo.png';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  alt = 'Логотип',
}) => {
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <img src={logoImage} alt={alt} className={styles.logoImage} />
    </div>
  );
};