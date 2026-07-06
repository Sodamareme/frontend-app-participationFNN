import { useState } from 'react';
import { formatFCFA } from './PotOverview';

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days} j`;
}

// Affiche la date exacte, ex : "6 juil. 2026, 14:32"
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContributionRow({ contribution, isAdmin, onDelete }) {
  const [preview, setPreview] = useState(false);

  return (
    <div style={styles.row}>
      <div style={styles.avatar}>{initials(contribution.full_name)}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{contribution.full_name}</div>
        <div
          style={{ color: 'var(--text-muted)', fontSize: 12.5 }}
          title={timeAgo(contribution.created_at)}
        >
          {formatDate(contribution.created_at)}
        </div>
      </div>

      {contribution.screenshot_url && (
        <img
          src={contribution.screenshot_url}
          alt="Capture du versement"
          style={styles.thumb}
          onClick={() => setPreview(true)}
        />
      )}

      <div className="amount-mono" style={{ fontSize: 16, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
        + {formatFCFA(contribution.amount)}
      </div>

      {isAdmin && (
        <button className="btn btn-danger" onClick={() => onDelete(contribution.id)} title="Supprimer">
          Suppr.
        </button>
      )}

      {preview && (
        <div style={styles.lightbox} onClick={() => setPreview(false)}>
          <img src={contribution.screenshot_url} alt="Capture agrandie" style={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 0',
    borderBottom: '1px solid var(--border)',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  thumb: {
    width: 44,
    height: 44,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid var(--border)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: '#000000CC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    cursor: 'zoom-out',
  },
  lightboxImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: 10,
    boxShadow: '0 20px 60px #00000080',
  },
};