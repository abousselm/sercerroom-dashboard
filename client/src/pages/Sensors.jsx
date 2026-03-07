import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import socket from '../socket';
import './Sensors.css';

const Sensors = () => {
  const [sensorsData, setSensorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchSensorsData();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('sensorUpdate', (data) => {
      console.log('📡 Données temps réel :', data);
      setSensorsData(prev => prev.map(item => {
        if (item.roomId.toString() === data.roomId.toString()) {
          return { ...item, data: data.data };
        }
        return item;
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('sensorUpdate');
    };
  }, []);

  const fetchSensorsData = async () => {
    try {
      const res = await API.get('/sensors/latest');
      setSensorsData(res.data);
    } catch (error) {
      console.error('Erreur capteurs :', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureColor = (temp) => {
    if (!temp) return '#666';
    if (temp > 45) return '#ef4444';
    if (temp > 35) return '#f59e0b';
    return '#10b981';
  };

  const getHumidityColor = (hum) => {
    if (!hum) return '#666';
    if (hum > 80) return '#ef4444';
    if (hum > 60) return '#f59e0b';
    return '#10b981';
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
          <h1>🌡️ Supervision Capteurs</h1>
          <p>
            Données en temps réel —
            <span style={{ color: connected ? '#10b981' : '#ef4444', marginLeft: '8px' }}>
              {connected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </span>
          </p>
        </div>

        <div className="sensors-grid">
          {sensorsData.map((item) => (
            <div key={item.roomId} className="sensor-card">
              <div className="sensor-room-header">
                <h2>🚪 {item.room}</h2>
                {item.data ? (
                  <span className="sensor-time">
                    {new Date(item.data.createdAt).toLocaleString()}
                  </span>
                ) : (
                  <span className="badge-offline">Aucune donnée</span>
                )}
              </div>

              {item.data ? (
                <div className="sensor-metrics">
                  <div className="metric-card">
                    <div className="metric-icon">🌡️</div>
                    <div className="metric-info">
                      <span className="metric-value" style={{ color: getTemperatureColor(item.data.temperature) }}>
                        {item.data.temperature}°C
                      </span>
                      <span className="metric-label">Température</span>
                      <span className="metric-status">
                        {item.data.temperature > 45 ? '🔴 Critique' :
                         item.data.temperature > 35 ? '🟡 Attention' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">💧</div>
                    <div className="metric-info">
                      <span className="metric-value" style={{ color: getHumidityColor(item.data.humidity) }}>
                        {item.data.humidity}%
                      </span>
                      <span className="metric-label">Humidité</span>
                      <span className="metric-status">
                        {item.data.humidity > 80 ? '🔴 Critique' :
                         item.data.humidity > 60 ? '🟡 Attention' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>

                  <div className={`metric-card ${item.data.smoke ? 'alert' : ''}`}>
                    <div className="metric-icon">🔥</div>
                    <div className="metric-info">
                      <span className="metric-value" style={{ color: item.data.smoke ? '#ef4444' : '#10b981' }}>
                        {item.data.smoke ? 'Détectée' : 'Normal'}
                      </span>
                      <span className="metric-label">Fumée</span>
                      <span className="metric-status">
                        {item.data.smoke ? '🔴 Alerte !' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">🚪</div>
                    <div className="metric-info">
                      <span className="metric-value" style={{ color: item.data.doorOpen ? '#f59e0b' : '#10b981' }}>
                        {item.data.doorOpen ? 'Ouverte' : 'Fermée'}
                      </span>
                      <span className="metric-label">Porte</span>
                      <span className="metric-status">
                        {item.data.doorOpen ? '🟡 Ouverte' : '🟢 Fermée'}
                      </span>
                    </div>
                  </div>

                  <div className={`metric-card ${item.data.powerCut ? 'alert' : ''}`}>
                    <div className="metric-icon">⚡</div>
                    <div className="metric-info">
                      <span className="metric-value" style={{ color: item.data.powerCut ? '#ef4444' : '#10b981' }}>
                        {item.data.powerCut ? 'Coupure !' : 'Normal'}
                      </span>
                      <span className="metric-label">Électricité</span>
                      <span className="metric-status">
                        {item.data.powerCut ? '🔴 Coupure !' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-data">
                  <p>Aucune donnée capteur disponible</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sensors;