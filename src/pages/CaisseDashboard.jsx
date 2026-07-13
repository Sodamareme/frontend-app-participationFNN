import { useEffect, useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import PotOverview, { formatFCFA } from '../components/PotOverview';
import AddContributionForm from '../components/AddContributionForm';
import ContributionRow from '../components/ContributionRow';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Responsable', membre: 'Membre' };

export default function CaisseDashboard() {
  const { caisseId } = useParams();
  const { user } = useAuth();

  const [caisse, setCaisse] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [summary, setSummary] = useState({ members: [], grand_total: 0 });
  const [tab, setTab] = useState('versements'); // 'versements' | 'participants'
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  // État gestion des participants
  const [members, setMembers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('membre');
  const [memberError, setMemberError] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = caisse?.role === 'admin' || caisse?.role === 'super_admin';

  const loadAll = useCallback(async () => {
    try {
      const [caisseRes, contribRes, summaryRes] = await Promise.all([
        api.get(`/caisses/${caisseId}`),
        api.get(`/caisses/${caisseId}/contributions`),
        api.get(`/caisses/${caisseId}/contributions/summary`),
      ]);
      setCaisse(caisseRes.data);
      setContributions(contribRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else setError('Impossible de charger cette caisse.');
    } finally {
      setLoading(false);
    }
  }, [caisseId]);

  const loadMembers = useCallback(async () => {
    try {
      const res = await api.get(`/caisses/${caisseId}/members`);
      setMembers(res.data);
    } catch (err) {
      // silencieux, l'onglet participants n'est visible que pour les admins de toute façon
    }
  }, [caisseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (tab === 'participants' && isAdmin) loadMembers();
  }, [tab, isAdmin, loadMembers]);

  const handleAddContribution = () => {
    loadAll();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    if (!newEmail.trim()) {
      setMemberError('Email requis.');
      return;
    }
    setAddingMember(true);
    try {
      await api.post(`/caisses/${caisseId}/members`, { email: newEmail, role: newRole });
      setNewEmail('');
      setNewRole('membre');
      loadMembers();
      loadAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Erreur lors de l'ajout du participant.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/caisses/${caisseId}/members/${userId}/role`, { role });
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du changement de rôle.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Retirer ce participant de la caisse ?')) return;
    try {
      await api.delete(`/caisses/${caisseId}/members/${userId}`);
      loadMembers();
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleDeleteContribution = async (id) => {
    if (!confirm('Supprimer ce versement ? Le total du membre sera ajusté.')) return;
    try {
      await api.delete(`/caisses/${caisseId}/contributions/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  if (notFound) return <Navigate to="/" replace />;

  return (
    <div>
      <Navbar caisseName={caisse?.name} backToCaisses />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Chargement...</div>
        ) : (
          <>
            {error && <div className="error-banner">{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>{caisse.name}</h1>
                {caisse.description && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{caisse.description}</div>
                )}
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setTab('versements')}
                    style={tab === 'versements' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                  >
                    Versements
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setTab('participants')}
                    style={tab === 'participants' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                  >
                    Participants
                  </button>
                </div>
              )}
            </div>

            {tab === 'versements' ? (
              <>
                <PotOverview members={summary.members} grandTotal={summary.grand_total} />
                <AddContributionForm caisseId={caisseId} onAdded={handleAddContribution} />

                <div className="card">
                  <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
                    Tous les versements ({contributions.length})
                  </h3>
                  {contributions.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
                      Aucun versement pour le moment. Soyez le premier à contribuer.
                    </div>
                  ) : (
                    <div>
                      {contributions.map((c) => (
                        <ContributionRow
                          key={c.id}
                          contribution={c}
                          isAdmin={isAdmin}
                          onDelete={handleDeleteContribution}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <form className="card" onSubmit={handleAddMember} style={{ marginBottom: 24 }}>
                  <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
                    Ajouter un participant
                  </h3>
                  {memberError && <div className="error-banner">{memberError}</div>}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '2 1 220px' }}>
                      <label htmlFor="newEmail">Email (doit déjà avoir un compte)</label>
                      <input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="exemple@email.com"
                      />
                    </div>
                    <div style={{ flex: '1 1 140px' }}>
                      <label htmlFor="newRole">Rôle</label>
                      <select id="newRole" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        <option value="membre">Membre</option>
                        <option value="admin">Responsable</option>
                      </select>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={addingMember} style={{ height: 44 }}>
                      {addingMember ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </div>
                </form>

                <div className="card">
                  <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
                    Participants ({members.length})
                  </h3>
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
                        {members.map((m) => (
                          <tr key={m.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={td}>{m.full_name}</td>
                            <td style={{ ...td, color: 'var(--text-muted)' }}>{m.email}</td>
                            <td style={td}>
                              <select
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                                style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                              >
                                <option value="membre">Membre</option>
                                <option value="admin">Responsable</option>
                              </select>
                            </td>
                            <td className="amount-mono" style={{ ...td, color: 'var(--gold)' }}>
                              {formatFCFA(m.total_amount)}
                            </td>
                            <td style={td}>
                              <button className="btn btn-danger" onClick={() => handleRemoveMember(m.user_id)}>
                                Retirer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const th = { padding: '8px 10px', fontWeight: 500, fontSize: 12.5 };
const td = { padding: '10px 10px' };
