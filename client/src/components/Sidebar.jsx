import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const nav = [
  { to: '/', icon: 'ti-home', label: 'Home' },
  { to: '/upload', icon: 'ti-upload', label: 'Upload PDF' },
  { to: '/documents', icon: 'ti-folder', label: 'My documents' },
];

const modes = [
  { key: 'summary', icon: 'ti-notes', label: 'Summary' },
  { key: 'flashcards', icon: 'ti-cards', label: 'Flashcards' },
  { key: 'quiz', icon: 'ti-help-circle', label: 'Quiz' },
  { key: 'exam', icon: 'ti-writing', label: 'Practice exam' },
  { key: 'recall', icon: 'ti-refresh', label: 'Active recall' },
  { key: 'blanks', icon: 'ti-cursor-text', label: 'Fill in blanks' },
];

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink to={to} end onClick={onClick} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '10px 12px', margin: '1px 6px',
    borderRadius: 'var(--radius-sm)', fontSize: 13, textDecoration: 'none',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-dim)' : 'transparent',
    transition: 'background 0.12s, color 0.12s',
    minHeight: 44,
  })}>
    <i className={`ti ${icon}`} style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
    {label}
  </NavLink>
);

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const activeTab = location.pathname.split('/').pop();
  const isReviewer = location.pathname.startsWith('/reviewer');

  const close = () => setOpen(false);

  const sidebarContent = (
    <>
      <div style={{ padding: '18px 16px 14px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e6ff' }}>StudyAI</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>AI document reviewer</div>
        </div>
        <button onClick={close} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, padding: 4 }} className="sidebar-close">
          <i className="ti ti-x" aria-label="Close menu" />
        </button>
      </div>

      <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '14px 16px 6px', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Workspace</div>
        {nav.map(n => <NavItem key={n.to} {...n} onClick={close} />)}

        <div style={{ padding: '16px 16px 6px', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Review modes</div>
        {modes.map(m => (
          <div key={m.key} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 12px', margin: '1px 6px', minHeight: 44,
            borderRadius: 'var(--radius-sm)', fontSize: 13,
            color: isReviewer && activeTab === m.key ? 'var(--accent)' : 'var(--text-secondary)',
            background: isReviewer && activeTab === m.key ? 'var(--accent-dim)' : 'transparent',
            cursor: isReviewer ? 'pointer' : 'not-allowed',
            opacity: isReviewer ? 1 : 0.4,
            transition: 'background 0.12s, color 0.12s',
          }}
            onClick={() => {
              if (!isReviewer) return;
              window.dispatchEvent(new CustomEvent('switchTab', { detail: m.key }));
              close();
            }}
          >
            <i className={`ti ${m.icon}`} style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
            {m.label}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 6px', borderTop: '0.5px solid var(--border)' }}>
        <NavItem to="/account" icon="ti-user" label="Account" onClick={close} />
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-mobile-header { display: none; }
        .sidebar-overlay { display: none; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-header { display: flex !important; }
          .sidebar-overlay { display: ${open ? 'block' : 'none'} !important; }
          .sidebar-drawer { transform: ${open ? 'translateX(0)' : 'translateX(-100%)'}; }
          .sidebar-close { display: flex !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{
        width: 210, background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border)',
        flexDirection: 'column', flexShrink: 0, height: '100vh',
      }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <div className="sidebar-overlay" onClick={close} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
      }} />

      {/* Mobile drawer */}
      <div className="sidebar-drawer" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: 'var(--bg-surface)', borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transition: 'transform 0.25s ease', transform: 'translateX(-100%)',
      }}>
        {sidebarContent}
      </div>

      {/* Mobile top header */}
      <div className="sidebar-mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52,
        background: 'var(--bg-surface)', borderBottom: '0.5px solid var(--border)',
        display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 30,
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e6ff' }}>StudyAI</div>
        <button onClick={() => setOpen(true)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: 22, padding: 8, minWidth: 44, minHeight: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-label="Open menu">
          <i className="ti ti-menu-2" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}