import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainTeacher.module.scss';
import { DataCard } from '../../widgets/dataCard/dataCard';

export const MainTeacher: React.FC = () => {
  const navigate = useNavigate();

  const handleTeaching = () => {
    navigate('/teacher/teaching');
  };

  const handleCuratorship = () => {
    navigate('/teacher/curatorship');
  };

  return (
    <div className={styles.mainTeacher}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Разделы</h1>
        <p className={styles.subtitle}>
          Выберите раздел для дальнейшего просмотра и редактирования табелей
        </p>
      </div>

      <div className={styles.cardsSection}>
        <DataCard
          title="Преподавание"
          content="Автоматическое заполнение табеля посещаемости и ручная корректировка отметок"
          buttonText="Открыть раздел"
          onButtonClick={handleTeaching}
        />

        <DataCard
          title="Кураторство"
          content="Управление закреплёнными группами"
          buttonText="Открыть раздел"
          onButtonClick={handleCuratorship}
        />
      </div>
    </div>
  );
};