import React, { useState } from 'react';
import styles from './login.module.scss';
import { Logo } from '../../ui/logo/logo';
import { Input } from '../../ui/input/input';
import { Button } from '../../ui/button/button';

const Login: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    console.log('Логин:', login);
    console.log('Пароль:', password);
    // Логика авторизации
  };

  return (
    <div className={styles.loginContainer}>
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

        {/* Кнопка теперь будет растягиваться на всю ширину формы */}
        <Button onClick={handleLogin}>
          Войти
        </Button>

      </div>
    </div>
  );
};

export default Login;