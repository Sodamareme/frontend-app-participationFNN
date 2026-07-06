const COLORS = ['#2FD3A6', '#F2B84B', '#6FA8DC', '#E27D9B', '#B48EE0', '#7FD1C9', '#E39A5C'];

function formatFCFA(value) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(value) || 0));
}

export default function PotOverview({ members, grandTotal }) {
  const sorted = [...members].sort((a, b) => b.total_amount - a.total_amount);
  const total = Number(grandTotal) || 0;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Somme totale reçue</div>
          <div className="amount-mono" style={{ fontSize: 40, color: 'var(--gold)', lineHeight: 1 }}>
            {formatFCFA(total)} <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>FCFA</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 13 }}>
          {members.length} membre{members.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Barre de répartition — encode la part réelle de chaque membre dans le total */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: 'var(--surface-raised)' }}>
          {sorted.map((m, i) => {
            const pct = total > 0 ? (m.total_amount / total) * 100 : 0;
            return pct > 0 ? (
              <div
                key={m.id}
                title={`${m.full_name} — ${formatFCFA(m.total_amount)} FCFA`}
                style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], transition: 'width 0.4s ease' }}
              />
            ) : null;
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: 14 }}>
          {sorted.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
              <span style={{ color: 'var(--text)' }}>{m.full_name}</span>
              <span className="amount-mono" style={{ color: 'var(--text-muted)' }}>
                {formatFCFA(m.total_amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { formatFCFA };
