import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Login.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState('technicien');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur de connexion';

      // Si le compte est en attente d'approbation, rediriger vers la page d'attente
      if (
        errorMessage.includes('attente') ||
        errorMessage.includes('pending') ||
        err.response?.status === 403
      ) {
        localStorage.setItem('pendingEmail', email);
        localStorage.setItem('pendingPassword', password);
        navigate('/waiting-approval');
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword !== signupConfirm) {
      setSignupError('Les mots de passe ne correspondent pas');
      return;
    }

    setSignupLoading(true);
    try {
      const backendRole = signupRole === 'responsable-site' ? 'responsable_site' : signupRole;
      await API.post('/auth/register', {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        role: backendRole,
        password: signupPassword,
      });

      // Stocker les informations pour la page d'attente
      localStorage.setItem('pendingEmail', signupEmail);
      localStorage.setItem('pendingPassword', signupPassword);

      navigate('/waiting-approval');
    } catch (err) {
      setSignupError(err.response?.data?.message || "Erreur lors de l\'inscription");
    } finally {
      setSignupLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSignup((prev) => !prev);
    setError('');
    setSignupError('');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="company-header">
          <h1 className="company-name">LEONI</h1>
          <div className="company-underline"></div>
          <p className="company-subtitle">Supervision Intelligente des Serveurs</p>
        </div>

        <div className="form-toggle">
          <button
            className={`toggle-btn ${!isSignup ? 'active' : ''}`}
            onClick={toggleForm}
          >
            Connexion
          </button>
          <button
            className={`toggle-btn ${isSignup ? 'active' : ''}`}
            onClick={toggleForm}
          >
            Inscription
          </button>
        </div>

        <div className={`forms-container ${isSignup ? 'register-mode' : ''}`}>
          {/* Login Form */}
          <div className={`form-frame login-frame ${!isSignup ? 'active' : ''}`}>
            <div className="login-header">
              <p>Bienvenue ! Connectez-vous à votre compte</p>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>

          {/* Signup Form */}
          <div className={`form-frame signup-frame ${isSignup ? 'active' : ''}`}>
            <div className="login-header">
              <p>Créez un nouveau compte</p>
            </div>
            {signupError && <div className="login-error">{signupError}</div>}
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Numéro de téléphone</label>
                <input
                  type="tel"
                  placeholder="+212 XXX XXX XXX"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="technicien">Technicien</option>
                  <option value="responsable-site">Responsable de Site</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={signupLoading}>
                {signupLoading ? 'Inscription...' : "S\'inscrire"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

