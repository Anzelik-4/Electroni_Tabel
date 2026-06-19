import React from 'react';
import styles from './login.module.scss'; 

const Login: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        
        <div className={styles.headerBlock}>
          <div className={styles.logo}>
            <img src="src/assets/logo.png" alt="Логотип" />
          </div>
          
          <h1 className={styles.title}>Табель посещения</h1>
          
          <p className={styles.subtitle}>Войдите для отметки или просмотра табелей</p>
        </div>

        <div className={styles.inputField}>
          <input 
            type="text" 
            placeholder="Логин" 
            className={styles.loginInput}
          />
        </div>

        <div className={styles.inputField}>
          <input 
            type="password" 
            placeholder="Пароль" 
            className={styles.passwordInput}
          />
        </div>

        <button className={styles.loginButton}>
          Войти
        </button>

      </div>
    </div>
  );
};

export default Login;