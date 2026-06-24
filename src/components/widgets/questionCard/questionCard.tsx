import React, { useState, useEffect } from 'react';
import styles from './questionCard.module.scss';
import { Button } from '../../ui/button/button';

interface QuestionCardProps {
  teacherName?: string;
  disciplineName?: string;
  onConfirm?: () => void;
  className?: string;
  autoCloseTimeout?: number;
  isActive?: boolean; // Новый пропс для управления состоянием извне
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  teacherName = 'Преподаватель',
  disciplineName = 'Дисциплина',
  onConfirm,
  className = '',
  autoCloseTimeout = 600000,
  isActive = true,
}) => {
  const [internalActive, setInternalActive] = useState<boolean>(isActive);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Синхронизация с внешним состоянием
  useEffect(() => {
    setInternalActive(isActive);
  }, [isActive]);

  // Таймер для автоматического закрытия
  useEffect(() => {
    if (!internalActive) return;

    const timer = setTimeout(() => {
      setInternalActive(false);
      setNotification({
        message: 'Вы не успели подтвердить присутствие. Доступ к опросу закрыт',
        type: 'error',
      });

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }, autoCloseTimeout);

    return () => clearTimeout(timer);
  }, [internalActive, autoCloseTimeout]);

  const handleConfirm = () => {
    setInternalActive(false);
    setNotification({
      message: 'Присутствие подтверждено ✅',
      type: 'success',
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);

    if (onConfirm) {
      onConfirm();
    }

    console.log('Присутствие подтверждено!');
  };

  // Состояние Default: нет активных опросов
  if (!internalActive) {
    return (
      <>
        {notification && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}

        <div className={`${styles.questionCard} ${styles.defaultState} ${className}`}>
          <p className={styles.noActiveText}>Нет активных опросов</p>
        </div>
      </>
    );
  }

  // Состояние Active: есть активный опрос
  return (
    <>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={`${styles.questionCard} ${styles.activeState} ${className}`}>
        <h2 className={styles.title}>Новый опрос</h2>

        <p className={styles.content}>
          {teacherName} по дисциплине {disciplineName} начал опрос присутствующих
        </p>

        <Button onClick={handleConfirm}>Подтвердить присутствие</Button>
      </div>
    </>
  );
};