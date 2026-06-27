import { useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPDF, getDocuments, getDocument, deleteDocument } from '../services/api';

const modes = [
  { icon: 'ti-notes', name: 'Summary', desc: 'Organized study notes by heading' },
  { icon: 'ti-cards', name: 'Flashcards', desc: 'Q&A pairs from the doc' },
  { icon: 'ti-help-circle', name: 'Quiz', desc: 'MCQ, T/F, matching type' },
  { icon: 'ti-writing', name: 'Practice exam', desc: 'Mixed difficulty questions' },
  { icon: 'ti-refresh', name: 'Active recall', desc: 'Questions, no answers shown' },
  { icon: 'ti-cursor-text', name: 'Fill in blanks', desc: 'Key terms removed' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getDocuments()
      .then(res => setRecent(res.data))
      .catch(() => {});
  }, []);

  const onDrop = useCallback(async (files) => {
    if (!files[0]) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadPDF(files[0]);
      navigate('/reviewer/summary', { state: { doc: res.data } });
    } catch (err) {
      setError('Failed to upload. Make sure the server is running.');
    } finally {
      setUploading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': [] }, maxFiles: 1,
  });

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleOpenDoc = async (f) => {
    try {
      const res = await getDocument(f._id);
      navigate('/reviewer/summary', { state: { doc: res.data } });
    } catch (err) {
      setError('Failed to load document.');
    }
  };

  const handleDelete = async (e, f) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${f.filename}?`)) return;
    try {
      await deleteDocument(f._id);
      setRecent(r => r.filter(d => d._id !== f._id));
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#e8e6ff' }}>Home</span>
        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '0.5px solid var(--border-hover)' }}>
          {recent.length} document{recent.length !== 1 ? 's' : ''} saved
        </span>
      </div>

      <div {...getRootProps()} style={{
        border: `0.5px dashed ${isDragActive ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 'var(--radius-md)', padding: '36px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: isDragActive ? 'rgba(139,132,250,0.06)' : 'rgba(255,255,255,0.02)',
        cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        opacity: uploading ? 0.6 : 1,
      }}>
        <input {...getInputProps()} />
        <i className={`ti ${uploading ? 'ti-loader' : 'ti-file-upload'}`} style={{ fontSize: 28, color: 'rgba(139,132,250,0.6)' }} aria-hidden="true" />
        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
          {uploading ? 'Uploading and parsing PDF...' : isDragActive ? 'Drop it here' : 'Drop a PDF to get started'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF only — up to 20 MB</div>
        {!uploading && (
          <button style={{
            marginTop: 8, padding: '6px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '0.5px solid var(--accent-border)', fontSize: 12, cursor: 'pointer',
          }}>Browse file</button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#F09595', padding: '8px 12px', background: 'rgba(226,75,74,0.08)', borderRadius: 'var(--radius-sm)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '22px 0 10px', letterSpacing: '0.04em' }}>Review modes</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {modes.map(m => (
          <div key={m.name} style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '13px 14px', cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <i className={`ti ${m.icon}`} style={{ fontSize: 18, color: 'rgba(139,132,250,0.7)', display: 'block', marginBottom: 8 }} aria-hidden="true" />
            <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '22px 0 10px', letterSpacing: '0.04em' }}>Recent documents</div>
          {recent.map(f => (
            <div key={f._id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'var(--bg-card)',
              border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              marginBottom: 7, transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <i className="ti ti-file-type-pdf" style={{ fontSize: 16, color: '#D85A30', flexShrink: 0 }} aria-hidden="true" />
              <div onClick={() => handleOpenDoc(f)} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{f.filename}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.pages} pages · {timeAgo(f.uploadedAt)}</div>
              </div>
              <button onClick={(e) => handleDelete(e, f)} style={{
                padding: '5px 8px', borderRadius: 'var(--radius-sm)', fontSize: 14, cursor: 'pointer',
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
        </>
      )}
    </div>
  );
}