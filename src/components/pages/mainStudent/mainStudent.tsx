import React from 'react';
import styles from './mainStudent.module.scss';
import { DataCard } from '../../widgets/dataCard/dataCard';

export const MainStudent: React.FC = () => {
  // Заглушка для будущей логики
  const handleMarkAttendance = () => {
    console.log('Переход на раздел "Отметить присутствие"');
    // TODO: Добавить навигацию на страницу отметки присутствия
  };

  const handleViewAbsences = () => {
    console.log('Переход на раздел "Просмотр пропусков"');
    // TODO: Добавить навигацию на страницу просмотра пропусков
  };

  return (
    <div className={styles.mainStudent}>
      {/* Первый компонент: Заголовок и подзаголовок */}
      <div className={styles.mainStudent}>
        <h1 className={styles.title}>Разделы</h1>
        <p className={styles.subtitle}>
          Выберите раздел для отметки присутствия или просмотра своих пропусков
        </p>
      </div>

      {/* Второй компонент: Карточки по горизонтали */}
      <div className={styles.cardsSection}>
        {/* Первая карточка: Отметить присутствие */}
        <DataCard
          title="Отметить присутствие"
          content="Подтверди своё присутствие на занятиях при помощи активных опросов от преподавателя"
          buttonText="Открыть раздел"
          onButtonClick={handleMarkAttendance}
        />

        {/* Вторая карточка: Просмотр пропусков */}
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

