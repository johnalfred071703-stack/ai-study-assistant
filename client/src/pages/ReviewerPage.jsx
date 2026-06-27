import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateReviewer } from '../services/api';

const tabs = [
  { key: 'summary', icon: 'ti-notes', label: 'Summary' },
  { key: 'flashcards', icon: 'ti-cards', label: 'Flashcards' },
  { key: 'quiz', icon: 'ti-help-circle', label: 'Quiz' },
  { key: 'exam', icon: 'ti-writing', label: 'Practice exam' },
  { key: 'recall', icon: 'ti-refresh', label: 'Active recall' },
  { key: 'blanks', icon: 'ti-cursor-text', label: 'Fill in blanks' },
];

export default function ReviewerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const doc = location.state?.doc;
  const [activeTab, setActiveTab] = useState(location.pathname.split('/').pop() || 'summary');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});
  const [quizSet, setQuizSet] = useState(0);
  const [flashcardSet, setFlashcardSet] = useState(0);

  useEffect(() => {
    const tab = location.pathname.split('/').pop() || 'summary';
    setActiveTab(tab);
  }, [location.pathname]);

  useEffect(() => {
    if (!doc) return;
    const cacheKey = activeTab === 'quiz' ? `quiz_${quizSet}` : activeTab === 'flashcards' ? `flashcards_${flashcardSet}` : activeTab;
    if (cache[cacheKey]) { setData(cache[cacheKey]); return; }
    setLoading(true);
    setError(null);
    setData(null);
    generateReviewer(doc.text, activeTab, doc._id)
      .then(res => {
        setData(res.data);
        setCache(c => ({ ...c, [cacheKey]: res.data }));
      })
      .catch(() => setError('Failed to generate. Try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, doc, quizSet, flashcardSet]);

  const handleTabClick = (key) => {
    setActiveTab(key);
    navigate(`/reviewer/${key}`, { state: { doc } });
  };

  const handleNextQuizSet = () => {
    setQuizSet(s => s + 1);
    setData(null);
  };

  const handleNextFlashcardSet = () => {
    setFlashcardSet(s => s + 1);
    setData(null);
  };

  if (!doc) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 10 }}>
      <i className="ti ti-file-upload" style={{ fontSize: 28, color: 'var(--text-muted)' }} aria-hidden="true" />
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No document loaded</div>
      <button onClick={() => navigate('/')} style={{
        marginTop: 8, padding: '6px 16px', borderRadius: 'var(--radius-sm)',
        background: 'var(--accent-dim)', color: 'var(--accent)',
        border: '0.5px solid var(--accent-border)', fontSize: 12, cursor: 'pointer',
      }}>Go to home</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        padding: '0 24px', height: 52, borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <i className="ti ti-file-type-pdf" style={{ fontSize: 16, color: '#D85A30', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{doc.pages} pages</span>
        </div>
        <button onClick={() => navigate('/')} style={{
          padding: '5px 14px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          border: '0.5px solid var(--accent-border)', fontSize: 12, cursor: 'pointer',
        }}>
          <i className="ti ti-upload" style={{ fontSize: 13, marginRight: 5 }} aria-hidden="true" />
          Upload new
        </button>
      </div>

      <div style={{
        display: 'flex', gap: 4, padding: '12px 24px 0',
        borderBottom: '0.5px solid var(--border)', flexShrink: 0,
        overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => handleTabClick(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', fontSize: 12, cursor: 'pointer',
            background: 'transparent', border: 'none', flexShrink: 0,
            borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'color 0.12s', marginBottom: -1,
          }}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
            <i className="ti ti-loader" style={{ fontSize: 18 }} aria-hidden="true" />
            Generating {activeTab} from your document...
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: '#F09595', padding: '8px 12px', background: 'rgba(226,75,74,0.08)', borderRadius: 'var(--radius-sm)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
            {error}
          </div>
        )}
        {!loading && !error && data && (
          <>
            {activeTab === 'summary' && <SummaryView data={data} />}
            {activeTab === 'flashcards' && <FlashcardsView data={data} onNextSet={handleNextFlashcardSet} setIndex={flashcardSet} />}
            {activeTab === 'quiz' && <QuizView data={data} onNextSet={handleNextQuizSet} currentSet={quizSet} />}
            {activeTab === 'exam' && <PlaceholderView label="Practice exam" />}
            {activeTab === 'recall' && <RecallView data={data} />}
            {activeTab === 'blanks' && <BlanksView data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryView({ data }) {
  return (
    <div style={{ maxWidth: 680 }}>
      {data.sections?.map((s, i) => (
        <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>{s.heading}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.body}</div>
        </div>
      ))}
    </div>
  );
}

function FlashcardsView({ data, onNextSet, setIndex }) {
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex2] = useState(0);
  const [status, setStatus] = useState({});
  const cards = data.cards || [];
  const card = cards[index];
  const allGot = cards.every((_, i) => status[i] === 'got');

  const handleStatus = (s) => {
    const updated = { ...status, [index]: s };
    setStatus(updated);
    if (index < cards.length - 1) {
      setIndex2(i => i + 1);
      setFlipped(false);
    }
  };

  if (allGot) return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 28, color: '#5DCAA5', marginBottom: 12 }}>
        <i className="ti ti-circle-check" aria-hidden="true" />
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>You got all {cards.length} cards!</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Ready for the next set</div>
      <button onClick={onNextSet} style={{
        padding: '8px 24px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer',
        background: 'var(--accent-dim)', color: 'var(--accent)', border: '0.5px solid var(--accent-border)',
      }}>Next set <i className="ti ti-arrow-right" /></button>
    </div>
  );

  if (!card) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No flashcards generated.</div>;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Set {setIndex + 1} · {index + 1} / {cards.length}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {Object.values(status).filter(s => s === 'got').length} got it · {Object.values(status).filter(s => s === 'learning').length} still learning
        </div>
      </div>

      <div onClick={() => setFlipped(f => !f)} style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '48px 32px',
        textAlign: 'center', cursor: 'pointer', minHeight: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {flipped ? 'Answer' : 'Question'}
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
          {flipped ? card.a : card.q}
        </div>
      </div>

      {flipped && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button onClick={() => handleStatus('learning')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
            background: 'rgba(226,75,74,0.08)', color: '#F09595', border: '0.5px solid rgba(226,75,74,0.3)',
            minHeight: 44,
          }}>
            <i className="ti ti-refresh" style={{ fontSize: 13, marginRight: 5 }} /> Still learning
          </button>
          <button onClick={() => handleStatus('got')} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
            background: 'rgba(29,158,117,0.1)', color: '#5DCAA5', border: '0.5px solid rgba(29,158,117,0.3)',
            minHeight: 44,
          }}>
            <i className="ti ti-check" style={{ fontSize: 13, marginRight: 5 }} /> Got it
          </button>
        </div>
      )}

      {!flipped && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click card to reveal answer</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
        <button onClick={() => { setIndex2(i => Math.max(0, i - 1)); setFlipped(false); }} style={{
          padding: '6px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
          background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', minHeight: 44,
        }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> Prev
        </button>
        <button onClick={() => { setIndex2(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} style={{
          padding: '6px 16px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
          background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', minHeight: 44,
        }}>
          Next <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
        </button>
      </div>
    </div>
  );
}

function QuizView({ data, onNextSet, currentSet }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [wrongItems, setWrongItems] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewUnderstood, setReviewUnderstood] = useState({});
  const [proceedReady, setProceedReady] = useState(false);

  const questions = data.questions || [];

  const handleSubmit = () => {
    const wrong = questions
      .map((q, i) => ({ ...q, userAnswer: selected[i], index: i }))
      .filter(q => q.userAnswer !== q.answer);
    setWrongItems(wrong);
    setSubmitted(true);
    if (wrong.length >= 3) {
      setReviewMode(true);
    } else {
      setProceedReady(true);
    }
  };

  const handleUnderstood = (i) => {
    const updated = { ...reviewUnderstood, [i]: true };
    setReviewUnderstood(updated);
    if (Object.keys(updated).length === wrongItems.length) {
      setReviewMode(false);
      setProceedReady(true);
    }
  };

  const score = questions.filter((q, i) => selected[i] === q.answer).length;

  if (reviewMode) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ fontSize: 13, color: '#F09595', marginBottom: 20, padding: '8px 12px', background: 'rgba(226,75,74,0.08)', borderRadius: 'var(--radius-sm)', border: '0.5px solid rgba(226,75,74,0.2)' }}>
          {wrongItems.length} incorrect — review these before moving on
        </div>
        {wrongItems.map((q, wi) => (
          <div key={wi} style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-card)', border: `0.5px solid ${reviewUnderstood[wi] ? 'rgba(29,158,117,0.4)' : 'rgba(226,75,74,0.3)'}`, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 1.6 }}>{q.question}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {q.choices.map((c, ci) => (
                <div key={ci} style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                  border: `0.5px solid ${ci === q.answer ? 'rgba(29,158,117,0.5)' : ci === q.userAnswer ? 'rgba(226,75,74,0.4)' : 'var(--border)'}`,
                  color: ci === q.answer ? '#5DCAA5' : ci === q.userAnswer ? '#F09595' : 'var(--text-secondary)',
                  background: 'var(--bg-card)',
                }}>
                  {ci === q.answer && <i className="ti ti-check" style={{ marginRight: 6 }} />}
                  {ci === q.userAnswer && ci !== q.answer && <i className="ti ti-x" style={{ marginRight: 6 }} />}
                  {c}
                </div>
              ))}
            </div>
            {!reviewUnderstood[wi] ? (
              <button onClick={() => handleUnderstood(wi)} style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
                background: 'var(--accent-dim)', color: 'var(--accent)', border: '0.5px solid var(--accent-border)',
                minHeight: 44,
              }}>I understand now</button>
            ) : (
              <div style={{ fontSize: 11, color: '#5DCAA5' }}><i className="ti ti-check" /> Understood</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (submitted && proceedReady) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ padding: '32px 20px', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 500, color: score >= 7 ? '#5DCAA5' : 'var(--accent)', marginBottom: 8 }}>
            {score} / {questions.length}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {score >= 7 ? 'Great job! Ready for the next set.' : 'Good effort! All reviewed — moving on.'}
          </div>
          <button onClick={onNextSet} style={{
            padding: '8px 24px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer',
            background: 'var(--accent-dim)', color: 'var(--accent)', border: '0.5px solid var(--accent-border)',
            minHeight: 44,
          }}>
            Next set <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
        Set {currentSet + 1} · {questions.length} questions
      </div>
      {questions.map((q, qi) => {
        const sel = selected[qi];
        return (
          <div key={qi} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 12 }}>
              {qi + 1}. {q.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.choices.map((c, i) => (
                <div key={i} onClick={() => setSelected(s => ({ ...s, [qi]: i }))} style={{
                  padding: '11px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer',
                  border: `0.5px solid ${sel === i ? 'var(--accent-border)' : 'var(--border)'}`,
                  color: sel === i ? 'var(--accent)' : 'var(--text-secondary)',
                  background: 'var(--bg-card)', transition: 'all 0.12s', minHeight: 44,
                }}>{c}</div>
              ))}
            </div>
            <div style={{ borderBottom: '0.5px solid var(--border)', marginTop: 20 }} />
          </div>
        );
      })}
      {Object.keys(selected).length === questions.length && (
        <button onClick={handleSubmit} style={{
          marginTop: 8, padding: '8px 24px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer',
          background: 'var(--accent-dim)', color: 'var(--accent)', border: '0.5px solid var(--accent-border)',
          minHeight: 44,
        }}>
          Submit answers
        </button>
      )}
    </div>
  );
}

