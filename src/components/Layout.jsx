import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', ico: '📊', end: true },
  { to: '/categories', label: 'Catalog', ico: '🗂️' },
  { to: '/orders', label: 'Orders', ico: '🧾' },
  { to: '/queries', label: 'Besqaa Queries', ico: '💬' },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/besqaalogo.png" alt="Besqaa" />
          <span>Besqaa</span>
        </div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="ico">{n.ico}</span>
            {n.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <div style={{ padding: '10px 14px', fontSize: 13 }}>
            <div style={{ fontWeight: 700 }}>{admin?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{admin?.email}</div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
            ⏻ Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
