// frontend/src/pages/UserHome/UserHome.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserHome.css';

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';

const UserHome: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview,      setPreview]      = useState<string | null>(null);
  const [isDrag,       setIsDrag]       = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [activeNav,    setActiveNav]    = useState('home');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg','image/png','image/tiff'].includes(file.type)) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    try {
      const res  = await fetch(`${API_URL}/api/analyse`, { method:'POST', body:fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const conf = data.confidence / 100;
      sessionStorage.setItem('derma_result', JSON.stringify({
        label:             data.label,
        confidence:        conf,
        mask_base64:       data.mask_base64,
        originalImageUrl:  URL.createObjectURL(selectedFile),
        inference_time_ms: data.inference_time_ms,
        recommendation:    data.recommendation,
      }));
      navigate('/result');
    } catch (err) {
      console.error('API Error:', err);
      alert(`Failed to connect to backend. Make sure it's running on port 8000.`);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="uh">
      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <nav className="uh-topbar">
        <div className="uh-logo">
          <div className="uh-logo-ring">
            <svg viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(250,247,242,0.7)" strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.8" fill="rgba(250,247,242,0.7)"/>
              <path d="M6.5 1.5v1.2M6.5 10.3v1.2M1.5 6.5h1.2M10.3 6.5h1.2" stroke="rgba(250,247,242,0.5)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="uh-logo-name">CutisAI</span>
        </div>
        <div className="uh-topnav">
          {['Home','About','How it works','Research'].map(n => (
            <button key={n} className={`uh-tn${n==='Home'?' uh-tn--on':''}`}>{n}</button>
          ))}
        </div>
        <button className="uh-topbar-cta" onClick={() => navigate('/doctor')}>
          Doctor portal →
        </button>
      </nav>

      {/* ── MAIN ─────────────────────────────────────────────────────────────── */}
      <main className="uh-main">

        {/* Hero */}
        <div className="uh-hero">
          <div className="uh-hero-left">
            <div className="uh-ptag">AI Skin Lesion Screening</div>
            <h1 className="uh-title">Check your skin<br/>lesion in seconds</h1>
            <p className="uh-subtitle">
              Upload a clear dermoscopic or close-up photo. Our AI model will analyse
              it and provide a preliminary risk assessment.
            </p>
            <p className="uh-disclaimer">
              This tool is for informational purposes only and is not a substitute
              for professional medical diagnosis.
            </p>
            {/* Trust stats */}
            <div className="uh-trust">
              {[
                { value:'33K+',  label:'Images trained on' },
                { value:'95.6%', label:'AUC-ROC accuracy'  },
                { value:'<2s',   label:'Inference time'     },
              ].map(s => (
                <div key={s.label} className="uh-trust-item">
                  <div className="uh-trust-val">{s.value}</div>
                  <div className="uh-trust-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Card */}
          <div className="uh-upload-card">
            <div className="uh-card-header">
              <span className="uh-ct">Upload your image</span>
              <span className="uh-ctag uh-ctag--b">ONNX · CPU</span>
            </div>
            <div
              className={`uh-uzone${isDrag?' uh-uzone--drag':''}`}
              onDragOver={e=>{e.preventDefault();setIsDrag(true);}}
              onDragLeave={()=>setIsDrag(false)}
              onDrop={e=>{e.preventDefault();setIsDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
              onClick={()=>inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/tiff"
                style={{display:'none'}}
                onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
              {preview ? (
                <div className="uh-preview">
                  <img src={preview} alt="Preview" className="uh-preview-img"/>
                  <button className="uh-change" onClick={e=>{e.stopPropagation();setPreview(null);setSelectedFile(null);}}>
                    Change image
                  </button>
                </div>
              ) : (
                <>
                  <div className="uh-uico">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 3v12M4 9l6-6 6 6"/><path d="M3 17h14"/>
                    </svg>
                  </div>
                  <div className="uh-utitle">Drop your photo here</div>
                  <div className="uh-usub">or click to browse — JPEG, PNG, TIFF up to 20 MB</div>
                  <div className="uh-ufmts">
                    <span className="uh-ufmt">Good lighting</span>
                    <span className="uh-ufmt">Lesion centered</span>
                    <span className="uh-ufmt">No blur</span>
                  </div>
                </>
              )}
            </div>
            <div className="uh-card-footer">
              <button
                className="uh-analyse-btn"
                onClick={handleAnalyse}
                disabled={!selectedFile || isLoading}>
                {isLoading ? (
                  <><span className="uh-spinner"/>Analysing…</>
                ) : 'Analyse now'}
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="uh-how">
          <div className="uh-how-header">
            <span className="uh-ptag">Process</span>
            <h2 className="uh-how-title">How it works</h2>
          </div>
          <div className="uh-steps">
            {[
              { num:'01', title:'Upload photo',       body:'Take a clear, close-up photo of your lesion and drag it into the upload area.',  icon:'⬆' },
              { num:'02', title:'AI analyses lesion', body:'Our two-stage AI pipeline segments the lesion boundary and classifies the region.',icon:'◈' },
              { num:'03', title:'Get your result',    body:'Review your risk score, segmentation mask, and recommended next steps instantly.',icon:'⬇' },
            ].map(s => (
              <div key={s.num} className="uh-step-card">
                <div className="uh-step-num">{s.num}</div>
                <div className="uh-step-icon">{s.icon}</div>
                <div className="uh-step-title">{s.title}</div>
                <div className="uh-step-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default UserHome;
