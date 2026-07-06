import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(fullName, email, password);
    if (res.ok) navigate('/');
    else setError(res.message);
  };

  return (
    <div style={styles.wrap}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: 'var(--accent)', fontSize: 22 }}>◆</div>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '8px 0 4px' }}>Créer un compte</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Rejoignez la caisse FNN</div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullName">Nom complet</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: 'var(--text-muted)' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--accent)' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
};
