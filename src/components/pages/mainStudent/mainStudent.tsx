import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainStudent.module.scss';
import { DataCard } from '../../widgets/dataCard/dataCard';

export const MainStudent: React.FC = () => {
  const navigate = useNavigate();

  const handleMarkAttendance = () => {
    // Переход на страницу активных опросов
    navigate('/student/polls');
  };

  const handleViewAbsences = () => {
    navigate('/student/absences');
  };

  return (
    <div className={styles.mainStudent}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Разделы</h1>
        <p className={styles.subtitle}>
          Выберите раздел для отметки присутствия или просмотра своих пропусков
        </p>
      </div>

      <div className={styles.cardsSection}>
        <DataCard
          title="Отметить присутствие"
          content="Подтверди своё присутствие на занятиях при помощи активных опросов от преподавателя"
          buttonText="Открыть раздел"
          onButtonClick={handleMarkAttendance}
        />

        <DataCard
          title="Просмотр пропусков"
          content="Просматривай историю своих пропусков по каждой дисциплине"
          buttonText="Открыть раздел"
          onButtonClick={handleViewAbsences}
        />
      </div>
    </div>
  );
};