import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPDF } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e6ff', marginBottom: 20 }}>Upload PDF</div>

      <div {...getRootProps()} style={{
        border: `0.5px dashed ${isDragActive ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 'var(--radius-md)', padding: '60px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        background: isDragActive ? 'rgba(139,132,250,0.06)' : 'rgba(255,255,255,0.02)',
        cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        opacity: uploading ? 0.6 : 1,
      }}>
        <input {...getInputProps()} />
        <i className={`ti ${uploading ? 'ti-loader' : 'ti-file-upload'}`} style={{ fontSize: 36, color: 'rgba(139,132,250,0.6)' }} aria-hidden="true" />
        <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
          {uploading ? 'Uploading and parsing PDF...' : isDragActive ? 'Drop it here' : 'Drop a PDF to get started'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF only — up to 20 MB</div>
        {!uploading && (
          <button style={{
            marginTop: 8, padding: '8px 20px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '0.5px solid var(--accent-border)', fontSize: 13, cursor: 'pointer',
          }}>Browse file</button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#F09595', padding: '8px 12px', background: 'rgba(226,75,74,0.08)', borderRadius: 'var(--radius-sm)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
          {error}
        </div>
      )}
    </div>
  );
}