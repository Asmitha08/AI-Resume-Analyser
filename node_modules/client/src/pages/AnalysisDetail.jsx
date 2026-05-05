import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const AnalysisDetail = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/analysis/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setResult(data);
        } else {
          setError(data.error || 'Failed to load analysis');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Analysis...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'var(--danger-color)', marginTop: '2rem' }}>{error}</div>;

  const handleDownload = () => window.print();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {result && (
        <div id="printable-report" className="glass-panel" style={{ borderTop: '4px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: `conic-gradient(var(--accent-color) ${result.atsScore}%, rgba(255,255,255,0.1) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                position: 'relative'
              }}>
                <div style={{ width: '85px', height: '85px', background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.75rem', color: 'var(--accent-color)' }}>{result.atsScore}%</span>
                </div>
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{result.fileName} 📄</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Analyzed on {new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button className="btn" onClick={handleDownload} style={{ background: 'var(--accent-color)' }}>
              📥 Download PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1.25rem' }}>Score Breakdown</h3>
                {[
                  { label: 'Skills', score: result.skillsScore, color: 'var(--primary-color)' },
                  { label: 'Experience', score: result.experienceScore, color: 'var(--accent-color)' },
                  { label: 'Education', score: result.educationScore, color: '#8b5cf6' }
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span>{item.label} Match</span>
                      <span>{item.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.score}%`, background: item.color, borderRadius: '999px' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ marginBottom: '1.25rem' }}>Skills Identified</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {result.extractedSkills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
                {result.missingKeywords?.length > 0 && (
                  <>
                    <h3 style={{ margin: '1.5rem 0 1.25rem 0' }}>Missing from Resume</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {result.missingKeywords.map((s, i) => <span key={i} className="skill-tag missing">{s}</span>)}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>🚀 Strengths</h3>
                <ul className="feedback-list">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="feedback-item">
                      <span className="feedback-icon">✔</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>🛠️ Improvements</h3>
                <ul className="feedback-list">
                  {result.improvements?.map((s, i) => (
                    <li key={i} className="feedback-item">
                      <span className="feedback-icon">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Overall Feedback</h3>
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{result.feedback}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetail;
