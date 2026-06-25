import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Teaching.module.scss';
import { Button } from '../../ui/button/button';
import { Select } from '../../ui/select/select';
import type { SelectOption } from '../../ui/select/select';
import { getUser } from '../../../utils/auth';

// Типы данных
interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

interface Group {
  id: number;
  name: string;
  teacherId: number;
}

interface Student {
  id: string;
  fullName: string;
  groupId: number;
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  disciplineId: number;
  date: string;
  status: 'P' | 'N' | 'B' | '';
  reason: string;
}

interface TableRow {
  studentId: string;
  fullName: string;
  status: 'P' | 'N' | 'B' | '';
  reason: string;
  isEdited: boolean;
  isTemp?: boolean; // Флаг для временных отметок
}

export const Teaching: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isPollActive, setIsPollActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка всех дисциплин и групп
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disciplinesRes, groupsRes] = await Promise.all([
          fetch('/api/disciplines'),
          fetch('/api/groups')
        ]);
        
        const disciplinesData = await disciplinesRes.json();
        const groupsData = await groupsRes.json();
        
        setDisciplines(disciplinesData);
        setGroups(groupsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    fetchData();
  }, []);

  // Загрузка студентов при выборе группы
  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/students?groupId=${selectedGroup}`);
        const data = await response.json();
        const sorted = data.sort((a: Student, b: Student) => 
          a.fullName.localeCompare(b.fullName)
        );
        setStudents(sorted);
      } catch (error) {
        console.error('Ошибка загрузки студентов:', error);
      }
    };

    fetchStudents();
  }, [selectedGroup]);

  // Функция загрузки сохранённых данных из attendance
  const loadSavedAttendance = async (): Promise<AttendanceRecord[]> => {
    if (!selectedDiscipline || !selectedGroup || students.length === 0) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(
        `/api/attendance?disciplineId=${selectedDiscipline}&date=${today}`
      );
      return await response.json();
    } catch (error) {
      console.error('Ошибка загрузки сохранённых данных:', error);
      return [];
    }
  };

  // Функция загрузки таблицы (сохранённые данные + временные отметки)
  const loadTableData = async () => {
    if (!selectedDiscipline || !selectedGroup || students.length === 0) {
      setTableData([]);
      return;
    }

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // 1. Загружаем сохранённые данные из БД
      const savedRecords = await loadSavedAttendance();
      
      // 2. Загружаем временные отметки из localStorage
      const tempKey = `temp_attendance_${selectedDiscipline}_${today}`;
      const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');

      // 3. Формируем таблицу
      const rows: TableRow[] = students.map((student) => {
        const saved = savedRecords.find(
          (r: AttendanceRecord) => r.studentId === student.id
        );
        const temp = tempData[student.id];

        // Приоритет: временная отметка > сохранённая
        if (temp && temp.status) {
          return {
            studentId: student.id,
            fullName: student.fullName,
            status: temp.status,
            reason: temp.reason || '',
            isEdited: true,
            isTemp: true,
          };
        }

        if (saved) {
          return {
            studentId: student.id,
            fullName: student.fullName,
            status: saved.status,
            reason: saved.reason || '',
            isEdited: false,
            isTemp: false,
          };
        }

        return {
          studentId: student.id,
          fullName: student.fullName,
          status: '',
          reason: '',
          isEdited: false,
          isTemp: false,
        };
      });

      setTableData(rows);
    } catch (error) {
      console.error('Ошибка загрузки таблицы:', error);
    } finally {
      setLoading(false);
    }
  };

  // Проверка новых отметок от студентов (через опросы)
  const checkStudentConfirmations = async () => {
    if (!isPollActive || !selectedDiscipline || !selectedGroup) return;

    try {
      // Проверяем, есть ли активный опрос
      const pollRes = await fetch(
        `/api/polls?disciplineId=${selectedDiscipline}&groupId=${selectedGroup}&active=true`
      );
      const polls = await pollRes.json();
      
      if (polls.length === 0) {
        // Опрос деактивирован (кто-то подтвердил)
        console.log('🔄 Обнаружено изменение статуса опроса');
        await loadTableData();
        return;
      }

      // Проверяем записи в attendance (если кто-то уже сохранился)
      const savedRecords = await loadSavedAttendance();
      const today = new Date().toISOString().split('T')[0];
      const tempKey = `temp_attendance_${selectedDiscipline}_${today}`;
      const tempData = JSON.parse(localStorage.getItem(tempKey) || '{}');

      // Проверяем, появились ли новые записи в БД
      let hasNew = false;
      for (const student of students) {
        const saved = savedRecords.find((r: AttendanceRecord) => r.studentId === student.id);
        if (saved && !tempData[student.id]) {
          // Новая запись в БД, но её нет во временных
          tempData[student.id] = {
            status: saved.status,
            reason: saved.reason || ''
          };
          hasNew = true;
        }
      }

      if (hasNew) {
        localStorage.setItem(tempKey, JSON.stringify(tempData));
        await loadTableData();
      }

    } catch (error) {
      console.error('Ошибка проверки подтверждений:', error);
    }
  };

  // Загрузка таблицы при выборе дисциплины и группы
  useEffect(() => {
    if (!selectedDiscipline || !selectedGroup || students.length === 0) {
      setTableData([]);
      return;
    }

    loadTableData();
  }, [selectedDiscipline, selectedGroup, students]);

    // ========== ПЕРИОДИЧЕСКОЕ ОБНОВЛЕНИЕ ТАБЛИЦЫ (КАЖДЫЕ 15 СЕКУНД) ==========
  useEffect(() => {
    if (isPollActive) {
      // Очищаем предыдущий интервал
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      console.log('🔄 Запуск периодического обновления таблицы (каждые 15 секунд)');
      
      intervalRef.current = setInterval(() => {
        console.log('⏰ Принудительное обновление таблицы...');
        loadTableData();
      }, 15000); // ← 15 секунд
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPollActive, selectedDiscipline, selectedGroup, students]);

  // Таймер для опроса
  useEffect(() => {
    if (isPollActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPollActive && timeLeft === 0) {
      endPoll();
    }
  }, [isPollActive, timeLeft]);

  // Обработчики
  const handleGoBack = () => {
    navigate('/teacher');
  };

  const handleDisciplineChange = (value: string) => {
    setSelectedDiscipline(value);
    setTableData([]);
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setTableData([]);
  };

  const handleStatusChange = (studentId: string, status: 'P' | 'N' | 'B' | '') => {
    setTableData((prev) =>
      prev.map((row) =>
        row.studentId === studentId
          ? { ...row, status, isEdited: true }
          : row
      )
    );
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.studentId === studentId
          ? { ...row, reason, isEdited: true }
          : row
      )
    );
  };

  const startPoll = async () => {
    if (!selectedDiscipline || !selectedGroup) {
      alert('Выберите дисциплину и группу');
      return;
    }

    // Очищаем временные данные перед новым опросом
    const today = new Date().toISOString().split('T')[0];
    const tempKey = `temp_attendance_${selectedDiscipline}_${today}`;
    localStorage.removeItem(tempKey);

    // Загружаем актуальные данные
    await loadTableData();

    setIsPollActive(true);
    setTimeLeft(600);

    try {
      const pollData = {
        disciplineId: Number(selectedDiscipline),
        teacherId: user?.id,
        groupId: Number(selectedGroup),
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        active: true,
      };

      await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData),
      });

      console.log('✅ Опрос создан!');
    } catch (error) {
      console.error('❌ Ошибка создания опроса:', error);
      setIsPollActive(false);
      setTimeLeft(0);
    }
  };

  const endPoll = () => {
    setIsPollActive(false);
    setTimeLeft(0);
    
    if (pollCheckRef.current) {
      clearInterval(pollCheckRef.current);
      pollCheckRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Помечаем отсутствующих (только тех, у кого статус пустой)
    setTableData((prev) =>
      prev.map((row) => {
        if (row.status === '') {
          return { ...row, status: 'N', reason: 'Не подтвердил присутствие', isEdited: true };
        }
        return row;
      })
    );
    
    console.log('✅ Опрос завершён!');
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];
      
      for (const row of tableData) {
        if (!row.status) continue;

        const record = {
          studentId: row.studentId,
          disciplineId: Number(selectedDiscipline),
          date: today,
          status: row.status,
          reason: row.reason || '',
        };

        // Проверяем существующую запись
        const existingRes = await fetch(
          `/api/attendance?studentId=${row.studentId}&disciplineId=${selectedDiscipline}&date=${today}`
        );
        const existing = await existingRes.json();

        if (existing.length > 0) {
          await fetch(`/api/attendance/${existing[0].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });
        } else {
          await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          });
        }
      }

      // Очищаем временные данные после сохранения
      const tempKey = `temp_attendance_${selectedDiscipline}_${today}`;
      localStorage.removeItem(tempKey);

      setSaveMessage('✅ Данные успешно сохранены!');
      await loadTableData();
      
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setSaveMessage('❌ Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const disciplineOptions: SelectOption[] = disciplines.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const groupOptions: SelectOption[] = groups.map((g) => ({
    value: String(g.id),
    label: g.name,
  }));

  return (
    <div className={styles.teaching}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Преподавание</h1>
      </div>

      <div className={styles.filtersSection}>
        <Select
          options={disciplineOptions}
          value={selectedDiscipline}
          placeholder="Выберите дисциплину"
          onChange={handleDisciplineChange}
          width="calc(33% - 7px)"
        />
        <Select
          options={groupOptions}
          value={selectedGroup}
          placeholder="Выберите группу"
          onChange={handleGroupChange}
          width="calc(33% - 7px)"
        />
        <Button
          onClick={startPoll}
          disabled={!selectedDiscipline || !selectedGroup || isPollActive || loading}
          className={styles.startPollButton}
        >
          {loading ? 'Загрузка...' : 
            isPollActive ? `Опрос идет ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : 'Начать опрос'}
        </Button>
      </div>

      {selectedDiscipline && selectedGroup && (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScroll}>
            {loading ? (
              <div className={styles.loadingState}>Загрузка данных...</div>
            ) : tableData.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ФИО студента</th>
                    <th>Отметка</th>
                    <th>Причина</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`${row.isEdited ? styles.editedRow : ''} ${row.isTemp ? styles.tempRow : ''}`}
                    >
                      <td>{row.fullName}</td>
                      <td>
                        <select
                          className={styles.statusSelect}
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.studentId, e.target.value as 'P' | 'N' | 'B' | '')}
                          disabled={isPollActive && row.status === ''}
                        >
                          <option value="">—</option>
                          <option value="P">✅ Присутствовал</option>
                          <option value="N">❌ Отсутствовал</option>
                          <option value="B">🏥 По болезни</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.reasonInput}
                          value={row.reason}
                          onChange={(e) => handleReasonChange(row.studentId, e.target.value)}
                          placeholder="Причина отсутствия..."
                          disabled={row.status !== 'N' || isPollActive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>Нет студентов в выбранной группе</div>
            )}
          </div>
          {isPollActive && (
            <div className={styles.pollStatus}>
              🔄 Опрос активен. Таблица обновляется автоматически...
            </div>
          )}
        </div>
      )}

      {selectedDiscipline && selectedGroup && tableData.length > 0 && (
        <div className={styles.saveSection}>
          <Button onClick={saveAttendance} disabled={isSaving || loading} className={styles.saveButton}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          {saveMessage && <span className={styles.saveMessage}>{saveMessage}</span>}
        </div>
      )}
    </div>
  );
};