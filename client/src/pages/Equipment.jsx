import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';
import './Equipment.css';

const Equipment = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'responsable_site';

  const [equipments, setEquipments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sites, setSites] = useState([]);
  const [nearEol, setNearEol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [form, setForm] = useState({
    name: '', type: 'serveur', room: '', site: '',
    serialNumber: '', installDate: '', endOfLife: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipRes, roomsRes, sitesRes, eolRes] = await Promise.all([
        API.get('/equipments'),
        API.get('/rooms'),
        API.get('/sites'),
        API.get('/equipments/near-eol')
      ]);
      setEquipments(equipRes.data);
      setRooms(roomsRes.data);
      setSites(sitesRes.data);
      setNearEol(eolRes.data);
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEquipment) {
        await API.put(`/equipments/${editEquipment._id}`, form);
        toast.success('✅ Équipement modifié !');
      } else {
        await API.post('/equipments', form);
        toast.success('✅ Équipement créé !');
      }
      setShowModal(false);
      setEditEquipment(null);
      setForm({ name: '', type: 'serveur', room: '', site: '', serialNumber: '', installDate: '', endOfLife: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (eq) => {
    setEditEquipment(eq);
    setForm({
      name: eq.name,
      type: eq.type,
      room: eq.room?._id || '',
      site: eq.site?._id || '',
      serialNumber: eq.serialNumber || '',
      installDate: eq.installDate ? eq.installDate.split('T')[0] : '',
      endOfLife: eq.endOfLife ? eq.endOfLife.split('T')[0] : '',
      notes: eq.notes || ''
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      actif: 'badge-green',
      en_panne: 'badge-red',
      maintenance: 'badge-yellow',
      hors_service: 'badge-red'
    };
    const labels = {
      actif: '✅ Actif',
      en_panne: '❌ En panne',
      maintenance: '🔧 Maintenance',
      hors_service: '⛔ Hors service'
    };
    return <span className={`badge ${colors[status]}`}>{labels[status]}</span>;
  };

  const getEolStatus = (endOfLife) => {
    if (!endOfLife) return null;
    const days = Math.ceil((new Date(endOfLife) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="badge badge-red">⛔ Expiré</span>;
    if (days <= 30) return <span className="badge badge-red">🔴 {days}j restants</span>;
    if (days <= 90) return <span className="badge badge-yellow">🟡 {days}j restants</span>;
    return <span className="badge badge-green">🟢 {days}j restants</span>;
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
          <div>
            <h1>🖥️ Équipements</h1>
            <p>Gestion des équipements des salles serveurs</p>
          </div>
          {canManage && (
            <button className="btn-primary" onClick={() => {
              setEditEquipment(null);
              setForm({ name: '', type: 'serveur', room: '', site: '', serialNumber: '', installDate: '', endOfLife: '', notes: '' });
              setShowModal(true);
            }}>
              + Ajouter équipement
            </button>
          )}
        </div>

        {/* Alertes EOL */}
        {nearEol.length > 0 && (
          <div className="eol-alert-banner">
            <h3>⚠️ {nearEol.length} équipement(s) proche(s) de fin de vie !</h3>
            <div className="eol-list">
              {nearEol.map(eq => (
                <span key={eq._id} className="eol-item">
                  🖥️ {eq.name} — expire le {new Date(eq.endOfLife).toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Salle</th>
                <th>Site</th>
                <th>N° Série</th>
                <th>Fin de vie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((eq) => (
                <tr key={eq._id}>
                  <td><strong>{eq.name}</strong></td>
                  <td><span className="badge badge-blue">⚙️ {eq.type}</span></td>
                  <td>{eq.room?.name || '-'}</td>
                  <td>{eq.site?.name || '-'}</td>
                  <td><code>{eq.serialNumber || '-'}</code></td>
                  <td>{getEolStatus(eq.endOfLife)}</td>
                  <td>{getStatusBadge(eq.status)}</td>
                  <td>
                    {canManage && (
                      <button className="btn-edit" onClick={() => handleEdit(eq)}>
                        ✏️ Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <div className="modal-header">
                <h2>{editEquipment ? '✏️ Modifier équipement' : '➕ Ajouter équipement'}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      placeholder="ex: Switch Cisco 2960"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="serveur">Serveur</option>
                      <option value="switch">Switch</option>
                      <option value="routeur">Routeur</option>
                      <option value="ups">UPS</option>
                      <option value="climatiseur">Climatiseur</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Site</label>
                    <select
                      value={form.site}
                      onChange={(e) => setForm({ ...form, site: e.target.value })}
                      required
                    >
                      <option value="">-- Choisir un site --</option>
                      {sites.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Salle</label>
                    <select
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                      required
                    >
                      <option value="">-- Choisir une salle --</option>
                      {rooms.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Numéro de série</label>
                    <input
                      type="text"
                      placeholder="ex: SN-123456"
                      value={form.serialNumber}
                      onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date d'installation</label>
                    <input
                      type="date"
                      value={form.installDate}
                      onChange={(e) => setForm({ ...form, installDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date fin de vie (EOL)</label>
                    <input
                      type="date"
                      value={form.endOfLife}
                      onChange={(e) => setForm({ ...form, endOfLife: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      placeholder="Notes optionnelles"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editEquipment ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment;