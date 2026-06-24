import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivePolls.module.scss';
import { QuestionCard } from '../../widgets/questionCard/questionCard';
import { Button } from '../../ui/button/button';
import { getUser } from '../../../utils/auth';

interface Poll {
  id: string;
  disciplineId: number;
  teacherId: string;
  groupId: number;
  startedAt: string;
  expiresAt: string;
  active: boolean;
  disciplineName?: string;
  teacherName?: string;
}

interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

interface Teacher {
  id: string;
  fullName: string;
}

export const ActivePolls: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [disciplineName, setDisciplineName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  
  const [stopSearch, setStopSearch] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Проверка, есть ли у студента отметка за сегодня по КОНКРЕТНОЙ дисциплине
  const checkTodayAttendance = async (disciplineId: number): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `/api/attendance?studentId=${user.id}&disciplineId=${disciplineId}&date=${today}`
      );
      const records = await response.json();
      return records.length > 0;
    } catch (error) {
      console.error('Ошибка проверки отметки:', error);
      return false;
    }
  };

  // Проверка активных опросов
  const checkActivePoll = async () => {
    if (stopSearch || hasConfirmed) return;
    if (!user?.groupId) return;

    try {
      setIsLoading(true);
      
      const pollsRes = await fetch(`/api/polls?groupId=${user.groupId}&active=true`);
      const polls: Poll[] = await pollsRes.json();
      
      const currentPoll = polls[0];
      
      if (currentPoll) {
        const now = new Date();
        const expiresAt = new Date(currentPoll.expiresAt);
        
        if (now > expiresAt) {
          await fetch(`/api/polls/${currentPoll.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: false }),
          });
          setActivePoll(null);
          setError('');
        } else {
          const alreadyAttended = await checkTodayAttendance(currentPoll.disciplineId);
          
          if (alreadyAttended) {
            setHasConfirmed(true);
            setStopSearch(true);
            setActivePoll(null);
            
            setIsLoading(false);
            return;
          }
          
          setActivePoll(currentPoll);
          setStopSearch(true);
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          const discRes = await fetch(`/api/disciplines/${currentPoll.disciplineId}`);
          const discData: Discipline = await discRes.json();
          setDisciplineName(discData.name);
          
          const teacherRes = await fetch(`/api/teachers/${currentPoll.teacherId}`);
          const teacherData: Teacher = await teacherRes.json();
          setTeacherName(teacherData.fullName);
          
          setError('');
        }
      } else {
        setActivePoll(null);
        setError('');
      }
    } catch (error) {
      console.error('Ошибка проверки опроса:', error);
      setError('Не удалось проверить наличие опросов');
    } finally {
      setIsLoading(false);
    }
  };

  // Периодическая проверка
  useEffect(() => {
    checkActivePoll();
    
    if (!stopSearch && !hasConfirmed) {
      intervalRef.current = setInterval(() => {
        checkActivePoll();
      }, 10000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, stopSearch, hasConfirmed]);

  // Обработчик подтверждения присутствия
  const handleConfirmAttendance = async () => {
    if (!activePoll) return;
    if (!user?.id) {
      setError('Ошибка: пользователь не найден');
      return;
    }

    try {
      // 1. ДЕАКТИВИРУЕМ ОПРОС В БАЗЕ ДАННЫХ
      await fetch(`/api/polls/${activePoll.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });

      // 2. Сохраняем временную отметку в localStorage
      const today = new Date().toISOString().split('T')[0];
      const tempKey = `temp_attendance_${activePoll.disciplineId}_${today}`;
      const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');
      
      tempData[user.id] = {
        status: 'P',
        reason: ''
      };
      localStorage.setItem(tempKey, JSON.stringify(tempData));

      // 3. Обновляем состояние
      setHasConfirmed(true);
      setStopSearch(true);
      setActivePoll(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      console.log('✅ Присутствие подтверждено! Уведомление отправлено преподавателю.');
      
    } catch (error) {
      console.error('❌ Ошибка подтверждения присутствия:', error);
      setError('Не удалось подтвердить присутствие');
    }
  };

  const handleGoBack = () => {
    navigate('/student');
  };

  if (isLoading && !activePoll) {
    return (
      <div className={styles.activePolls}>
        <div className={styles.headerSection}>
          <Button onClick={handleGoBack} className={styles.backButton}>
            ← Назад
          </Button>
        </div>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Активные опросы</h1>
          <p className={styles.subtitle}>Поиск активных опросов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activePolls}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Активные опросы</h1>
        <p className={styles.subtitle}>
          {hasConfirmed 
            ? 'Вы уже подтвердили присутствие сегодня ✅' 
            : 'У Вас есть 10 минут на подтверждение присутствия'}
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.pollsSection}>
        {activePoll && !hasConfirmed ? (
          <QuestionCard
            teacherName={teacherName}
            disciplineName={disciplineName}
            onConfirm={handleConfirmAttendance}
          />
        ) : (
          <QuestionCard
            teacherName=""
            disciplineName=""
            onConfirm={() => {}}
            isActive={false}
          />
        )}
      </div>
    </div>
  );
};