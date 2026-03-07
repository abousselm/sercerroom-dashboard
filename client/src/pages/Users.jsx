import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'technicien', rfidCard: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await API.put(`/users/${editUser._id}`, form);
        toast.success('✅ Utilisateur modifié !');
      } else {
        await API.post('/users', form);
        toast.success('✅ Utilisateur créé !');
      }
      setShowModal(false);
      setEditUser(null);
      setForm({ name: '', email: '', password: '', role: 'technicien', rfidCard: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      rfidCard: user.rfidCard || ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? '❌ Utilisateur désactivé' : '✅ Utilisateur activé');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'badge-red',
      responsable_site: 'badge-blue',
      technicien: 'badge-green'
    };
    const labels = {
      admin: '👑 Admin',
      responsable_site: '🏢 Responsable',
      technicien: '🔧 Technicien'
    };
    return <span className={`badge ${colors[role]}`}>{labels[role]}</span>;
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
            <h1>👤 Utilisateurs</h1>
            <p>Gestion des utilisateurs et des accès</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEditUser(null);
            setForm({ name: '', email: '', password: '', role: 'technicien', rfidCard: '' });
            setShowModal(true);
          }}>
            + Ajouter utilisateur
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Carte RFID</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.rfidCard || <span className="text-muted">Non assignée</span>}</td>
                  <td>
                    <span className={user.isActive ? 'badge badge-green' : 'badge badge-red'}>
                      {user.isActive ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(user)}>✏️ Modifier</button>
                    <button
                      className={user.isActive ? 'btn-danger' : 'btn-success'}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? '🔒 Désactiver' : '🔓 Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editUser ? '✏️ Modifier utilisateur' : '➕ Ajouter utilisateur'}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe {editUser && '(laisser vide pour ne pas changer)'}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editUser}
                  />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="admin">👑 Admin</option>
                    <option value="responsable_site">🏢 Responsable Site</option>
                    <option value="technicien">🔧 Technicien</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Carte RFID</label>
                  <input
                    type="text"
                    placeholder="ex: A3F2B1"
                    value={form.rfidCard}
                    onChange={(e) => setForm({ ...form, rfidCard: e.target.value })}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editUser ? 'Modifier' : 'Créer'}
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

export default Users;