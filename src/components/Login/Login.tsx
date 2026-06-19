import React from 'react';
import './Login.css'; 

const Login: React.FC = () => {
  return (
    // Главный контейнер - занимает весь экран и центрирует форму
    <div className="login-container">
      {/* Сама форма авторизации */}
      <div className="login-form">
        
        {/* === БЛОК С ЛОГОТИПОМ, ЗАГОЛОВКОМ И ПОДЗАГОЛОВКОМ === */}
        <div className="header-block">
          
          {/* Логотип - круглая область 70x70px */}
          <div className="logo">
            {/* Сюда вы потом вставите картинку */}
            <img src="src/assets/logo.png" alt="Логотип" />
          </div>
          
          {/* Заголовок "Табель посещения" */}
          <h1 className="title">Табель посещения</h1>
          
          {/* Подзаголовок */}
          <p className="subtitle">Войдите для отметки или просмотра табелей</p>
        </div>

        {/* === ПОЛЕ ДЛЯ ВВОДА ЛОГИНА === */}
        <div className="input-field">
          <input 
            type="text" 
            placeholder="Логин" 
            className="login-input"
          />
        </div>

        {/* === ПОЛЕ ДЛЯ ВВОДА ПАРОЛЯ === */}
        <div className="input-field">
          <input 
            type="password" 
            placeholder="Пароль" 
            className="password-input"
          />
        </div>

        {/* === КНОПКА "ВОЙТИ" === */}
        <button className="login-button">
          Войти
        </button>

      </div>
    </div>
  );
};

export default Login;