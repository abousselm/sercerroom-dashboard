import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';
import './Incidents.css';
import socket from '../socket';

const Incidents = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'responsable_site';

  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');

  useEffect(() => {
  fetchData();

  socket.on('newIncident', (incident) => {
    console.log('🚨 Nouvel incident :', incident);
    toast.error(`🚨 Nouvel incident : ${incident.description}`);
    fetchData();
  });

  return () => {
    socket.off('newIncident');
  };
}, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, statsRes] = await Promise.all([
        API.get('/incidents'),
        API.get('/incidents/stats')
      ]);
      setIncidents(incidentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erreur chargement incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await API.put(`/incidents/${id}/resolve`);
      toast.success('✅ Incident résolu !');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critique: 'badge-red',
      moyen: 'badge-yellow',
      faible: 'badge-green'
    };
    const labels = {
      critique: '🔴 Critique',
      moyen: '🟡 Moyen',
      faible: '🟢 Faible'
    };
    return <span className={`badge ${colors[severity]}`}>{labels[severity]}</span>;
  };

  const getTypeBadge = (type) => {
    const labels = {
      temperature: '🌡️ Température',
      fumee: '🔥 Fumée',
      acces_refuse: '🔑 Accès refusé',
      coupure_electrique: '⚡ Coupure électrique',
      autre: '⚠️ Autre'
    };
    return labels[type] || type;
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'unresolved') return !inc.resolved;
    if (filter === 'resolved') return inc.resolved;
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
            <h1>🚨 Incidents</h1>
            <p>Détection et gestion des incidents critiques</p>
          </div>
        </div>

        {/* Stats */}
        <div className="access-stats">
          <div className="access-stat-card">
            <h3>{stats.total || 0}</h3>
            <p>Total incidents</p>
          </div>
          <div className="access-stat-card red">
            <h3>{stats.unresolved || 0}</h3>
            <p>🚨 Non résolus</p>
          </div>
          <div className="access-stat-card green">
            <h3>{stats.resolved || 0}</h3>
            <p>✅ Résolus</p>
          </div>
          <div className="access-stat-card red">
            <h3>{stats.critique || 0}</h3>
            <p>🔴 Critiques actifs</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="filter-tabs">
          <button
            className={filter === 'unresolved' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('unresolved')}
          >
            🚨 Non résolus ({incidents.filter(i => !i.resolved).length})
          </button>
          <button
            className={filter === 'resolved' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('resolved')}
          >
            ✅ Résolus ({incidents.filter(i => i.resolved).length})
          </button>
          <button
            className={filter === 'all' ? 'filter-tab active' : 'filter-tab'}
            onClick={() => setFilter('all')}
          >
            Tous ({incidents.length})
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Salle</th>
                <th>Sévérité</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((inc) => (
                <tr key={inc._id} className={inc.severity === 'critique' && !inc.resolved ? 'row-critical' : ''}>
                  <td>{getTypeBadge(inc.type)}</td>
                  <td>🚪 {inc.room?.name || '-'}</td>
                  <td>{getSeverityBadge(inc.severity)}</td>
                  <td className="description-cell">{inc.description}</td>
                  <td>
                    <span className={inc.resolved ? 'badge badge-green' : 'badge badge-red'}>
                      {inc.resolved ? '✅ Résolu' : '🚨 Actif'}
                    </span>
                  </td>
                  <td>{new Date(inc.createdAt).toLocaleString()}</td>
                  <td>
                    {!inc.resolved && canManage && (
                      <button className="btn-success" onClick={() => handleResolve(inc._id)}>
                        ✅ Résoudre
                      </button>
                    )}
                    {inc.resolved && inc.resolvedAt && (
                      <span className="text-muted">
                        {new Date(inc.resolvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Incidents;