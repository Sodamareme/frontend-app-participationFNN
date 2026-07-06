import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import PotOverview from '../components/PotOverview';
import AddContributionForm from '../components/AddContributionForm';
import ContributionRow from '../components/ContributionRow';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [summary, setSummary] = useState({ members: [], grand_total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>
            Tous les versements ({contributions.length})
          </h3>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Chargement...</div>
          ) : contributions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
              Aucun versement pour le moment. Soyez le premier à contribuer.
            </div>
          ) : (
            <div>
              {contributions.map((c) => (
                <ContributionRow key={c.id} contribution={c} isAdmin={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
