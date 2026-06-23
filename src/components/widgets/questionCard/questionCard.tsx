import React, { useState, useEffect } from 'react';
import styles from './questionCard.module.scss';
import { Button } from '../../ui/button/button';

interface QuestionCardProps {
  teacherName?: string;
  disciplineName?: string;
  onConfirm?: () => void;
  className?: string;
  autoCloseTimeout?: number; // Время в миллисекундах до автоматического закрытия (по умолчанию 10 минут)
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  teacherName = 'Преподаватель',
  disciplineName = 'Дисциплина',
  onConfirm,
  className = '',
  autoCloseTimeout = 600000, // 10 минут в миллисекундах (600000)
}) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Таймер для автоматического закрытия опроса через 10 минут
  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      // Закрываем опрос
      setIsActive(false);
      // Показываем уведомление
      setNotification({
        message: 'Вы не успели подтвердить присутствие. Доступ к опросу закрыт',
        type: 'error',
      });

      // Скрываем уведомление через 5 секунд
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }, autoCloseTimeout);

    // Очищаем таймер при размонтировании или изменении isActive
    return () => clearTimeout(timer);
  }, [isActive, autoCloseTimeout]);

  const handleConfirm = () => {
    // Переключаем в состояние Default
    setIsActive(false);

    // Показываем уведомление об успехе
    setNotification({
      message: 'Присутствие подтверждено ✅',
      type: 'success',
    });

    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      setNotification(null);
    }, 3000);

    // Вызываем переданную функцию, если она есть
    if (onConfirm) {
      onConfirm();
    }

    console.log('Присутствие подтверждено!');
  };

  // Состояние Default: нет активных опросов
  if (!isActive) {
    return (
      <>
        {/* Уведомление */}
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
      {/* Уведомление */}
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