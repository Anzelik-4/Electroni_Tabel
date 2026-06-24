import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditGroup.module.scss';
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
  login: string;
  password: string;
  fullName: string;
  groupId: number;
}

interface StudentRow extends Student {
  isNew?: boolean;
  isDeleted?: boolean;
}

export const EditGroup: React.FC = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newStudent, setNewStudent] = useState<{ fullName: string; login: string; password: string }>({
    fullName: '',
    login: '',
    password: '',
  });
  const [addError, setAddError] = useState<string>('');

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

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

  // Загрузка студентов при выборе группы
  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/students?groupId=${selectedGroup}`);
        const data = await response.json();
        const sortedStudents = data.sort((a: Student, b: Student) => 
          a.fullName.localeCompare(b.fullName)
        );
        setStudents(sortedStudents.map((s: Student) => ({ ...s, isNew: false, isDeleted: false })));
      } catch (error) {
        console.error('Ошибка загрузки студентов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    setIsAdding(false);
    setIsDeleting(false);
    setSelectedStudents(new Set());
    setNewStudent({ fullName: '', login: '', password: '' });
    setAddError('');
  }, [selectedGroup]);

  const handleGoBack = () => {
    navigate('/teacher/curatorship');
  };

  // ========== ЛОГИКА ДОБАВЛЕНИЯ ==========

  const handleAddStudent = () => {
    setIsAdding(true);
    setIsDeleting(false);
    setSelectedStudents(new Set());
    setNewStudent({ fullName: '', login: '', password: '' });
    setAddError('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewStudent({ fullName: '', login: '', password: '' });
    setAddError('');
  };

  const handleNewStudentChange = (field: keyof typeof newStudent, value: string) => {
    setNewStudent((prev) => ({ ...prev, [field]: value }));
    setAddError('');
  };

  const handleSaveNewStudent = async () => {
    if (!newStudent.fullName.trim() || !newStudent.login.trim() || !newStudent.password.trim()) {
      setAddError('Все поля должны быть заполнены');
      return;
    }

    try {
      const response = await fetch(`/api/students?login=${newStudent.login}`);
      const existing = await response.json();
      
      if (existing.length > 0) {
        setAddError('Студент с таким логином уже существует');
        return;
      }
    } catch (error) {
      console.error('Ошибка проверки логина:', error);
      setAddError('Ошибка проверки логина');
      return;
    }

    const newStudentData: StudentRow = {
      id: `temp_${Date.now()}`,
      fullName: newStudent.fullName.trim(),
      login: newStudent.login.trim(),
      password: newStudent.password.trim(),
      groupId: Number(selectedGroup),
      isNew: true,
      isDeleted: false,
    };

    setStudents((prev) => [...prev, newStudentData]);
    setIsAdding(false);
    setNewStudent({ fullName: '', login: '', password: '' });
    setAddError('');
    setSaveMessage('✅ Студент добавлен. Не забудьте сохранить изменения!');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  // ========== ЛОГИКА УДАЛЕНИЯ ==========

  const handleDeleteMode = () => {
    setIsDeleting(true);
    setIsAdding(false);
    setSelectedStudents(new Set());
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setSelectedStudents(new Set());
  };

  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedStudents.size === 0) {
      alert('Выберите студентов для удаления');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить ${selectedStudents.size} студента(ов)?`)) {
      setStudents((prev) =>
        prev.map((student) =>
          selectedStudents.has(student.id) && !student.isNew
            ? { ...student, isDeleted: true }
            : student.isNew && selectedStudents.has(student.id)
            ? { ...student, isDeleted: true }
            : student
        )
      );
      
      setStudents((prev) => 
        prev.filter((student) => !(student.isNew && selectedStudents.has(student.id)))
      );
      
      setSelectedStudents(new Set());
      setIsDeleting(false);
      setSaveMessage('✅ Студенты отмечены для удаления. Не забудьте сохранить изменения!');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // ========== СОХРАНЕНИЕ ==========

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const studentsToAdd = students.filter((s) => s.isNew && !s.isDeleted);
      const studentsToDelete = students.filter((s) => s.isDeleted && !s.isNew);

      for (const student of studentsToDelete) {
        await fetch(`/api/students/${student.id}`, {
          method: 'DELETE',
        });
      }

      for (const student of studentsToAdd) {
        const { id, isNew, isDeleted, ...studentData } = student;
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...studentData,
            groupId: Number(selectedGroup),
          }),
        });
      }

      setSaveMessage('✅ Изменения успешно сохранены!');
      
      const response = await fetch(`/api/students?groupId=${selectedGroup}`);
      const data = await response.json();
      const sortedStudents = data.sort((a: Student, b: Student) => 
        a.fullName.localeCompare(b.fullName)
      );
      setStudents(sortedStudents.map((s: Student) => ({ ...s, isNew: false, isDeleted: false })));

      setIsAdding(false);
      setIsDeleting(false);
      setSelectedStudents(new Set());

    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setSaveMessage('❌ Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const groupOptions: SelectOption[] = groups.map((group: Group) => ({
    value: String(group.id),
    label: group.name,
  }));

  return (
    <div className={styles.editGroup}>
      <div className={styles.headerSection}>
        <Button onClick={handleGoBack} className={styles.backButton}>
          ← Назад
        </Button>
      </div>

      <div className={styles.titleSection}>
        <h1 className={styles.title}>Редактирование списка группы</h1>
        <p className={styles.subtitle}>Управление списком студентов закреплённой группы</p>
      </div>

      <div className={styles.filtersSection}>
        <Select
          options={groupOptions}
          value={selectedGroup}
          placeholder="Выберите группу"
          onChange={setSelectedGroup}
          width="100%"
        />
      </div>

      {selectedGroup && (
        <div className={styles.contentWrapper}>
          {/* Таблица студентов */}
          <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
              {loading ? (
                <div className={styles.loadingState}>Загрузка...</div>
              ) : students.length > 0 ? (
                <table className={styles.studentTable}>
                  <thead>
                    <tr>
                      {isDeleting && <th style={{ width: '50px' }}>✓</th>}
                      <th>№</th>
                      <th>ФИО</th>
                      <th>Логин</th>
                      <th>Пароль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const isSelected = selectedStudents.has(student.id);
                      const isDeleted = student.isDeleted;

                      if (isDeleted) return null;

                      return (
                        <tr key={student.id} className={student.isNew ? styles.newRow : ''}>
                          {isDeleting && (
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleStudentSelection(student.id)}
                                disabled={student.isNew}
                              />
                            </td>
                          )}
                          <td>{index + 1}</td>
                          <td className={styles.studentName}>{student.fullName}</td>
                          <td>{student.login}</td>
                          <td>{student.password}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>В группе нет студентов</div>
              )}
            </div>
          </div>

          {/* Форма добавления студента */}
          {isAdding && (
            <div className={styles.addForm}>
              <h3>Добавление нового студента</h3>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>ФИО</label>
                  <input
                    type="text"
                    value={newStudent.fullName}
                    onChange={(e) => handleNewStudentChange('fullName', e.target.value)}
                    placeholder="Введите ФИО"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Логин</label>
                  <input
                    type="text"
                    value={newStudent.login}
                    onChange={(e) => handleNewStudentChange('login', e.target.value)}
                    placeholder="Введите логин"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Пароль</label>
                  <input
                    type="text"
                    value={newStudent.password}
                    onChange={(e) => handleNewStudentChange('password', e.target.value)}
                    placeholder="Введите пароль"
                  />
                </div>
                <Button onClick={handleSaveNewStudent} className={styles.saveNewButton}>
                  Сохранить
                </Button>
              </div>
              {addError && <div className={styles.errorMessage}>{addError}</div>}
            </div>
          )}

          {/* Кнопки под таблицей */}
          <div className={styles.actionsSection}>
            <Button onClick={handleAddStudent} className={styles.actionButton} disabled={isDeleting}>
              ➕ Добавить студента
            </Button>
            <Button onClick={handleDeleteMode} className={styles.actionButton} disabled={isAdding}>
              🗑️ Удалить студента
            </Button>
            {isDeleting && (
              <Button onClick={handleDeleteSelected} className={styles.actionButton}>
                Подтвердить удаление
              </Button>
            )}
            {(isAdding || isDeleting) && (
              <Button onClick={isAdding ? handleCancelAdd : handleCancelDelete} className={styles.actionButton}>
                Отмена
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving} className={styles.actionButton}>
              {isSaving ? 'Сохранение...' : '💾 Сохранить'}
            </Button>
          </div>

          {saveMessage && (
            <div className={`${styles.saveMessage} ${saveMessage.includes('❌') ? styles.error : ''}`}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};