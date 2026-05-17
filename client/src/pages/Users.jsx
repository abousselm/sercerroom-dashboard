import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'technicien', rfidCard: '', site: ''
  });

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.isSuperAdmin;
  const isResponsableSite = currentUser?.role === 'responsable_site';
  const canManageUsers = isAdmin || isResponsableSite;

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const [usersRes, sitesRes] = await Promise.all([
        API.get('/users'),
        API.get('/sites')
      ]);
      setUsers(usersRes.data);
      setSites(sitesRes.data);
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...form };
      // Convertir la chaîne vide en null pour le site
      if (submitData.site === '') {
        submitData.site = null;
      }

      if (editUser) {
        await API.put(`/users/${editUser._id}`, submitData);
        toast.success('✅ Utilisateur modifié !');
      } else {
        await API.post('/users', submitData);
        toast.success('✅ Utilisateur créé !');
      }
      setShowModal(false);
      setEditUser(null);
      setForm({ name: '', email: '', password: '', role: 'technicien', rfidCard: '', site: '' });
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
      rfidCard: user.rfidCard || '',
      site: user.site?._id || ''
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

  const handleDelete = async (user) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.name}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      await API.delete(`/users/${user._id}`);
      toast.success('🗑️ Utilisateur supprimé définitivement');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
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

  // Organiser les utilisateurs par rôle avec tri par nom
  const responsables = users
    .filter(u => u.role === 'responsable_site')
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const techniciens = users
    .filter(u => u.role === 'technicien')
    .sort((a, b) => a.name.localeCompare(b.name));

  const renderUserTable = (userList, title, badgeColor) => (
    <div className="table-card" style={{ marginBottom: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#374151' }}>
          {title}
        </h2>
        <span className={`badge ${badgeColor}`} style={{ fontSize: '0.95rem', padding: '6px 14px' }}>
          Total: {userList.length}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Site</th>
            <th>Carte RFID</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                Aucun utilisateur dans cette catégorie
              </td>
            </tr>
          ) : (
            userList.map((user) => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td>{user.site ? user.site.name : <span className="text-muted">Non assigné</span>}</td>
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
                  {currentUser?.isSuperAdmin && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user)}
                      disabled={user._id === currentUser._id}
                      title={user._id === currentUser._id ? "Vous ne pouvez pas vous supprimer vous-même" : "Supprimer définitivement"}
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="loading">Chargement...</div>
      </div>
    </div>
  );

  if (!canManageUsers) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <div className="page-header">
            <h1>Accès refusé</h1>
            <p>Vous n'avez pas la permission de voir cette page.</p>
          </div>
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
            <h1>👤 Utilisateurs</h1>
            <p>Gestion des utilisateurs et des accès</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEditUser(null);
            setForm({ name: '', email: '', password: '', role: 'technicien', rfidCard: '', site: '' });
            setShowModal(true);
          }}>
            + Ajouter utilisateur
          </button>
        </div>

        {currentUser?.isSuperAdmin ? (
          <>
            {renderUserTable(responsables, '🏢 Responsables de Site', 'badge-blue')}
            {renderUserTable(techniciens, '🔧 Techniciens', 'badge-green')}
          </>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Site</th>
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
                    <td>{user.site ? user.site.name : <span className="text-muted">Non assigné</span>}</td>
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
                      {currentUser?.isSuperAdmin && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user)}
                          disabled={user._id === currentUser._id}
                          title={user._id === currentUser._id ? "Vous ne pouvez pas vous supprimer vous-même" : "Supprimer définitivement"}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                  {isResponsableSite ? (
                    <input type="text" value="Technicien" disabled className="disabled-input" />
                  ) : (
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="admin">👑 Admin</option>
                      <option value="responsable_site">🏢 Responsable Site</option>
                      <option value="technicien">🔧 Technicien</option>
                    </select>
                  )}
                </div>
                {isAdmin && form.role === 'responsable_site' && (
                  <div className="form-group">
                    <label>Site assigné</label>
                    <select
                      value={form.site}
                      onChange={(e) => setForm({ ...form, site: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un site</option>
                      {sites.map((site) => (
                        <option key={site._id} value={site._id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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