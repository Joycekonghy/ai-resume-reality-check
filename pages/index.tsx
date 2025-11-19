import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [roastMode, setRoastMode] = useState('savage');
  const [industry, setIndustry] = useState('tech');
  const [personaMode, setPersonaMode] = useState('realistic');
  const [showPremium, setShowPremium] = useState(false);
  const [rebuiltResume, setRebuiltResume] = useState<any>(null);
  const [rebuildLoading, setRebuildLoading] = useState(false);

  const handlePremiumClick = () => {
    setShowPremium(true);
  };

  const handleRebuildResume = async () => {
    if (!file) return;
    
    setRebuildLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('industry', industry);
    formData.append('action', 'rebuild');
    
    try {
      const response = await fetch('/api/rebuild', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setRebuiltResume(result);
      setShowPremium(false);
    } catch (error) {
      console.error('Rebuild error:', error);
    }
    setRebuildLoading(false);
  };

  const handleDownload = (version: string, content: string) => {
    // Clean up markdown formatting
    const cleanContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold markers
      .replace(/\*(.*?)\*/g, '$1')     // Remove * italic markers
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/`([^`]+)`/g, '$1')     // Remove code backticks
      .replace(/^\s*[-*+]\s/gm, '• ')  // Convert markdown bullets to bullets
      .trim();

    const pdf = new jsPDF();
    
    // Set font and title
    pdf.setFontSize(16);
    pdf.text(`${version} Resume`, 20, 20);
    
    // Add content with proper line breaks
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(cleanContent, 170);
    pdf.text(lines, 20, 35);
    
    // Save the PDF
    pdf.save(`resume-${version.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    console.log('Starting upload...');
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('mode', roastMode);
    formData.append('industry', industry);
    formData.append('personaMode', personaMode);
    
    try {
      console.log('Sending request...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Result:', result);
      setAnalysis(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing resume: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header>
        <h1>🔥 AI Resume Reality Check Arena</h1>
        <p>Roast. Reveal. Rebuild your resume — through the eyes of different hiring personas.</p>
      </header>

      <div className="upload-section">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        
        <div className="roast-modes">
          <button 
            className={roastMode === 'savage' ? 'active' : ''}
            onClick={() => setRoastMode('savage')}
          >
            💀 Savage Brutal
          </button>
          <button 
            className={roastMode === 'genz' ? 'active' : ''}
            onClick={() => setRoastMode('genz')}
          >
            😭 Chaotic Gen-Z
          </button>
          <button 
            className={roastMode === 'gentle' ? 'active' : ''}
            onClick={() => setRoastMode('gentle')}
          >
            😌 Gentle Comedy
          </button>
        </div>

        <div className="industry-selector">
          <label>Industry View:</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="tech">Tech</option>
            <option value="design">Design</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
          </select>
        </div>

        <div className="persona-modes">
          <button 
            className={personaMode === 'realistic' ? 'active' : ''}
            onClick={() => setPersonaMode('realistic')}
          >
            🟢 Realistic
          </button>
          <button 
            className={personaMode === 'idealized' ? 'active' : ''}
            onClick={() => setPersonaMode('idealized')}
          >
            🔵 Idealized
          </button>
          <button 
            className={personaMode === 'shadow' ? 'active' : ''}
            onClick={() => setPersonaMode('shadow')}
          >
            🔴 Shadow
          </button>
          <button 
            className={personaMode === 'evil' ? 'active' : ''}
            onClick={() => setPersonaMode('evil')}
          >
            🟣 Evil Twin
          </button>
        </div>

        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Roast My Resume 🔥'}
        </button>
      </div>

      {/* Demo Preview Section */}
      <div className="demo-section">
        <h2>🎯 What You'll Get:</h2>
        
        <div className="demo-grid">
          <div className="demo-card">
            <h3>🔥 Savage Roast</h3>
            <p>"Bro... your skills section is giving 'please pick me' energy 😭"</p>
          </div>
          
          <div className="demo-card">
            <h3>🎭 8 Hiring Manager Views</h3>
            <p>See how The Skeptic, Visionary, Traditionalist & 5 others judge you</p>
          </div>
          
          <div className="demo-card">
            <h3>⚡ First Impression Score</h3>
            <p>3-second & 7-second scan analysis</p>
          </div>
          
          <div className="demo-card">
            <h3>🏢 Industry Transformation</h3>
            <p>How you look in Tech vs Design vs Finance vs Healthcare</p>
          </div>
          
          <div className="demo-card">
            <h3>🎪 Career Personas</h3>
            <p>Realistic • Idealized • Shadow • Evil Twin modes</p>
          </div>
          
          <div className="demo-card">
            <h3>💎 Premium Rebuild</h3>
            <p>ATS Format • Modern Design • Industry-Specific versions</p>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="results">
          <div className="roast-section">
            <h2>🔥 The Savage Roast</h2>
            <p>{analysis.roast}</p>
          </div>

          <div className="bias-filters">
            <h2>🎭 Hiring Manager Bias Filters</h2>
            {analysis.biasFilters?.map((filter: any, i: number) => (
              <div key={i} className="bias-card">
                <h3>{filter.persona}</h3>
                <p>{filter.perception}</p>
              </div>
            ))}
          </div>

          <div className="first-impression">
            <h2>⚡ First Impression Score</h2>
            <div className="impression-card">
              <h3>3-Second Scan:</h3>
              <p>{analysis.firstImpression?.threeSecond}</p>
            </div>
            <div className="impression-card">
              <h3>7-Second Scan:</h3>
              <p>{analysis.firstImpression?.sevenSecond}</p>
            </div>
          </div>

          <div className="industry-view">
            <h2>🏢 Industry Transformation</h2>
            <div className="industry-card">
              <h3>Your {industry.charAt(0).toUpperCase() + industry.slice(1)} Persona:</h3>
              <p>{analysis.industryView}</p>
            </div>
          </div>

          <div className="persona-analysis">
            <h2>🎪 Career Persona Analysis</h2>
            <div className="persona-card">
              <h3>{personaMode.charAt(0).toUpperCase() + personaMode.slice(1)} Mode:</h3>
              <p>{analysis.personaAnalysis}</p>
            </div>
          </div>

          <div className="cta-section">
            <button className="premium-btn" onClick={handlePremiumClick}>
              🚀 Fix My Resume - $12 💎
            </button>
            <p className="premium-features">
              ✨ ATS Format • 🎨 Modern Design • 📊 Industry-Specific • 🎯 Role-Targeted
            </p>
          </div>
        </div>
      )}

      {showPremium && (
        <div className="premium-modal">
          <div className="premium-content">
            <h2>🚀 Premium Resume Rebuild</h2>
            <p>Transform your resume with AI-powered optimization:</p>
            
            <div className="premium-options">
              <div className="premium-option">
                <h3>✨ ATS-Optimized Format</h3>
                <p>Beat applicant tracking systems with keyword optimization</p>
              </div>
              <div className="premium-option">
                <h3>🎨 Modern Design</h3>
                <p>Professional, eye-catching layout that stands out</p>
              </div>
              <div className="premium-option">
                <h3>📊 Industry-Specific</h3>
                <p>Tailored for {industry} with relevant terminology</p>
              </div>
              <div className="premium-option">
                <h3>🎯 Role-Targeted</h3>
                <p>Optimized for your specific career goals</p>
              </div>
            </div>
            
            <div className="premium-actions">
              <button 
                className="premium-buy" 
                onClick={handleRebuildResume}
                disabled={rebuildLoading}
              >
                {rebuildLoading ? 'Rebuilding...' : 'Test Rebuild (Free)'}
              </button>
              <button className="premium-close" onClick={() => setShowPremium(false)}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {rebuiltResume && (
        <div className="rebuilt-section">
          <h2>🚀 Your Rebuilt Resume</h2>
          
          <div className="rebuilt-formats">
            <div className="format-card">
              <div className="format-header">
                <h3>✨ ATS-Optimized Version</h3>
                <button 
                  className="download-individual" 
                  onClick={() => handleDownload('ATS-Optimized', rebuiltResume.atsVersion)}
                >
                  📄 Download
                </button>
              </div>
              <div className="resume-content">
                {rebuiltResume.atsVersion}
              </div>
            </div>
            
            <div className="format-card">
              <div className="format-header">
                <h3>🎨 Modern Design Version</h3>
                <button 
                  className="download-individual" 
                  onClick={() => handleDownload('Modern-Design', rebuiltResume.modernVersion)}
                >
                  📄 Download
                </button>
              </div>
              <div className="resume-content">
                {rebuiltResume.modernVersion}
              </div>
            </div>
            
            <div className="format-card">
              <div className="format-header">
                <h3>📊 Industry-Specific Version</h3>
                <button 
                  className="download-individual" 
                  onClick={() => handleDownload('Industry-Specific', rebuiltResume.industryVersion)}
                >
                  📄 Download
                </button>
              </div>
              <div className="resume-content">
                {rebuiltResume.industryVersion}
              </div>
            </div>
          </div>
          
          <div className="download-section">
            <button 
              className="download-btn" 
              onClick={() => {
                handleDownload('ATS-Optimized', rebuiltResume.atsVersion);
                handleDownload('Modern-Design', rebuiltResume.modernVersion);
                handleDownload('Industry-Specific', rebuiltResume.industryVersion);
              }}
            >
              📄 Download All Versions
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          background-attachment: fixed;
          min-height: 100vh;
        }
      `}</style>
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
        }
        header {
          text-align: center;
          margin-bottom: 60px;
          color: white;
          padding: 0 20px;
        }
        h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #00d4ff, #5b63f7, #ff6b9d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        header p {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          opacity: 0.9;
          font-weight: 300;
          color: #e2e8f0;
        }
        .upload-section {
          background: rgba(30, 30, 50, 0.95);
          backdrop-filter: blur(20px);
          padding: clamp(20px, 4vw, 40px);
          border-radius: 20px;
          text-align: center;
          margin-bottom: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        input[type="file"] {
          background: #1e293b;
          border: 2px dashed #64748b;
          border-radius: 12px;
          padding: clamp(15px, 3vw, 30px);
          width: 100%;
          margin-bottom: 30px;
          transition: all 0.3s ease;
          color: #e2e8f0;
        }
        input[type="file"]:hover {
          border-color: #00d4ff;
          background: #334155;
        }
        .roast-modes {
          display: flex;
          gap: clamp(15px, 3vw, 25px);
          justify-content: center;
          margin: 40px 0;
          flex-wrap: wrap;
        }
        .roast-modes button, .persona-modes button {
          padding: clamp(22px 40px, 5vw, 28px 50px);
          border: 2px solid #475569;
          background: #1e293b;
          color: #e2e8f0;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          font-size: clamp(0.8rem, 1.5vw, 1rem);
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          margin: 12px;
        }
        .roast-modes button:hover, .persona-modes button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
          border-color: #00d4ff;
        }
        .roast-modes button.active, .persona-modes button.active {
          background: linear-gradient(45deg, #00d4ff, #5b63f7);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }
        .industry-selector {
          margin: 30px 0;
        }
        .industry-selector label {
          font-weight: 600;
          color: #e2e8f0;
          margin-right: 15px;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
        }
        .industry-selector select {
          padding: 12px 20px;
          border-radius: 12px;
          border: 2px solid #475569;
          background: #1e293b;
          color: #e2e8f0;
          font-weight: 500;
          cursor: pointer;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
        }
        .persona-modes {
          display: flex;
          gap: clamp(12px, 2.5vw, 20px);
          justify-content: center;
          margin: 40px 0;
          flex-wrap: wrap;
        }
        button {
          padding: clamp(28px 56px, 6vw, 36px 72px);
          background: linear-gradient(45deg, #00d4ff, #5b63f7);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: clamp(1rem, 2vw, 1.1rem);
          font-weight: 600;
          cursor: pointer;
          margin: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(0, 212, 255, 0.4);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .results {
          margin-top: 40px;
        }
        .roast-section, .bias-filters, .first-impression, .industry-view, .persona-analysis {
          background: rgba(30, 30, 50, 0.95);
          backdrop-filter: blur(20px);
          padding: clamp(20px, 4vw, 30px);
          border-radius: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .roast-section h2, .bias-filters h2, .first-impression h2, .industry-view h2, .persona-analysis h2 {
          color: #ffffff;
          font-weight: 700;
          margin-bottom: 20px;
          font-size: clamp(1.3rem, 3vw, 1.8rem);
        }
        .roast-section p, .bias-filters p, .first-impression p, .industry-view p, .persona-analysis p {
          color: #e2e8f0;
        }
        .bias-card, .impression-card, .industry-card, .persona-card {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: clamp(15px, 3vw, 20px);
          border-radius: 15px;
          margin: 15px 0;
          border-left: 4px solid #00d4ff;
          transition: all 0.3s ease;
        }
        .bias-card h3, .impression-card h3, .industry-card h3, .persona-card h3 {
          color: #ffffff;
          margin-bottom: 10px;
        }
        .bias-card p, .impression-card p, .industry-card p, .persona-card p {
          color: #cbd5e1;
        }
        .bias-card:hover, .impression-card:hover, .industry-card:hover, .persona-card:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          border-left-color: #ff6b9d;
        }
        .premium-features {
          color: #94a3b8;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          margin-top: 15px;
          font-weight: 500;
        }
        .premium-btn {
          background: linear-gradient(45deg, #ff6b9d, #00d4ff);
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          padding: clamp(26px 52px, 6vw, 32px 80px);
          box-shadow: 0 12px 30px rgba(255, 107, 157, 0.4);
        }
        .premium-btn:hover {
          box-shadow: 0 16px 35px rgba(255, 107, 157, 0.5);
        }
        .cta-section {
          text-align: center;
          margin: 50px 0;
        }
        .demo-section {
          margin: 50px 0;
          text-align: center;
          padding: 0 20px;
        }
        .demo-section h2 {
          color: #ffffff;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 40px;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(15px, 3vw, 25px);
          margin-top: 40px;
        }
        .demo-card {
          background: rgba(30, 30, 50, 0.95);
          backdrop-filter: blur(20px);
          padding: clamp(20px, 4vw, 30px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        .demo-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 50px rgba(0, 0, 0, 0.4);
          border-color: #00d4ff;
        }
        .demo-card h3 {
          margin-bottom: 15px;
          color: #ffffff;
          font-weight: 700;
          font-size: clamp(1.1rem, 2vw, 1.3rem);
        }
        .demo-card p {
          color: #cbd5e1;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          .roast-modes, .persona-modes {
            gap: 8px;
          }
          .industry-selector {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .industry-selector label {
            margin-right: 0;
          }
        }
        
        @media (max-width: 480px) {
          .demo-grid {
            grid-template-columns: 1fr;
          }
        }
        .premium-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .premium-content {
          background: rgba(30, 30, 50, 0.98);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 600px;
          width: 90%;
          text-align: center;
        }
        .premium-content h2 {
          color: #ffffff;
          margin-bottom: 20px;
          font-size: 2rem;
        }
        .premium-content p {
          color: #cbd5e1;
          margin-bottom: 30px;
        }
        .premium-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .premium-option {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: 20px;
          border-radius: 15px;
          border-left: 4px solid #00d4ff;
        }
        .premium-option h3 {
          color: #ffffff;
          margin-bottom: 10px;
        }
        .premium-option p {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .premium-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 30px;
        }
        .premium-buy {
          background: linear-gradient(45deg, #ff6b9d, #00d4ff);
          padding: 16px 32px;
          border-radius: 50px;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .premium-close {
          background: transparent;
          border: 2px solid #475569;
          color: #cbd5e1;
          padding: 16px 32px;
          border-radius: 50px;
          cursor: pointer;
        }
        .rebuilt-section {
          margin: 40px 0;
        }
        .rebuilt-section h2 {
          color: #ffffff;
          text-align: center;
          margin-bottom: 30px;
          font-size: 2rem;
        }
        .rebuilt-formats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        .format-card {
          background: rgba(30, 30, 50, 0.95);
          backdrop-filter: blur(20px);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .format-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .format-card h3 {
          color: #ffffff;
          margin: 0;
        }
        .download-individual {
          background: linear-gradient(45deg, #00d4ff, #5b63f7);
          padding: 8px 16px;
          border-radius: 25px;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .download-individual:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        .resume-content {
          background: #1e293b;
          padding: 20px;
          border-radius: 10px;
          color: #e2e8f0;
          font-family: monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          max-height: 400px;
          overflow-y: auto;
          white-space: pre-wrap;
        }
        .download-section {
          text-align: center;
        }
        .download-btn {
          background: linear-gradient(45deg, #00d4ff, #5b63f7);
          padding: 16px 32px;
          border-radius: 50px;
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
