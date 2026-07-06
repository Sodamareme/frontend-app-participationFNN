import { useState } from 'react';
import api from '../api/axios';

export default function AddContributionForm({ onAdded }) {
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) {
      setError('Merci de saisir un montant valide.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', numeric);
      if (file) formData.append('screenshot', file);

      const res = await api.post('/contributions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAmount('');
      setFile(null);
      e.target.reset();
      onAdded?.(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du versement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 17 }}>Ajouter un versement</h3>
      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: '1 1 180px', marginBottom: 0 }}>
          <label htmlFor="amount">Montant (FCFA)</label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="Ex : 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="field" style={{ flex: '2 1 240px', marginBottom: 0 }}>
          <label htmlFor="screenshot">Capture (optionnel)</label>
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ height: 44 }}>
          {submitting ? 'Envoi...' : 'Valider le versement'}
        </button>
      </div>
    </form>
  );
}
