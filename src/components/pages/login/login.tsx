import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import { Logo } from '../../ui/logo/logo';
import { Input } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { setUserRole, setAuthenticated } from '../../../utils/auth'; // Импортируем функции

const Login: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  const handleLogin = () => {
    setError('');

    if (!login.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (login === '1' && password === '1') {
      // Сохраняем данные авторизации
      setAuthenticated(true);
      setUserRole('student');
      navigate('/student');
      console.log('Вход выполнен как СТУДЕНТ');
    } else if (login === '2' && password === '2') {
      // Сохраняем данные авторизации
      setAuthenticated(true);
      setUserRole('teacher');
      navigate('/teacher');
      console.log('Вход выполнен как ПРЕПОДАВАТЕЛЬ');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={styles.loginContainer} onKeyPress={handleKeyPress}>
      <div className={styles.loginForm}>
        
        <div className={styles.headerBlock}>
          <Logo className={styles.logo} />
          <h1 className={styles.title}>Табель посещения</h1>
          <p className={styles.subtitle}>Войдите для отметки или просмотра табелей</p>
        </div>

        <div className={styles.inputField}>
          <Input 
            placeholder="Логин"
            type="text"
            value={login}
            onChange={setLogin}
          />
        </div>

        <div className={styles.inputField}>
          <Input 
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={setPassword}
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <Button onClick={handleLogin}>
          Войти
        </Button>

      </div>
    </div>
  );
};

export default Login;