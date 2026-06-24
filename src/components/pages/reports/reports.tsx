import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Reports.module.scss';
import { Button } from '../../ui/button/button';
import { Select } from '../../ui/select/select';
import type { SelectOption } from '../../ui/select/select';
import { getUser } from '../../../utils/auth';

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
  id: string;
  studentId: string;
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

interface DailyReportRow {
  number: number;
  studentName: string;
  disciplines: { [key: string]: string };
  reason: string;
}

interface WeeklyReportRow {
  number: number;
  studentName: string;
  days: { [key: string]: string };
  total: number;
  valid: number;
  invalid: number;
  conversation: boolean;
  phoneCall: boolean;
  personalMeeting: boolean;
  writtenNotice: boolean;
  studentCouncil: boolean;
  psychologicalService: boolean;
  headNote: string;
}

interface MonthlyReportRow {
  number: number;
  studentName: string;
  days: { [key: string]: string };
  total: number;
  valid: number;
  invalid: number;
  conversation: boolean;
  phoneCall: boolean;
  personalMeeting: boolean;
  writtenNotice: boolean;
}

type ReportType = 'daily' | 'weekly' | 'monthly';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [groups, setGroups] = useState<Group[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyData, setDailyData] = useState<DailyReportRow[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('daily');

  // Загрузка групп преподавателя
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups?teacherId=${user?.id}`);
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('Ошибка загрузки групп:', error);
      }
    };

    if (user?.id) {
      fetchGroups();
    }
  }, [user]);

  // Загрузка всех дисциплин
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetch('/api/disciplines');
        const data = await response.json();
        setDisciplines(data);
      } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
      }
    };

    fetchDisciplines();
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
        const sortedStudents = data.sort((a: Student, b: Student) => 
          a.fullName.localeCompare(b.fullName)
        );
        setStudents(sortedStudents);
      } catch (error) {
        console.error('Ошибка загрузки студентов:', error);
      }
    };

    fetchStudents();
  }, [selectedGroup]);

  // Получение дней для отчёта
  const getMonthDays = (): string[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: string[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Получение дат для недельного отчёта (пн-сб)
  const getWeekDays = (): string[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    
    const days: string[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  // Загрузка данных в зависимости от типа отчёта
  useEffect(() => {
    if (!selectedGroup || students.length === 0) {
      setDailyData([]);
      setWeeklyData([]);
      setMonthlyData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (reportType === 'daily') {
          await fetchDailyReport();
        } else if (reportType === 'weekly') {
          await fetchWeeklyReport();
        } else {
          await fetchMonthlyReport();
        }
      } catch (error) {
        console.error('Ошибка загрузки отчёта:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGroup, students, reportType]);

  const fetchDailyReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`/api/attendance?date=${today}`);
    const allRecords = await response.json();

    const groupDisciplines = disciplines.filter(d => d.groupId === Number(selectedGroup));

    const report: DailyReportRow[] = students.map((student, index) => {
      const studentRecords = allRecords.filter(
        (record: AttendanceRecord) => record.studentId === student.id
      );

      const disciplinesStatus: { [key: string]: string } = {};
      groupDisciplines.forEach((discipline) => {
        const record = studentRecords.find(
          (r: AttendanceRecord) => r.disciplineId === discipline.id
        );
        if (record) {
          const statusMap: { [key: string]: string } = {
            'P': '✅',
            'N': '❌',
            'B': '🏥',
          };
          disciplinesStatus[discipline.id] = statusMap[record.status] || '';
        } else {
          disciplinesStatus[discipline.id] = '';
        }
      });

      const absenceRecord = studentRecords.find(
        (r: AttendanceRecord) => r.status === 'N' || r.status === 'B'
      );
      const reason = absenceRecord?.reason || '';

      return {
        number: index + 1,
        studentName: student.fullName,
        disciplines: disciplinesStatus,
        reason: reason,
      };
    });

    setDailyData(report);
  };

  const fetchWeeklyReport = async () => {
    const weekDays = getWeekDays();
    const allRecords: AttendanceRecord[] = [];

    for (const date of weekDays) {
      const response = await fetch(`/api/attendance?date=${date}`);
      const records = await response.json();
      allRecords.push(...records);
    }

    const report: WeeklyReportRow[] = students.map((student, index) => {
      const studentRecords = allRecords.filter(
        (record: AttendanceRecord) => record.studentId === student.id
      );

      const daysStatus: { [key: string]: string } = {};
      let total = 0;
      let valid = 0;
      let invalid = 0;

      weekDays.forEach((date) => {
        const record = studentRecords.find((r) => r.date === date);
        if (record) {
          const statusMap: { [key: string]: string } = {
            'P': '✅',
            'N': '❌',
            'B': '🏥',
          };
          daysStatus[date] = statusMap[record.status] || '';
          
          if (record.status === 'N' || record.status === 'B') {
            total++;
            if (record.status === 'B') {
              valid++;
            } else {
              invalid++;
            }
          }
        } else {
          daysStatus[date] = '';
        }
      });

      return {
        number: index + 1,
        studentName: student.fullName,
        days: daysStatus,
        total,
        valid,
        invalid,
        conversation: false,
        phoneCall: false,
        personalMeeting: false,
        writtenNotice: false,
        studentCouncil: false,
        psychologicalService: false,
        headNote: '',
      };
    });

    setWeeklyData(report);
  };

  const fetchMonthlyReport = async () => {
    const monthDays = getMonthDays();
    const allRecords: AttendanceRecord[] = [];

    for (const date of monthDays) {
      const response = await fetch(`/api/attendance?date=${date}`);
      const records = await response.json();
      allRecords.push(...records);
    }

    const report: MonthlyReportRow[] = students.map((student, index) => {
      const studentRecords = allRecords.filter(
        (record: AttendanceRecord) => record.studentId === student.id
      );

      const daysStatus: { [key: string]: string } = {};
      let total = 0;
      let valid = 0;
      let invalid = 0;

      monthDays.forEach((date) => {
        const record = studentRecords.find((r) => r.date === date);
        if (record) {
          const statusMap: { [key: string]: string } = {
            'P': '✅',
            'N': '❌',
            'B': '🏥',
          };
          daysStatus[date] = statusMap[record.status] || '';
          
          if (record.status === 'N' || record.status === 'B') {
            total++;
            if (record.status === 'B') {
              valid++;
            } else {
              invalid++;
            }
          }
        } else {
          daysStatus[date] = '';
        }
      });

      return {
        number: index + 1,
        studentName: student.fullName,
        days: daysStatus,
        total,
        valid,
        invalid,
        conversation: false,
        phoneCall: false,
        personalMeeting: false,
        writtenNotice: false,
      };
    });

    setMonthlyData(report);
  };

  const handleGoBack = () => {
    navigate('/teacher/curatorship');
  };

  const groupOptions: SelectOption[] = groups.map((group: Group) => ({
    value: String(group.id),
    label: group.name,
  }));

  const reportTypeOptions: SelectOption[] = [
    { value: 'daily', label: '📅 Ежедневный' },
    { value: 'weekly', label: '📊 Еженедельный' },
    { value: 'monthly', label: '📈 Ежемесячный' },
  ];

  // ========== ЭКСПОРТ В WORD ==========

  const handleExportDailyWord = () => {
    if (dailyData.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const groupName = groups.find(g => String(g.id) === selectedGroup)?.name || '';
    const groupDisciplines = disciplines.filter(d => d.groupId === Number(selectedGroup));
    
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Ежедневный отчет</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11px; margin: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { border: 1px solid #000000; padding: 4px 3px; text-align: center; font-weight: bold; }
          td { border: 1px solid #000000; padding: 4px 3px; text-align: center; }
          .student-name { text-align: left; padding-left: 6px; }
          .reason-cell { text-align: left; padding-left: 6px; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width: 30px;">№ п/п</th>
          <th rowspan="2" style="width: 150px;">Ф. И. обучающегося</th>
          <th colspan="${groupDisciplines.length}" style="text-align: center;">Наименование дисциплин</th>
          <th rowspan="2" style="width: 150px;">Причина отсутствия обучающегося на занятиях (заполняет кл. руководитель)</th>
        </tr>
        <tr>
          ${groupDisciplines.map(() => `<th style="width: 30px;"> </th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${dailyData.map((row) => `
          <tr>
            <td>${row.number}</td>
            <td class="student-name">${row.studentName}</td>
            ${groupDisciplines.map((d) => `<td>${row.disciplines[d.id] || ''}</td>`).join('')}
            <td class="reason-cell">${row.reason}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="text-align: left; padding-left: 6px;">
            <b>Подпись преподавателя каждой дисциплины</b>
          </td>
          ${groupDisciplines.map(() => `<td></td>`).join('')}
          <td></td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>
  `;

    const blob = new Blob([htmlContent], {
      type: 'application/msword;charset=utf-8'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    link.download = `Ежедневный_отчет_${groupName}_${today}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExportWeeklyWord = () => {
    if (weeklyData.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const groupName = groups.find(g => String(g.id) === selectedGroup)?.name || '';
    const weekDays = getWeekDays();
    const dateLabels = weekDays.map(d => {
      const date = new Date(d);
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    });

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Еженедельный отчет</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 9px; margin: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 8px; }
          th { border: 1px solid #000000; padding: 3px 2px; text-align: center; font-weight: bold; }
          td { border: 1px solid #000000; padding: 3px 2px; text-align: center; }
          .student-name { text-align: left; padding-left: 4px; }
          .header-cell { background-color: #f0f0f0; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width: 25px;">№ п/п</th>
          <th rowspan="2" style="width: 120px;">Ф. И. обучающегося</th>
          <th colspan="6" class="header-cell">число</th>
          <th rowspan="2" style="width: 35px;">Всего</th>
          <th rowspan="2" style="width: 45px;">Уважительные</th>
          <th rowspan="2" style="width: 50px;">Неуважительные</th>
          <th colspan="8" class="header-cell">Содержание работы классного руководителя</th>
          <th rowspan="2" style="width: 50px;">Отметка заведующей отделением о направлении студента на Совет профилактики</th>
        </tr>
        <tr>
          ${dateLabels.map(d => `<th style="width: 25px;">${d}</th>`).join('')}
          <th style="width: 35px;">Беседа со студентом</th>
          <th colspan="3" style="width: 80px;">Работа с родителями</th>
          <th colspan="4" style="width: 100px;">Направлено ходатайство для проведения профилактической работы</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          ${dateLabels.map(() => `<th></th>`).join('')}
          <th></th>
          <th></th>
          <th></th>
          <th style="width: 30px;">телеф. звонок</th>
          <th style="width: 30px;">личная беседа</th>
          <th style="width: 35px;">письменное уведомление</th>
          <th style="width: 30px;">в студенческий Совет</th>
          <th style="width: 40px;">в социально-психологическую службу</th>
          <th style="width: 35px;">заведующей отделением</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${weeklyData.map((row) => `
          <tr>
            <td>${row.number}</td>
            <td class="student-name">${row.studentName}</td>
            ${weekDays.map(d => `<td>${row.days[d] || ''}</td>`).join('')}
            <td>${row.total}</td>
            <td>${row.valid}</td>
            <td>${row.invalid}</td>
            <td>${row.conversation ? '✓' : ''}</td>
            <td>${row.phoneCall ? '✓' : ''}</td>
            <td>${row.personalMeeting ? '✓' : ''}</td>
            <td>${row.writtenNotice ? '✓' : ''}</td>
            <td>${row.studentCouncil ? '✓' : ''}</td>
            <td>${row.psychologicalService ? '✓' : ''}</td>
            <td>${row.headNote || ''}</td>
            <td></td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2"><b>Итого</b></td>
          ${weekDays.map(() => `<td></td>`).join('')}
          <td>${weeklyData.reduce((sum, r) => sum + r.total, 0)}</td>
          <td>${weeklyData.reduce((sum, r) => sum + r.valid, 0)}</td>
          <td>${weeklyData.reduce((sum, r) => sum + r.invalid, 0)}</td>
          ${Array(8).fill('<td></td>').join('')}
        </tr>
      </tbody>
    </table>
  </body>
  </html>
  `;

    const blob = new Blob([htmlContent], {
      type: 'application/msword;charset=utf-8'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    link.download = `Еженедельный_отчет_${groupName}_${today}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExportMonthlyWord = () => {
    if (monthlyData.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const groupName = groups.find(g => String(g.id) === selectedGroup)?.name || '';
    const monthDays = getMonthDays();
    const dateLabels = monthDays.map(d => {
      const date = new Date(d);
      return date.getDate().toString();
    });

    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Ежемесячный отчет</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 7px; margin: 5px; }
          table { width: 100%; border-collapse: collapse; font-size: 6px; }
          th { border: 1px solid #000000; padding: 2px 1px; text-align: center; font-weight: bold; }
          td { border: 1px solid #000000; padding: 2px 1px; text-align: center; }
          .student-name { text-align: left; padding-left: 3px; }
          .header-cell { background-color: #f0f0f0; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width: 20px;">№ п/п</th>
          <th rowspan="2" style="width: 100px;">ФИО обучающегося</th>
          <th colspan="${monthDays.length}" class="header-cell">Число</th>
          <th rowspan="2" style="width: 30px;">Всего</th>
          <th rowspan="2" style="width: 35px;">Уважительные</th>
          <th rowspan="2" style="width: 40px;">Неуважительные</th>
          <th colspan="5" class="header-cell">Содержание работы классного руководителя</th>
        </tr>
        <tr>
          ${dateLabels.map(d => `<th style="width: 12px;">${d}</th>`).join('')}
          <th style="width: 30px;">Беседа со студентом</th>
          <th colspan="3" style="width: 60px;">Работа с родителями</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          ${dateLabels.map(() => `<th></th>`).join('')}
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th style="width: 25px;">телеф. звонок</th>
          <th style="width: 25px;">личная беседа</th>
          <th style="width: 30px;">письменное уведомление</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyData.map((row) => `
          <tr>
            <td>${row.number}</td>
            <td class="student-name">${row.studentName}</td>
            ${monthDays.map(d => `<td>${row.days[d] || ''}</td>`).join('')}
            <td>${row.total}</td>
            <td>${row.valid}</td>
            <td>${row.invalid}</td>
            <td>${row.conversation ? '✓' : ''}</td>
            <td>${row.phoneCall ? '✓' : ''}</td>
            <td>${row.personalMeeting ? '✓' : ''}</td>
            <td>${row.writtenNotice ? '✓' : ''}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2"><b>Итого</b></td>
          ${monthDays.map(() => `<td></td>`).join('')}
          <td>${monthlyData.reduce((sum, r) => sum + r.total, 0)}</td>
          <td>${monthlyData.reduce((sum, r) => sum + r.valid, 0)}</td>
          <td>${monthlyData.reduce((sum, r) => sum + r.invalid, 0)}</td>
          ${Array(5).fill('<td></td>').join('')}
        </tr>
      </tbody>
    </table>
  </body>
  </html>
  `;

    const blob = new Blob([htmlContent], {
      type: 'application/msword;charset=utf-8'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    link.download = `Ежемесячный_отчет_${groupName}_${today}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExport = () => {
    if (reportType === 'daily') {
      handleExportDailyWord();
    } else if (reportType === 'weekly') {
      handleExportWeeklyWord();
    } else {
      handleExportMonthlyWord();
    }
  };

  // ========== ОТОБРАЖЕНИЕ ТАБЛИЦ ==========

  const renderTable = () => {
    if (loading) {
      return <div className={styles.loadingState}>Загрузка отчёта...</div>;
    }

    if (reportType === 'daily') {
      const groupDisciplines = disciplines.filter(d => d.groupId === Number(selectedGroup));
      
      if (dailyData.length === 0) {
        return <div className={styles.emptyState}>Нет данных для отчёта</div>;
      }

      return (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.dailyTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>№ п/п</th>
                  <th rowSpan={2}>Ф. И. обучающегося</th>
                  <th colSpan={groupDisciplines.length}>Наименование дисциплин</th>
                  <th rowSpan={2}>Причина отсутствия обучающегося на занятиях (заполняет кл. руководитель)</th>
                </tr>
                <tr>
                  {groupDisciplines.map((d) => (
                    <th key={d.id} className={styles.disciplineHeader}>{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyData.map((row) => (
                  <tr key={row.number}>
                    <td>{row.number}</td>
                    <td className={styles.studentName}>{row.studentName}</td>
                    {groupDisciplines.map((d) => (
                      <td key={d.id}>{row.disciplines[d.id] || ''}</td>
                    ))}
                    <td className={styles.reasonCell}>{row.reason}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className={styles.signatureCell}>
                    <b>Подпись преподавателя каждой дисциплины</b>
                  </td>
                  {groupDisciplines.map((d) => (
                    <td key={d.id}></td>
                  ))}
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.exportSection}>
            <Button onClick={handleExport} className={styles.exportButton}>
              📄 Скачать в формате Word
            </Button>
          </div>
        </>
      );
    }

    if (reportType === 'weekly') {
      if (weeklyData.length === 0) {
        return <div className={styles.emptyState}>Нет данных для отчёта</div>;
      }

      const weekDays = getWeekDays();
      const dateLabels = weekDays.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      });

      return (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.weeklyTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>№ п/п</th>
                  <th rowSpan={2}>Ф. И. обучающегося</th>
                  <th colSpan={6} className={styles.headerCell}>число</th>
                  <th rowSpan={2}>Всего</th>
                  <th rowSpan={2}>Уважительные</th>
                  <th rowSpan={2}>Неуважительные</th>
                  <th colSpan={8} className={styles.headerCell}>Содержание работы классного руководителя</th>
                  <th rowSpan={2}>Отметка заведующей отделением о направлении студента на Совет профилактики</th>
                </tr>
                <tr>
                  {dateLabels.map((d, i) => (
                    <th key={i}>{d}</th>
                  ))}
                  <th>Беседа со студентом</th>
                  <th colSpan={3}>Работа с родителями</th>
                  <th colSpan={4}>Направлено ходатайство для проведения профилактической работы</th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  {dateLabels.map((_, i) => <th key={i}></th>)}
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>телеф. звонок</th>
                  <th>личная беседа</th>
                  <th>письменное уведомление</th>
                  <th>в студенческий Совет</th>
                  <th>в социально-психологическую службу</th>
                  <th>заведующей отделением</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((row) => (
                  <tr key={row.number}>
                    <td>{row.number}</td>
                    <td className={styles.studentName}>{row.studentName}</td>
                    {weekDays.map((d, i) => (
                      <td key={i}>{row.days[d] || ''}</td>
                    ))}
                    <td>{row.total}</td>
                    <td>{row.valid}</td>
                    <td>{row.invalid}</td>
                    <td>{row.conversation ? '✓' : ''}</td>
                    <td>{row.phoneCall ? '✓' : ''}</td>
                    <td>{row.personalMeeting ? '✓' : ''}</td>
                    <td>{row.writtenNotice ? '✓' : ''}</td>
                    <td>{row.studentCouncil ? '✓' : ''}</td>
                    <td>{row.psychologicalService ? '✓' : ''}</td>
                    <td>{row.headNote || ''}</td>
                    <td></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}><b>Итого</b></td>
                  {weekDays.map((_, i) => <td key={i}></td>)}
                  <td>{weeklyData.reduce((sum, r) => sum + r.total, 0)}</td>
                  <td>{weeklyData.reduce((sum, r) => sum + r.valid, 0)}</td>
                  <td>{weeklyData.reduce((sum, r) => sum + r.invalid, 0)}</td>
                  {Array(8).fill(null).map((_, i) => <td key={i}></td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.exportSection}>
            <Button onClick={handleExport} className={styles.exportButton}>
              📄 Скачать в формате Word
            </Button>
          </div>
        </>
      );
    }

    // Monthly
    if (monthlyData.length === 0) {
      return <div className={styles.emptyState}>Нет данных для отчёта</div>;
    }

    const monthDays = getMonthDays();

    return (
      <>
        <div className={styles.tableContainer}>
          <table className={styles.monthlyTable}>
            <thead>
              <tr>
                <th rowSpan={2}>№ п/п</th>
                <th rowSpan={2}>ФИО обучающегося</th>
                <th colSpan={monthDays.length} className={styles.headerCell}>Число</th>
                <th rowSpan={2}>Всего</th>
                <th rowSpan={2}>Уважительные</th>
                <th rowSpan={2}>Неуважительные</th>
                <th colSpan={5} className={styles.headerCell}>Содержание работы классного руководителя</th>
              </tr>
              <tr>
                {monthDays.map((d, i) => {
                  const date = new Date(d);
                  return <th key={i}>{date.getDate()}</th>;
                })}
                <th>Беседа со студентом</th>
                <th colSpan={3}>Работа с родителями</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                {monthDays.map((_, i) => <th key={i}></th>)}
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>телеф. звонок</th>
                <th>личная беседа</th>
                <th>письменное уведомление</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.number}>
                  <td>{row.number}</td>
                  <td className={styles.studentName}>{row.studentName}</td>
                  {monthDays.map((d, i) => (
                    <td key={i}>{row.days[d] || ''}</td>
                  ))}
                  <td>{row.total}</td>
                  <td>{row.valid}</td>
                  <td>{row.invalid}</td>
                  <td>{row.conversation ? '✓' : ''}</td>
                  <td>{row.phoneCall ? '✓' : ''}</td>
                  <td>{row.personalMeeting ? '✓' : ''}</td>
                  <td>{row.writtenNotice ? '✓' : ''}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}><b>Итого</b></td>
                {monthDays.map((_, i) => <td key={i}></td>)}
                <td>{monthlyData.reduce((sum, r) => sum + r.total, 0)}</td>
                <td>{monthlyData.reduce((sum, r) => sum + r.valid, 0)}</td>
                <td>{monthlyData.reduce((sum, r) => sum + r.invalid, 0)}</td>
                {Array(5).fill(null).map((_, i) => <td key={i}></td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.exportSection}>
          <Button onClick={handleExport} className={styles.exportButton}>
            📄 Скачать в формате Word
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className={styles.reports}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>
          {reportType === 'daily' ? 'Ежедневный отчет' : 
           reportType === 'weekly' ? 'Еженедельный отчет' : 'Ежемесячный отчет'}
        </h1>
        <p className={styles.subtitle}>
          {reportType === 'daily' 
            ? 'Формирование ежедневного отчета посещаемости'
            : reportType === 'weekly'
            ? 'Формирование еженедельного отчета посещаемости'
            : 'Формирование ежемесячного отчета посещаемости'}
        </p>
      </div>

      <div className={styles.filtersSection}>
        <Select
          options={groupOptions}
          value={selectedGroup}
          placeholder="Выберите группу"
          onChange={setSelectedGroup}
          width="calc(50% - 5px)"
        />
        <Select
          options={reportTypeOptions}
          value={reportType}
          placeholder="Выберите тип отчёта"
          onChange={(value) => setReportType(value as ReportType)}
          width="calc(50% - 5px)"
        />
      </div>

      {selectedGroup && (
        <div className={styles.tableWrapper}>
          {renderTable()}
        </div>
      )}
    </div>
  );
};