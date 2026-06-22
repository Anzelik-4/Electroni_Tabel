import { logout } from '../../../utils/auth';
import { useNavigate } from 'react-router-dom';

export const MainTeacher = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div>
      <h1>Страница преподавателя</h1>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
};