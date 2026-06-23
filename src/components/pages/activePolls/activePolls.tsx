import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivePolls.module.scss';
import { QuestionCard } from '../../widgets/questionCard/questionCard';
import { Button } from '../../ui/button/button';

export const ActivePolls: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/student');
  };

  const handleConfirmAttendance = () => {
    console.log('Присутствие подтверждено!');
    // TODO: Отправить запрос на сервер для подтверждения присутствия
  };

  return (
    <div className={styles.activePolls}>
      {/* Кнопка "← Назад" */}
      <div className={styles.headerSection}>
        <Button 
          onClick={handleGoBack}
          className={styles.backButton}
        >
          ← Назад
        </Button>
      </div>

      {/* Заголовок и подзаголовок */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Активные опросы</h1>
        <p className={styles.subtitle}>У Вас есть 10 минут на подтверждение присутствия</p>
      </div>

      {/* Карточка опроса в состоянии Active */}
      <div className={styles.pollsSection}>
        <QuestionCard 
          teacherName="Смирнов Алексей Владимирович"
          disciplineName="Программирование на Python"
          onConfirm={handleConfirmAttendance}
        />
      </div>
    </div>
  );
};