import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import PotOverview from '../components/PotOverview';
import AddContributionForm from '../components/AddContributionForm';
import ContributionRow from '../components/ContributionRow';
import { exportContributionsToExcel, slugifyFilename } from '../utils/exportExcel';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [summary, setSummary] = useState({ members: [], grand_total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // État recherche/filtre
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [contribRes, summaryRes] = await Promise.all([
        api.get('/contributions'),
        api.get('/contributions/summary'),
      ]);
      setContributions(contribRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdded = () => {
    loadData();
  };

  // Filtre client-side : par nom/email de participant, et/ou par date exacte du versement
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      const matchesName =
        !searchName.trim() ||
        c.full_name.toLowerCase().includes(searchName.trim().toLowerCase()) ||
        c.email.toLowerCase().includes(searchName.trim().toLowerCase());

      const matchesDate =
        !searchDate || new Date(c.created_at).toISOString().slice(0, 10) === searchDate;

      return matchesName && matchesDate;
    });
  }, [contributions, searchName, searchDate]);

  const handleExport = () => {
    const base = slugifyFilename(user?.full_name || 'mes-versements');
    const suffix = searchName || searchDate ? 'recherche' : 'tous';
    exportContributionsToExcel(filteredContributions, `versements-${base}-${suffix}.xlsx`);
  };

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24 }}>
          Bonjour {user?.full_name?.split(' ')[0]} 👋
        </h1>

        {error && <div className="error-banner">{error}</div>}

        {!loading && <PotOverview members={summary.members} grandTotal={summary.grand_total} />}

        <AddContributionForm onAdded={handleAdded} />

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
              Tous les versements (
              {filteredContributions.length}
              {filteredContributions.length !== contributions.length ? ` / ${contributions.length}` : ''}
              )
            </h3>
            {filteredContributions.length > 0 && (
              <button className="btn btn-ghost" onClick={handleExport}>
                📊 Exporter en Excel
              </button>
            )}
          </div>

          {!loading && contributions.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
              <div style={{ flex: '2 1 220px' }}>
                <label htmlFor="searchName">Rechercher un participant</label>
                <input
                  id="searchName"
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label htmlFor="searchDate">Filtrer par date</label>
                <input
                  id="searchDate"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
              {(searchName || searchDate) && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSearchName('');
                      setSearchDate('');
                    }}
                    style={{ height: 44 }}
                  >
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Chargement...</div>
          ) : filteredContributions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
              {contributions.length === 0
                ? 'Aucun versement pour le moment. Soyez le premier à contribuer.'
                : 'Aucun versement ne correspond à cette recherche.'}
            </div>
          ) : (
            <div>
              {filteredContributions.map((c) => (
                <ContributionRow key={c.id} contribution={c} isAdmin={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}