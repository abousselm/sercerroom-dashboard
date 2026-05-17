import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';

const Rooms = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isSuperAdmin;
  const isResponsableSite = user?.role === 'responsable_site';
  const canManageRoom = isAdmin || isResponsableSite;

  const [rooms, setRooms] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    name: '', site: '', esp32Id: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, sitesRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/sites')
      ]);
      setRooms(roomsRes.data);
      setSites(sitesRes.data);

      if (canManageRoom) {
        try {
          const usersRes = await API.get('/users');
          setUsers(usersRes.data);
        } catch (err) {
          toast.error('Erreur chargement utilisateurs');
        }
      }
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoom) {
        await API.put(`/rooms/${editRoom._id}`, form);
        toast.success('✅ Salle modifiée !');
      } else {
        await API.post('/rooms', form);
        toast.success('✅ Salle créée !');
      }
      setShowModal(false);
      setEditRoom(null);
      setForm({ name: '', site: '', esp32Id: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (room) => {
    setEditRoom(room);
    setForm({
      name: room.name,
      site: room.site?._id || '',
      esp32Id: room.esp32Id || ''
    });
    setShowModal(true);
  };

  const handleAddUser = async (userId) => {
    try {
      await API.post(`/rooms/${selectedRoom._id}/add-user`, { userId });
      toast.success('✅ Utilisateur autorisé !');
      fetchData();
      const res = await API.get('/rooms');
      const updated = res.data.find(r => r._id === selectedRoom._id);
      setSelectedRoom(updated);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await API.post(`/rooms/${selectedRoom._id}/remove-user`, { userId });
      toast.success('✅ Utilisateur retiré !');
      fetchData();
      const res = await API.get('/rooms');
      const updated = res.data.find(r => r._id === selectedRoom._id);
      setSelectedRoom(updated);
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const isAuthorized = (userId) => {
    return selectedRoom?.authorizedUsers?.some(u => u._id === userId);
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>🚪 Salles Serveurs</h1>
            <p>Gestion des salles et des accès</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => {
              setEditRoom(null);
              setForm({ name: '', site: '', esp32Id: '' });
              setShowModal(true);
            }}>
              + Ajouter salle
            </button>
          )}
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Site</th>
                <th>ESP32 ID</th>
                <th>Utilisateurs autorisés</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td><strong>{room.name}</strong></td>
                  <td>🏢 {room.site?.name || '-'}</td>
                  <td><code>{room.esp32Id || '-'}</code></td>
                  <td>
                    <span className="badge badge-blue">
                      👤 {room.authorizedUsers?.length || 0} utilisateurs
                    </span>
                  </td>
                  <td>
                    <span className={room.isActive ? 'badge badge-green' : 'badge badge-red'}>
                      {room.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td>
                    {isAdmin && (
                      <button className="btn-edit" onClick={() => handleEdit(room)}>
                        ✏️ Modifier
                      </button>
                    )}
                    {canManageRoom && (
                      <button className="btn-success" onClick={() => {
                        setSelectedRoom(room);
                        setShowUsersModal(true);
                      }}>
                        👤 Accès
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Créer/Modifier */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editRoom ? '✏️ Modifier salle' : '➕ Ajouter salle'}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom de la salle</label>
                  <input
                    type="text"
                    placeholder="ex: Salle Serveur A"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
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
                  <label>ESP32 ID</label>
                  <input
                    type="text"
                    placeholder="ex: ESP32-SALLE-A"
                    value={form.esp32Id}
                    onChange={(e) => setForm({ ...form, esp32Id: e.target.value })}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editRoom ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Gestion Accès */}
        {showUsersModal && selectedRoom && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>👤 Accès - {selectedRoom.name}</h2>
                <button onClick={() => setShowUsersModal(false)}>✕</button>
              </div>
              <div className="users-access-list">
                {users.map((u) => (
                  <div key={u._id} className="user-access-item">
                    <div>
                      <strong>{u.name}</strong>
                      <span className="text-muted"> — {u.role}</span>
                      {u.rfidCard && <span className="badge badge-blue"> 🔑 {u.rfidCard}</span>}
                    </div>
                    {isAuthorized(u._id) ? (
                      <button className="btn-danger" onClick={() => handleRemoveUser(u._id)}>
                        ❌ Retirer
                      </button>
                    ) : (
                      <button className="btn-success" onClick={() => handleAddUser(u._id)}>
                        ✅ Autoriser
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={() => setShowUsersModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rooms;

