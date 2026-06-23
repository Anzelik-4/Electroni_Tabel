import React from 'react';
import styles from './mainTeacher.module.scss';
import { DataCard } from '../../widgets/dataCard/dataCard';

export const MainTeacher: React.FC = () => {
  // Заглушка для будущей логики
  const handleTeaching = () => {
    console.log('Переход на раздел "Преподавание"');
    // TODO: Добавить навигацию на страницу преподавания
  };

  const handleCuratorship = () => {
    console.log('Переход на раздел "Кураторство"');
    // TODO: Добавить навигацию на страницу кураторства
  };

  return (
    <div className={styles.mainTeacher}>
      {/* Первый компонент: Заголовок и подзаголовок */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Разделы</h1>
        <p className={styles.subtitle}>
          Выберите раздел для дальнейшего просмотра и редактирования табелей
        </p>
      </div>

      {/* Второй компонент: Карточки по горизонтали */}
      <div className={styles.cardsSection}>
        {/* Первая карточка: Преподавание */}
        <DataCard
          title="Преподавание"
          content="Автоматическое заполнение табеля посещаемости и ручная корректировка отметок"
          buttonText="Открыть раздел"
          onButtonClick={handleTeaching}
        />

        {/* Вторая карточка: Кураторство */}
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