import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import './Users.css';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [form, setForm] = useState({
    name: '', location: '', responsable: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sitesRes, usersRes] = await Promise.all([
        API.get('/sites'),
        API.get('/users')
      ]);
      setSites(sitesRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'responsable_site'));
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSite) {
        await API.put(`/sites/${editSite._id}`, form);
        toast.success('✅ Site modifié !');
      } else {
        await API.post('/sites', form);
        toast.success('✅ Site créé !');
      }
      setShowModal(false);
      setEditSite(null);
      setForm({ name: '', location: '', responsable: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (site) => {
    setEditSite(site);
    setForm({
      name: site.name,
      location: site.location,
      responsable: site.responsable?._id || ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (site) => {
    try {
      await API.put(`/sites/${site._id}`, { isActive: !site.isActive });
      toast.success(site.isActive ? '❌ Site désactivé' : '✅ Site activé');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
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
          <div>
            <h1>🏢 Sites</h1>
            <p>Gestion des sites de l'entreprise</p>
          </div>
          <button className="btn-primary" onClick={() => {
            setEditSite(null);
            setForm({ name: '', location: '', responsable: '' });
            setShowModal(true);
          }}>
            + Ajouter site
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nom du site</th>
                <th>Localisation</th>
                <th>Responsable</th>
                <th>Statut</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site._id}>
                  <td><strong>{site.name}</strong></td>
                  <td>📍 {site.location}</td>
                  <td>{site.responsable ? site.responsable.name : <span className="text-muted">Non assigné</span>}</td>
                  <td>
                    <span className={site.isActive ? 'badge badge-green' : 'badge badge-red'}>
                      {site.isActive ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </td>
                  <td>{new Date(site.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(site)}>✏️ Modifier</button>
                    <button
                      className={site.isActive ? 'btn-danger' : 'btn-success'}
                      onClick={() => handleToggleActive(site)}
                    >
                      {site.isActive ? '🔒 Désactiver' : '🔓 Activer'}
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
                <h2>{editSite ? '✏️ Modifier site' : '➕ Ajouter site'}</h2>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom du site</label>
                  <input
                    type="text"
                    placeholder="ex: Site Tunis"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Localisation</label>
                  <input
                    type="text"
                    placeholder="ex: Tunis, Tunisie"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Responsable (optionnel)</label>
                  <select
                    value={form.responsable}
                    onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  >
                    <option value="">-- Aucun responsable --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editSite ? 'Modifier' : 'Créer'}
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

export default Sites;