function RecallView({ data }) {
  const questions = data.questions || [];
  return (
    <div style={{ maxWidth: 600 }}>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{i + 1}. {q.question}</div>
        </div>
      ))}
    </div>
  );
}

function BlanksView({ data }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const items = data.items || [];
  return (
    <div style={{ maxWidth: 600 }}>
      {items.map((item, i) => {
        const rev = revealed[i];
        const parts = item.sentence.split('_____');
        return (
          <div key={i} style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 2 }}>
              {parts[0]}
              <input
                value={answers[i] || ''}
                onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                disabled={rev}
                style={{
                  display: 'inline-block', width: 160, margin: '0 6px',
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${rev ? (answers[i]?.toLowerCase() === item.answer.toLowerCase() ? '#5DCAA5' : '#F09595') : 'var(--accent)'}`,
                  color: rev ? (answers[i]?.toLowerCase() === item.answer.toLowerCase() ? '#5DCAA5' : '#F09595') : 'var(--accent)',
                  fontSize: 13, outline: 'none', padding: '2px 4px',
                }}
              />
              {parts[1]}
            </div>
            {rev && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Answer: <span style={{ color: '#5DCAA5' }}>{item.answer}</span>
              </div>
            )}
            {!rev && (
              <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))} style={{
                marginTop: 10, padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                border: '0.5px solid var(--accent-border)', fontSize: 11, cursor: 'pointer',
                minHeight: 44,
              }}>Check</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlaceholderView({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10 }}>
      <i className="ti ti-tools" style={{ fontSize: 28, color: 'var(--text-muted)' }} aria-hidden="true" />
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label} — coming soon</div>
    </div>
  );
}