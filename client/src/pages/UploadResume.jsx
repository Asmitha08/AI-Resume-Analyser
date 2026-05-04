import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { user } = useContext(AuthContext);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to analyze resume.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Upload Section */}
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📤</span> Upload Resume
          </h2>
          {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
          
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Job Description (Optional)</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Paste the job description here for better results..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resume (PDF only)</label>
              <div style={{
                border: '2px dashed var(--glass-border)',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }} onClick={() => document.getElementById('file-upload').click()}>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {file ? '📄' : '📁'}
                </div>
                <div style={{ fontWeight: '500' }}>{file ? file.name : 'Click or Drag to Upload PDF'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Max size: 5MB</div>
              </div>
            </div>

            <button type="submit" className="btn" disabled={loading} style={{ height: '3rem' }}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>🧠</span>
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* PDF Preview Section */}
        {previewUrl && (
          <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👁️</span> Resume Preview
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>-</button>
                <button className="zoom-btn" onClick={() => setZoom(z => Math.min(2, z + 0.2))}>+</button>
              </div>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
              <iframe
                src={`${previewUrl}#toolbar=0&view=FitH&zoom=${zoom * 100}`}
                width="100%"
                height="100%"
                style={{ border: 'none', transform: `scale(${zoom})`, transformOrigin: 'top center', height: `${100/zoom}%`, width: `${100/zoom}%` }}
                title="Resume Preview"
              ></iframe>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div id="printable-report" className="glass-panel animate-fade-in" style={{ borderTop: '4px solid var(--accent-color)' }}>
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
                <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>ATS Match Score 📊</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Why {result.atsScore}%? Your resume matches the job profile based on key skills and experience.</p>
              </div>
            </div>
            <button className="btn" onClick={handleDownload} style={{ background: 'var(--accent-color)' }}>
              📥 Download Analysis (PDF)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {/* Left Column: Breakdown & Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1.25rem' }}>Match Breakdown 🎯</h3>
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Skills Match</span>
                    <span>{result.skillsScore}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.skillsScore}%`, background: 'var(--primary-color)' }}></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Experience Match</span>
                    <span>{result.experienceScore}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.experienceScore}%`, background: 'var(--accent-color)' }}></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Education Match</span>
                    <span>{result.educationScore}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${result.educationScore}%`, background: '#8b5cf6' }}></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✅</span> Found Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {result.extractedSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>

                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <>
                    <h3 style={{ margin: '1.5rem 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>⚠️</span> Missing Keywords
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {result.missingKeywords.map((skill, index) => (
                        <span key={index} className="skill-tag missing">{skill}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: AI Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>🚀 Strengths</h3>
                <ul className="feedback-list">
                  {result.strengths?.map((item, i) => (
                    <li key={i} className="feedback-item">
                      <span className="feedback-icon">✔</span>
                      <span>{item}</span>
                    </li>
                  )) || <li className="feedback-item"><span>{result.feedback}</span></li>}
                </ul>
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>🛠️ Improvements</h3>
                <ul className="feedback-list">
                  {result.improvements?.map((item, i) => (
                    <li key={i} className="feedback-item">
                      <span className="feedback-icon">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>💡 Suggestions</h3>
                <ul className="feedback-list">
                  {result.suggestions?.map((item, i) => (
                    <li key={i} className="feedback-item">
                      <span className="feedback-icon">👉</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
