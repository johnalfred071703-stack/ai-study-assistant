import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, getDocument, deleteDocument } from '../services/api';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDocuments()
      .then(res => setDocs(res.data))
      .catch(() => setError('Failed to load documents.'));
  }, []);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleOpen = async (f) => {
    try {
      const res = await getDocument(f._id);
      navigate('/reviewer/summary', { state: { doc: res.data } });
    } catch {
      setError('Failed to load document.');
    }
  };

  const handleDelete = async (e, f) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${f.filename}?`)) return;
    try {
      await deleteDocument(f._id);
      setDocs(d => d.filter(x => x._id !== f._id));
    } catch {
      setError('Failed to delete.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#e8e6ff' }}>My documents</span>
        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '0.5px solid var(--border-hover)' }}>
          {docs.length} document{docs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div style={{ marginBottom: 16, fontSize: 12, color: '#F09595', padding: '8px 12px', background: 'rgba(226,75,74,0.08)', borderRadius: 'var(--radius-sm)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
          {error}
        </div>
      )}

      {docs.length === 0 && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10 }}>
          <i className="ti ti-folder-open" style={{ fontSize: 28, color: 'var(--text-muted)' }} aria-hidden="true" />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documents yet</div>
          <button onClick={() => navigate('/upload')} style={{
            marginTop: 8, padding: '6px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '0.5px solid var(--accent-border)', fontSize: 12, cursor: 'pointer',
          }}>Upload a PDF</button>
        </div>
      )}

      {docs.map(f => (
        <div key={f._id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: 'var(--bg-card)',
          border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
          marginBottom: 8, transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <i className="ti ti-file-type-pdf" style={{ fontSize: 18, color: '#D85A30', flexShrink: 0 }} aria-hidden="true" />
          <div onClick={() => handleOpen(f)} style={{ flex: 1, cursor: 'pointer' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>{f.filename}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{f.pages} pages · {timeAgo(f.uploadedAt)}</div>
          </div>
          <button onClick={(e) => handleDelete(e, f)} style={{
            padding: '5px 8px', borderRadius: 'var(--radius-sm)', fontSize: 15, cursor: 'pointer',
            background: 'transparent', color: 'var(--text-muted)',
            border: '0.5px solid transparent', flexShrink: 0,
            transition: 'color 0.12s, border-color 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F09595'; e.currentTarget.style.borderColor = 'rgba(226,75,74,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <i className="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}