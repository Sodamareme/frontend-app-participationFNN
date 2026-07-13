import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { formatFCFA } from '../components/PotOverview';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Responsable',
  membre: 'Membre',
};

export default function CaisseSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/caisses');
      setCaisses(res.data);
    } catch (err) {
      setError('Impossible de charger vos caisses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!name.trim()) {
      setCreateError('Le nom de la caisse est requis.');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/caisses', {
        name,
        description,
        admin_email: adminEmail || undefined,
      });
      setName('');
      setDescription('');
      setAdminEmail('');
      setShowCreate(false);
      load();
      navigate(`/caisses/${res.data.id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Erreur lors de la création de la caisse.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>
            Bonjour {user?.full_name?.split(' ')[0]} 👋
          </h1>
          {user?.role === 'super_admin' && (
            <button className="btn btn-primary" onClick={() => setShowCreate((s) => !s)}>
              {showCreate ? 'Annuler' : '+ Nouvelle caisse'}
            </button>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        {showCreate && (
          <form className="card" onSubmit={handleCreate} style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>Créer une nouvelle caisse</h3>
            {createError && <div className="error-banner">{createError}</div>}
            <div className="field">
              <label htmlFor="name">Nom de la caisse</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Caisse du bureau" required />
            </div>
            <div className="field">
              <label htmlFor="description">Description (optionnel)</label>
              <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex : Cotisation mensuelle de l'équipe" />
            </div>
            <div className="field">
              <label htmlFor="adminEmail">Email du responsable (optionnel)</label>
              <input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="La personne doit déjà avoir un compte"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? 'Création...' : 'Créer la caisse'}
            </button>
          </form>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Chargement...</div>
        ) : caisses.length === 0 ? (
          <div className="card" style={{ color: 'var(--text-muted)' }}>
            {user?.role === 'super_admin'
              ? "Aucune caisse pour l'instant. Crée la première avec le bouton ci-dessus."
              : "Tu n'es membre d'aucune caisse pour l'instant. Demande à un responsable de t'y ajouter avec ton email."}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {caisses.map((c) => (
              <div
                key={c.id}
                className="card"
                onClick={() => navigate(`/caisses/${c.id}`)}
                style={{ cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>{c.name}</h3>
                  <span
                    style={{
                      fontSize: 11.5,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'var(--surface-raised)',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ROLE_LABELS[c.role] || c.role}
                  </span>
                </div>
                {c.description && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>{c.description}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Cagnotte</div>
                    <div className="amount-mono" style={{ color: 'var(--gold)', fontSize: 16 }}>
                      {formatFCFA(c.grand_total)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Membres</div>
                    <div style={{ fontSize: 16 }}>{c.member_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
