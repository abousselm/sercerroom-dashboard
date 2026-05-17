import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isSuperAdmin;

  const [stats, setStats] = useState({
    users: 0,
    sites: 0,
    rooms: 0,
    incidents: 0,
    equipments: 0,
    eolAlerts: 0
  });
  const [recentAccess, setRecentAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises = [
        API.get('/sites'),
        API.get('/rooms'),
        API.get('/incidents/stats'),
        API.get('/equipments'),
        API.get('/eol-alerts/unresolved'),
        API.get('/access')
      ];

      // Ne charger /users que pour les admins
      if (isAdmin) {
        promises.push(API.get('/users'));
      }

      const results = await Promise.all(promises);

      let idx = 0;
      const sitesRes = results[idx++];
      const roomsRes = results[idx++];
      const incidentsRes = results[idx++];
      const equipmentsRes = results[idx++];
      const eolAlertsRes = results[idx++];
      const accessRes = results[idx++];
      const usersRes = isAdmin ? results[idx++] : { data: [] };

      setStats({
        users: usersRes.data.length || 0,
        sites: sitesRes.data.length || 0,
        rooms: roomsRes.data.length || 0,
        incidents: incidentsRes.data.unresolved || 0,
        equipments: equipmentsRes.data.length || 0,
        eolAlerts: eolAlertsRes.data.length || 0
      });

      setRecentAccess(accessRes.data.slice(0, 5));

    } catch (error) {
      console.error('Erreur dashboard :', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="loading">Chargement...</div>
      </div>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Vue d'ensemble du système</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {isAdmin && (
            <div className="stat-card blue">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <h3>{stats.users}</h3>
                <p>Utilisateurs</p>
              </div>
            </div>
          )}
          <div className="stat-card green">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <h3>{stats.sites}</h3>
              <p>Sites</p>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">🚪</div>
            <div className="stat-info">
              <h3>{stats.rooms}</h3>
              <p>Salles</p>
            </div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">🖥️</div>
            <div className="stat-info">
              <h3>{stats.equipments}</h3>
              <p>Équipements</p>
            </div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <h3>{stats.incidents}</h3>
              <p>Incidents actifs</p>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{stats.eolAlerts}</h3>
              <p>Alertes EOL</p>
            </div>
          </div>
        </div>

        {/* Recent Access */}
        <div className="tables-grid">
          <div className="table-card">
            <h2>🔑 Derniers accès RFID</h2>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Salle</th>
                  <th>Accès</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAccess.map((log) => (
                  <tr key={log._id}>
                    <td>{log.user ? log.user.name : 'Inconnu'}</td>
                    <td>{log.room ? log.room.name : '-'}</td>
                    <td>
                      <span className={log.accessGranted ? 'badge green' : 'badge red'}>
                        {log.accessGranted ? '✅ Autorisé' : '❌ Refusé'}
                      </span>
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

