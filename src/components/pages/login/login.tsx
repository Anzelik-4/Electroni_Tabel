import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import { Logo } from '../../ui/logo/logo';
import { Input } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { authenticateUser, generateToken } from '../../../services/authService';
import { setAuth } from '../../../utils/auth';

const Login: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Отменяем перезагрузку страницы
    setError('');
    setLoading(true);

    try {
      const user = await authenticateUser(login, password);

      if (!user) {
        setError('Неверный логин или пароль');
        return;
      }

      // Сохраняем сессию
      setAuth(user, generateToken());
      
      // Перенаправляем в зависимости от роли
      navigate(user.role === 'student' ? '/student' : '/teacher');
    } catch {
      setError('Не удалось подключиться к серверу. Запустите npm run dev');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !loading) {
      const form = e.currentTarget.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return (
    <div className={styles.loginContainer} onKeyPress={handleKeyPress}>
      <div className={styles.loginForm}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
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
              disabled={loading}
            />
          </div>

          <div className={styles.inputField}>
            <Input 
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={setPassword}
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;