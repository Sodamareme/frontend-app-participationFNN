import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { formatFCFA } from '../components/PotOverview';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [caisses, setCaisses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statsRes, caissesRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/caisses'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setCaisses(caissesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Impossible de charger les données super admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteCaisse = async (id) => {
    if (!confirm('Supprimer cette caisse ? Tous ses versements et participants seront perdus.')) return;
    try {
      await api.delete(`/caisses/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du rôle.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ? Il sera retiré de toutes ses caisses.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="container" style={{ paddingTop: 32 }}>Chargement...</main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>
          Super Administration
        </h1>

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
          <StatCard label="Cagnotte globale" value={`${formatFCFA(stats.grand_total)} FCFA`} highlight />
          <StatCard label="Caisses" value={stats.total_caisses} />
          <StatCard label="Utilisateurs" value={stats.total_users} />
          <StatCard label="Versements" value={stats.total_contributions} />
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>Caisses ({caisses.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Membres</th>
                  <th style={th}>Cagnotte</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {caisses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={td}>
                      <span
                        onClick={() => navigate(`/caisses/${c.id}`)}
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                      >
                        {c.name}
                      </span>
                    </td>
                    <td style={td}>{c.member_count}</td>
                    <td className="amount-mono" style={{ ...td, color: 'var(--gold)' }}>{formatFCFA(c.grand_total)}</td>
                    <td style={td}>
                      <button className="btn btn-danger" onClick={() => handleDeleteCaisse(c.id)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>Utilisateurs ({users.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Email</th>
                  <th style={th}>Rôle global</th>
                  <th style={th}>Caisses</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={td}>{u.full_name}</td>
                    <td style={{ ...td, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={td}>
                      <select
                        value={u.role}
                        disabled={u.id === user.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td style={td}>{u.caisses_count}</td>
                    <td style={td}>
                      {u.id !== user.id && (
                        <button className="btn btn-danger" onClick={() => handleDeleteUser(u.id)}>
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="card">
      <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 6 }}>{label}</div>
      <div className="amount-mono" style={{ fontSize: 20, color: highlight ? 'var(--gold)' : 'var(--text)' }}>
        {value}
      </div>
    </div>
  );
}

const th = { padding: '8px 10px', fontWeight: 500, fontSize: 12.5 };
const td = { padding: '10px 10px' };
