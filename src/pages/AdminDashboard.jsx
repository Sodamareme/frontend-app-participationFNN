import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ContributionRow from '../components/ContributionRow';
import { formatFCFA } from '../components/PotOverview';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes, contribRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/contributions'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setContributions(contribRes.data);
    } catch (err) {
      setError('Impossible de charger les données administrateur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteContribution = async (id) => {
    if (!confirm('Supprimer ce versement ? Le total du membre sera ajusté.')) return;
    try {
      await api.delete(`/admin/contributions/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur et tous ses versements ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>Administration</h1>

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard label="Somme totale reçue" value={`${formatFCFA(stats.grand_total)} FCFA`} highlight />
          <StatCard label="Membres" value={stats.total_users} />
          <StatCard label="Versements" value={stats.total_contributions} />
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>Membres ({users.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Email</th>
                  <th style={th}>Rôle</th>
                  <th style={th}>Total versé</th>
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
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id}
                        style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                      >
                        <option value="user">Membre</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="amount-mono" style={{ ...td, color: 'var(--gold)' }}>
                      {formatFCFA(u.total_amount)}
                    </td>
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

        <div className="card">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
            Tous les versements ({contributions.length})
          </h3>
          {contributions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Aucun versement pour le moment.</div>
          ) : (
            <div>
              {contributions.map((c) => (
                <ContributionRow key={c.id} contribution={c} isAdmin onDelete={handleDeleteContribution} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="card">
      <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 6 }}>{label}</div>
      <div className="amount-mono" style={{ fontSize: 22, color: highlight ? 'var(--gold)' : 'var(--text)' }}>
        {value}
      </div>
    </div>
  );
}

const th = { padding: '8px 10px', fontWeight: 500, fontSize: 12.5 };
const td = { padding: '10px 10px' };
