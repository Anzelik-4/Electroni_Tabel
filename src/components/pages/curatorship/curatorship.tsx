import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Curatorship.module.scss';
import { DataCard } from '../../widgets/dataCard/dataCard';
import { Button } from '../../ui/button/button';
import { getUser } from '../../../utils/auth';

interface Group {
  id: number;
  name: string;
  teacherId: number;
}

export const Curatorship: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups?teacherId=${user?.id}`);
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Ошибка загрузки групп:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchGroups();
    }
  }, [user]);

  const handleGoBack = () => {
    navigate('/teacher');
  };

  const handleReports = () => {
    navigate('/teacher/reports');
  };

  const handleEditGroup = () => {
    navigate('/teacher/edit-group'); // ← Переход на страницу редактирования группы
  };

  const groupNames = groups.map(g => g.name).join(', ');
  const groupText = groups.length > 0 ? groupNames : 'Группы не назначены';

  return (
    <div className={styles.curatorship}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Кураторство</h1>
        <p className={styles.subtitle}>
          Закрепленная группа: {groupText}
        </p>
      </div>

      <div className={styles.cardsSection}>
        {/* Первая карточка → Отчетные ведомости */}
        <DataCard
          title="Отчетные ведомости посещаемости"
          content="Формирование и выгрузка отчётов посещаемости группы в формате Word"
          buttonText="Открыть раздел"
          onButtonClick={handleReports}
        />

        {/* Вторая карточка → Редактирование списка группы */}
        <DataCard
          title="Редактирование списка группы"
          content="Редактирование списка студентов закреплённой группы"
          buttonText="Открыть раздел"
          onButtonClick={handleEditGroup} // ← Здесь переход на EditGroup
        />
      </div>
    </div>
  );
};