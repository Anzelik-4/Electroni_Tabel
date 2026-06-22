import React from 'react';
import styles from './dataCard.module.scss';
import { Button } from '../../ui/button/button';

interface DataCardProps {
  title: string;
  content: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  content,
  buttonText = 'Подробнее',
  onButtonClick,
  className = '',
}) => {
  return (
    <div className={`${styles.dataCard} ${className}`}>
      {/* Заголовок */}
      <h2 className={styles.title}>{title}</h2>
      
      {/* Контент */}
      <p className={styles.content}>{content}</p>
      
      {/* Кнопка */}
      <Button onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  );
};