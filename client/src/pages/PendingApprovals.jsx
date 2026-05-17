import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import './PendingApprovals.css';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/pending-approvals');
      setPendingUsers(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessing(userId);
    try {
      await API.post(`/auth/approve/${userId}`);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    setProcessing(userId);
    try {
      await API.post(`/auth/reject/${userId}`, { reason: 'Refusé par le Super Admin' });
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      setError('');

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du refus');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>📋 Approbation des Comptes</h1>
          <p>Gérez les demandes d'inscription en attente</p>
        </div>

        {error && <div className="approval-error">{error}</div>}

        <div className="approvals-container">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="no-data">
              <p>✅ Aucun compte en attente d'approbation</p>
            </div>
          ) : (
            <div className="approvals-table">
              <div className="table-header">
                <div className="col-name">Nom</div>
                <div className="col-email">Email</div>
                <div className="col-phone">Téléphone</div>
                <div className="col-role">Rôle</div>
                <div className="col-date">Date d'inscription</div>
                <div className="col-actions">Actions</div>
              </div>

              {pendingUsers.map((u) => (
                <div key={u._id} className="table-row approval-row">
                  <div className="col-name">{u.name}</div>
                  <div className="col-email">{u.email}</div>
                  <div className="col-phone">{u.phone || '-'}</div>
                  <div className="col-role">
                    <span className={`role-badge role-${u.role}`}>
                      {u.role === 'admin' ? 'Administrateur' : u.role === 'responsable_site' ? 'Responsable Site' : 'Technicien'}
                    </span>
                  </div>
                  <div className="col-date">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(u._id)}
                      disabled={processing === u._id}
                    >
                      {processing === u._id ? '⏳' : '✓ Approuver'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(u._id)}
                      disabled={processing === u._id}
                    >
                      {processing === u._id ? '⏳' : '✕ Refuser'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
