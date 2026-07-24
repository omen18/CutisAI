// frontend/src/pages/UserResult/UserResult.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserResult.css';
import { generatePdf } from '../../utils/generatePdf';

interface Result {
  label: 'malignant' | 'benign';
  confidence: number;
  mask_base64: string | null;
  originalImageUrl: string | null;
  inference_time_ms: number;
  recommendation: string;
}

const STEPS = {
  malignant: [
    { color:'var(--rose)', text:'Book an urgent dermatologist appointment within the next 2 weeks.' },
    { color:'var(--rose)', text:'Do not scratch, pick, or apply any substances to the lesion.' },
    { color:'var(--burg)', text:'Take additional photos from different angles for your dermatologist.' },
    { color:'var(--burg)', text:'Review your family history of skin cancer and share it with your doctor.' },
  ],
  benign: [
    { color:'var(--sage)', text:'Continue regular skin self-checks every 4–6 weeks.' },
    { color:'var(--sage)', text:'Book a routine dermatology review if you have not had one in the past year.' },
    { color:'var(--burg)', text:'Monitor for any changes in size, colour, or texture.' },
    { color:'var(--muted3)', text:'Apply broad-spectrum SPF 50+ sunscreen daily.' },
  ],
};

const UserResult: React.FC = () => {
  const [result, setResult] = useState<Result | null>(null);
  const [activeTab, setActiveTab] = useState<'result'|'mask'|'raw'>('result');
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem('derma_result');
    if (!raw) { navigate('/'); return; }
    try { setResult(JSON.parse(raw)); }
    catch { navigate('/'); }
  }, [navigate]);

  if (!result) return null;

  const isMal    = result.label === 'malignant';
  const accent   = isMal ? 'var(--rose)' : 'var(--sage)';
  const malConf  = isMal ? result.confidence * 100 : (1 - result.confidence) * 100;
  const benConf  = isMal ? (1 - result.confidence) * 100 : result.confidence * 100;
  const steps    = isMal ? STEPS.malignant : STEPS.benign;
  const inferSec = (result.inference_time_ms / 1000).toFixed(2) + 's';
  const now      = new Date().toLocaleString('en-GB',{ day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  const imgSrc = () => {
    if (activeTab === 'mask' && result.mask_base64) return `data:image/png;base64,${result.mask_base64}`;
    return result.originalImageUrl ?? '';
  };

  return (
    <div className="ur">
      {/* Topbar */}
      <nav className="ur-topbar">
        <div className="ur-logo">
          <div className="ur-logo-ring">
            <svg viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(250,247,242,0.7)" strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.8" fill="rgba(250,247,242,0.7)"/>
            </svg>
          </div>
          <span className="ur-logo-name">CutisAI</span>
        </div>
        <button className="ur-back-topbar" onClick={() => navigate('/')}>← Back to upload</button>
      </nav>

      <main className="ur-main">

        {/* Result Header */}
        <div className="ur-header">
          <button className="ur-back" onClick={() => navigate('/')}>← Analyse another image</button>
          <div className="ur-header-content">
            <div>
              <div className="ur-ptag" style={{ color: accent }}>Analysis complete</div>
              <h1 className="ur-title">Your result is ready</h1>
              <div className="ur-timestamp">Analysed {now}</div>
            </div>
            <div className={`ur-risk-badge ur-risk-badge--${isMal?'mal':'ben'}`}>
              {isMal ? '⚠ High risk' : '✓ Low risk'}
            </div>
          </div>
        </div>

        {/* 2-col grid */}
        <div className="ur-grid">

          {/* Left — Result Card */}
          <div className="ur-card">
            <div className="ur-ch">
              <span className="ur-ct">Analysis result</span>
              <span className={`ur-ctag ur-ctag--${isMal?'r':'g'}`}>{isMal ? 'High risk' : 'Low risk'}</span>
            </div>

            {/* Image */}
            <div className="ur-res-img" style={{ background: result.originalImageUrl ? '#1a1a1a' : 'radial-gradient(ellipse at 58% 48%,#C4835A 0%,#8B4A20 30%,#4A2010 65%,#1E0E08 100%)' }}>
              {result.originalImageUrl ? (
                <>
                  <img src={imgSrc()} alt="Lesion" className="ur-res-photo"/>
                  {activeTab === 'result' && result.mask_base64 && (
                    <img src={`data:image/png;base64,${result.mask_base64}`} alt="mask" className="ur-res-mask"/>
                  )}
                </>
              ) : (
                <><div className="ur-res-overlay"/><div className="ur-res-ring" style={{borderColor: accent}}/></>
              )}
              <div className="ur-res-label" style={{color: accent}}>
                {isMal ? 'Malignant lesion' : 'Benign lesion'}
              </div>
            </div>

            {/* Tabs */}
            <div className="ur-rtabs">
              {(['result','mask','raw'] as const).map(t => (
                <div key={t} className={`ur-rtb${activeTab===t?' ur-rtb--on':''}`} onClick={()=>setActiveTab(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </div>
              ))}
            </div>

            <div className="ur-rmain">
              {/* Diagnosis */}
              <div className="ur-diag-tag">Primary diagnosis</div>
              <div className="ur-diag-val" style={{color: accent}}>
                <div className="ur-diag-ico" style={{background: isMal ? 'rgba(201,99,122,0.1)':'rgba(74,103,65,0.1)'}}>
                  {isMal ? '!' : '✓'}
                </div>
                {isMal ? 'Malignant' : 'Benign'}
              </div>

              {/* Confidence bars */}
              <div className="ur-cbar-row">
                <div className="ur-cbar-head">
                  <span className="ur-cbar-name">Malignant</span>
                  <span className="ur-cbar-pct" style={{color:'var(--rose)'}}>{malConf.toFixed(1)}%</span>
                </div>
                <div className="ur-cbar-track"><div className="ur-cbar-fill" style={{width:`${malConf}%`,background:'var(--rose)'}}/></div>
                <div className="ur-cbar-head">
                  <span className="ur-cbar-name">Benign</span>
                  <span className="ur-cbar-pct" style={{color:'var(--muted3)'}}>{benConf.toFixed(1)}%</span>
                </div>
                <div className="ur-cbar-track"><div className="ur-cbar-fill" style={{width:`${benConf}%`,background:'var(--muted3)'}}/></div>
              </div>

              {/* Mini metrics */}
              <div className="ur-mgrid">
                <div className="ur-mm"><div className="ur-mml">Confidence</div><div className="ur-mmv" style={{color:accent}}>{(result.confidence*100).toFixed(1)}%</div></div>
                <div className="ur-mm"><div className="ur-mml">Infer. time</div><div className="ur-mmv">{inferSec}</div></div>
                <div className="ur-mm"><div className="ur-mml">Model</div><div className="ur-mmv" style={{fontSize:12,color:'var(--muted2)'}}>EffNet-B0</div></div>
                <div className="ur-mm"><div className="ur-mml">Device</div><div className="ur-mmv" style={{fontSize:12,color:'var(--muted2)'}}>CPU·INT8</div></div>
              </div>

              {/* Recommendation */}
              <div className="ur-rec" style={{background: isMal?'rgba(201,99,122,0.06)':'rgba(74,103,65,0.06)', borderColor: isMal?'rgba(201,99,122,0.18)':'rgba(74,103,65,0.18)'}}>
                <div className="ur-rec-t" style={{color:accent}}>Clinical recommendation</div>
                <div className="ur-rec-b">{result.recommendation}</div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="ur-right-col">

            {/* Understanding card */}
            <div className="ur-card">
              <div className="ur-ch"><span className="ur-ct">Understanding your result</span></div>
              <div className="ur-understand">
                <p>The AI model analysed your image in two stages: first it drew a precise boundary around the lesion (segmentation), then it classified the enclosed region as <strong style={{color:accent}}>{isMal?'malignant':'benign'}</strong> with a confidence of <strong>{(result.confidence*100).toFixed(1)}%</strong>.</p>
                <p>A higher confidence score means the model has a stronger signal for its prediction. Scores above 80% are considered reliable, though this tool does not replace a clinical diagnosis.</p>
                <p>This result is for <strong>informational purposes only</strong> and should not be used as a substitute for professional medical advice.</p>
              </div>
            </div>

            {/* Next steps */}
            <div className="ur-card">
              <div className="ur-ch"><span className="ur-ct">Recommended next steps</span></div>
              <div className="ur-steps">
                {steps.map((s,i) => (
                  <div key={i} className="ur-step">
                    <span className="ur-step-num" style={{color:s.color}}>{String(i+1).padStart(2,'0')}</span>
                    <p className="ur-step-text" style={i===0?{color:s.color,fontWeight:600}:{}}>{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="ur-ctas">
                <button className="ur-btn-secondary" onClick={() => generatePdf({
                        label:             result.label,
                        confidence:        result.confidence,
                        mask_base64:       result.mask_base64,
                        originalImageUrl:  result.originalImageUrl,
                        inference_time_ms: result.inference_time_ms,
                        recommendation:    result.recommendation,
            })}>
                  Download PDF report
                </button>
                <button className="ur-btn-primary" onClick={() => navigate('/')}>
                  Analyse another image
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default UserResult;
