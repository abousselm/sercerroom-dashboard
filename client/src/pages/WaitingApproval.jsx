import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './WaitingApproval.css';

const WaitingApproval = () => {
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté et approuvé, rediriger vers le dashboard
    if (user && user.role) {
      navigate('/dashboard');
      return;
    }

    // Vérifier périodiquement le statut de l'utilisateur
    const checkStatus = async () => {
      setChecking(true);
      try {
        // Essayer de se connecter avec les informations stockées
        const storedEmail = localStorage.getItem('pendingEmail');
        const storedPassword = localStorage.getItem('pendingPassword');

        if (storedEmail && storedPassword) {
          const response = await API.post('/auth/login', {
            email: storedEmail,
            password: storedPassword
          });

          if (response.data.token) {
            // Connexion réussie - compte approuvé
            login(response.data.token, response.data.user);
            localStorage.removeItem('pendingEmail');
            localStorage.removeItem('pendingPassword');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        if (error.response?.status === 403) {
          setStatus('pending');
          setMessage('Votre compte est toujours en attente d\'approbation par l\'administrateur.');
        } else {
          setStatus('error');
          setMessage('Erreur lors de la vérification du statut.');
        }
      } finally {
        setChecking(false);
      }
    };

    // Vérifier immédiatement, puis toutes les 10 secondes
    checkStatus();
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [user, login, navigate]);

  const handleRetryLogin = async () => {
    const storedEmail = localStorage.getItem('pendingEmail');
    const storedPassword = localStorage.getItem('pendingPassword');

    if (!storedEmail || !storedPassword) {
      setMessage('Informations de connexion manquantes. Veuillez vous réinscrire.');
      return;
    }

    setChecking(true);
    try {
      const response = await API.post('/auth/login', {
        email: storedEmail,
        password: storedPassword
      });

      if (response.data.token) {
        login(response.data.token, response.data.user);
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPassword');
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setStatus('pending');
        setMessage('Votre compte est toujours en attente d\'approbation.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Erreur de connexion.');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleGoToLogin = () => {
    localStorage.removeItem('pendingEmail');
    localStorage.removeItem('pendingPassword');
    navigate('/login');
  };

  return (
    <div className="waiting-container">
      <div className="waiting-card">
        <div className="waiting-header">
          <div className="leoni-logo">
            <span className="logo-text">L</span>
            <span className="logo-text">E</span>
            <span className="logo-text">O</span>
            <span className="logo-text">N</span>
            <span className="logo-text">I</span>
          </div>
          <h1>Supervision de Salle Serveur</h1>
        </div>

        <div className="waiting-content">
          <div className="status-icon">
            {status === 'pending' ? '⏳' : status === 'error' ? '❌' : '✅'}
          </div>

          <h2>Compte en Attente d'Approbation</h2>

          <div className="waiting-message">
            <p>✅ Votre inscription a été enregistrée avec succès!</p>
            <p>Votre compte doit maintenant être approuvé par l'administrateur système.</p>
            <p>Cette vérification peut prendre quelques minutes.</p>
          </div>

          {message && (
            <div className={`status-message ${status}`}>
              <p>{message}</p>
            </div>
          )}

          <div className="waiting-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <span>Un email de confirmation vous sera envoyé une fois approuvé</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔄</span>
              <span>La page se met à jour automatiquement toutes les 10 secondes</span>
            </div>
            <div className="info-item">
              <span className="info-icon">👤</span>
              <span>Seul le Super Administrateur peut approuver les nouveaux comptes</span>
            </div>
          </div>

          <div className="waiting-actions">
            <button
              className="btn-retry"
              onClick={handleRetryLogin}
              disabled={checking}
            >
              {checking ? '🔄 Vérification...' : '🔄 Vérifier Maintenant'}
            </button>

            <button
              className="btn-login"
              onClick={handleGoToLogin}
            >
              🔙 Retour à la Connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingApproval;
