import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Absences.module.scss';
import { Button } from '../../ui/button/button';
import { Select } from '../../ui/select/select';
import type { SelectOption } from '../../ui/select/select';
import { Table } from '../../ui/table/table';
import type { Column } from '../../ui/table/table';
import { getUser } from '../../../utils/auth';

interface AttendanceRecord {
  id: string;
  studentId: number;
  disciplineId: number;
  date: string;
  status: 'P' | 'N' | 'B' | '';
  reason: string;
}

interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

interface AbsenceRow {
  date: string;
  status: string;
  reason: string;
}

export const Absences: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AbsenceRow[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Загрузка ВСЕХ дисциплин (не только тех, что у студента)
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        // Загружаем все дисциплины из базы
        const response = await fetch('/api/disciplines');
        const data = await response.json();
        setDisciplines(data);
      } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
      }
    };

    fetchDisciplines();
  }, []);

  // Загрузка записей посещаемости студента
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/attendance?studentId=${user.id}`);
        const data = await response.json();
        setAttendance(data);
      } catch (error) {
        console.error('Ошибка загрузки посещаемости:', error);
      }
    };

    fetchAttendance();
  }, [user]);

  // Фильтрация данных
  useEffect(() => {
    if (!selectedPeriod || !selectedDiscipline) {
      setFilteredData([]);
      return;
    }

    const allDates = getAllDatesInPeriod(startDate, endDate);

    const disciplineRecords = attendance.filter(
      (record) => record.disciplineId === Number(selectedDiscipline)
    );

    const rows: AbsenceRow[] = allDates.map((date) => {
      const record = disciplineRecords.find((r) => r.date === date);
      if (record) {
        const statusMap = {
          P: '✅ Присутствовал',
          N: '❌ Отсутствовал',
          B: '🏥 По болезни',
        };
        return {
          date,
          status: statusMap[record.status as keyof typeof statusMap] || '',
          reason: record.reason || '',
        };
      }
      return {
        date,
        status: '',
        reason: '',
      };
    });

    setFilteredData(rows);
  }, [selectedPeriod, selectedDiscipline, startDate, endDate, attendance]);

  const getAllDatesInPeriod = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const handleGoBack = () => {
    navigate('/student');
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    if (value === 'all') {
      const end = new Date();
      const start = new Date(2026, 0, 1);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (value === 'week') {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (value === 'month') {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleDisciplineChange = (value: string) => {
    setSelectedDiscipline(value);
  };

  const periodOptions: SelectOption[] = [
    { value: 'all', label: 'За всё время' },
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
  ];

  // Все дисциплины из базы
  const disciplineOptions: SelectOption[] = disciplines.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const columns: Column<AbsenceRow>[] = [
    {
      key: 'date',
      title: 'Дата',
      width: '20%',
      render: (row) => row.date,
    },
    {
      key: 'status',
      title: 'Отметка',
      width: '40%',
      render: (row) => row.status || '—',
    },
    {
      key: 'reason',
      title: 'Причина',
      width: '40%',
      render: (row) => row.reason || '—',
    },
  ];

  return (
    <div className={styles.absences}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Твои пропуски</h1>
      </div>

      <div className={styles.filtersSection}>
        <Select
          options={periodOptions}
          value={selectedPeriod}
          placeholder="Выберите период"
          onChange={handlePeriodChange}
          width="calc(50% - 5px)"
        />
        <Select
          options={disciplineOptions}
          value={selectedDiscipline}
          placeholder="Выберите дисциплину"
          onChange={handleDisciplineChange}
          width="calc(50% - 5px)"
        />
      </div>

      {selectedPeriod && selectedDiscipline && filteredData.length > 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScroll}>
            <Table data={filteredData} columns={columns} />
          </div>
        </div>
      ) : selectedPeriod && selectedDiscipline && filteredData.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Нет записей за выбранный период</p>
        </div>
      ) : null}
    </div>
  );
};