import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🖥️ Server Room</h2>
        <p>Supervision IoT</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          👤 Utilisateurs
        </NavLink>
        <NavLink to="/sites" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🏢 Sites
        </NavLink>
        <NavLink to="/rooms" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🚪 Salles
        </NavLink>
        <NavLink to="/equipment" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🖥️ Équipements
        </NavLink>
        <NavLink to="/incidents" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🚨 Incidents
        </NavLink>
        <NavLink to="/access-logs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🔑 Accès RFID
        </NavLink>
        <NavLink to="/sensors" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          🌡️ Capteurs
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        🚪 Déconnexion
      </button>
    </div>
  );
};

export default Sidebar;