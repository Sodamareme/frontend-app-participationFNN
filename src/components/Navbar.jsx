import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>◆</span>
          <span style={styles.brandText}>Caisse FNN</span>
        </div>
        <nav style={styles.nav}>
          <NavLink to="/" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })} end>
            Tableau de bord
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
              Administration
            </NavLink>
          )}
        </nav>
        <div style={styles.userZone}>
          <span style={styles.userName}>{user?.full_name}</span>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: 13 }}>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    backdropFilter: 'blur(10px)',
    background: '#0E1B23CC',
    zIndex: 10,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandMark: { color: 'var(--accent)', fontSize: 18 },
  brandText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' },
  nav: { display: 'flex', gap: 24 },
  link: { textDecoration: 'none', color: 'var(--text-muted)', fontSize: 14.5, fontWeight: 500 },
  linkActive: { color: 'var(--text)' },
  userZone: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { fontSize: 14, color: 'var(--text-muted)' },
};
