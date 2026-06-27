import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import DocumentsPage from './pages/DocumentsPage';
import ReviewerPage from './pages/ReviewerPage';
import './index.css';

export default function App() {
  return (
    <Router>
      <style>{`
        @media (max-width: 768px) {
          .main-content { padding-top: 52px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
        <Sidebar />
        <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/reviewer" element={<ReviewerPage />} />
            <Route path="/reviewer/summary" element={<ReviewerPage />} />
            <Route path="/reviewer/flashcards" element={<ReviewerPage />} />
            <Route path="/reviewer/quiz" element={<ReviewerPage />} />
            <Route path="/reviewer/exam" element={<ReviewerPage />} />
            <Route path="/reviewer/recall" element={<ReviewerPage />} />
            <Route path="/reviewer/blanks" element={<ReviewerPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}