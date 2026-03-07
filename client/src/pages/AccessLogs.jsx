import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';
import './AccessLogs.css';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        API.get('/access'),
        API.get('/access/stats')
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'authorized') return log.accessGranted === true;
    if (filter === 'refused') return log.accessGranted === false;
    return true;
  });

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
          <div>
            <h1>🔑 Accès RFID</h1>
            <p>Historique des accès — Rafraîchissement automatique toutes les 10s</p>
          </div>
        </div>

        {/* Stats */}
        <div className="access-stats">
          <div className="access-stat-card">
            <h3>{stats.totalAccess || 0}</h3>
            <p>Total accès</p>
          </div>
          <div className="access-stat-card green">
            <h3>{stats.authorizedAccess || 0}</h3>
            <p>✅ Autorisés</p>
          </div>
          <div className="access-stat-card red">
            <h3>{stats.refusedAccess || 0}</h3>
            <p>❌ Refusés</p>
          </div>
          <div className="access-stat-card blue">
            <h3>{stats.totalAccess > 0 ? Math.round((stats.authorizedAccess / stats.totalAccess) * 100) : 0}%</h3>
            <p>Taux d'autorisation</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('all')}
          >
            Tous ({logs.length})
          </button>
          <button
            className={filter === 'authorized' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('authorized')}
          >
            ✅ Autorisés ({logs.filter(l => l.accessGranted).length})
          </button>
          <button
            className={filter === 'refused' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('refused')}
          >
            ❌ Refusés ({logs.filter(l => !l.accessGranted).length})
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Salle</th>
                <th>Carte RFID</th>
                <th>Accès</th>
                <th>Raison du refus</th>
                <th>Date & Heure</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id} className={!log.accessGranted ? 'row-refused' : ''}>
                  <td>
                    {log.user ? (
                      <div>
                        <strong>{log.user.name}</strong>
                        <div className="text-muted">{log.user.role}</div>
                      </div>
                    ) : (
                      <span className="badge badge-red">👤 Inconnu</span>
                    )}
                  </td>
                  <td>🚪 {log.room?.name || '-'}</td>
                  <td><code className="rfid-code">{log.rfidCard}</code></td>
                  <td>
                    <span className={log.accessGranted ? 'badge badge-green' : 'badge badge-red'}>
                      {log.accessGranted ? '✅ Autorisé' : '❌ Refusé'}
                    </span>
                  </td>
                  <td>
                    {log.reason ? (
                      <span className="text-muted">{log.reason}</span>
                    ) : '-'}
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;