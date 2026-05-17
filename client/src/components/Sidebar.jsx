import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="leoni-logo">
          <span className="logo-text">L</span>
          <span className="logo-text">E</span>
          <span className="logo-text">O</span>
          <span className="logo-text">N</span>
          <span className="logo-text">I</span>
        </div>
        <p className="subtitle-text">Supervision de Salle Serveur</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">▦</span> Dashboard
        </NavLink>
        {(user?.role === 'admin' || user?.isSuperAdmin || user?.role === 'responsable_site') && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">👥</span> Utilisateurs
          </NavLink>
        )}
        {user?.isSuperAdmin && (
          <NavLink to="/pending-approvals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📋</span> Approbations
          </NavLink>
        )}
        <NavLink to="/sites" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">⊞</span> Sites
        </NavLink>
        <NavLink to="/rooms" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">◇</span> Salles
        </NavLink>
        <NavLink to="/equipment" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">⚙️</span> Équipements
        </NavLink>
        <NavLink to="/incidents" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">◈</span> Incidents
        </NavLink>
        <NavLink to="/access-logs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🔐</span> Accès RFID
        </NavLink>
        <NavLink to="/sensors" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">📡</span> Capteurs
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <span className="nav-icon">⊘</span> Déconnexion
      </button>
    </div>
  );
};

export default Sidebar;