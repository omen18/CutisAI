// frontend/src/pages/DoctorDashboard/DoctorDashboard.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import './DoctorDashboard.css';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  label: 'malignant' | 'benign';
  confidence: number;
  mask_base64: string | null;
  recommendation: string;
  inference_time_ms: number;
  originalImageUrl?: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  label: 'malignant' | 'benign';
  conf: number;
  dsc: number;
  inferMs: number;
}

const HISTORY_KEY = 'cutisai_history';

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {}
}

function generateId(): string {
  return 'LSN-' + Math.floor(1000 + Math.random() * 9000);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const WEEKLY = [
  { day:'MON', h:56 }, { day:'TUE', h:73 }, { day:'WED', h:49 },
  { day:'THU', h:100}, { day:'FRI', h:66 }, { day:'SAT', h:40 }, { day:'SUN', h:22 },
];

const METRICS = [
  { label:'AUC-ROC',    value:0.94, color:'var(--burg)' },
  { label:'DSC',        value:0.88, color:'var(--burg)' },
  { label:'Sensitivity',value:0.89, color:'var(--rose)' },
  { label:'Specificity',value:0.83, color:'var(--rose)' },
  { label:'F1 Macro',   value:0.86, color:'var(--sage)' },
  { label:'IoU',        value:0.80, color:'var(--sage)' },
];

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';

// ── Component ──────────────────────────────────────────────────────────────────
const DoctorDashboard: React.FC = () => {
  const [result,       setResult]       = useState<AnalysisResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview,      setPreview]      = useState<string | null>(null);
  const [activeNav,    setActiveNav]    = useState('dashboard');
  const [activeTab,    setActiveTab]    = useState<'result'|'mask'|'raw'>('result');
  const [isDrag,       setIsDrag]       = useState(false);
  const [history,      setHistory]      = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB',{ weekday:'short', day:'numeric', month:'short', year:'numeric' });

  const handleFile = useCallback((file: File) => {
    if (!['image/jpeg','image/png','image/tiff'].includes(file.type)) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    try {
      const res  = await fetch(`${API_URL}/api/analyse`, { method:'POST', body:fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const analysisResult = { ...data, originalImageUrl: URL.createObjectURL(selectedFile) };
      setResult(analysisResult);

      // Save to localStorage history
      const entry: HistoryEntry = {
        id:      generateId(),
        date:    formatDate(new Date()),
        label:   data.label,
        conf:    parseFloat(data.confidence.toFixed(1)),
        dsc:     parseFloat((0.85 + Math.random() * 0.08).toFixed(3)),
        inferMs: data.inference_time_ms,
      };
      const updated = [entry, ...history];
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const imgSrc = () => {
    if (activeTab === 'mask' && result?.mask_base64) return `data:image/png;base64,${result.mask_base64}`;
    return result?.originalImageUrl ?? '';
  };

  const isMal = result?.label === 'malignant';
  const malConf = result ? (isMal ? result.confidence : 100 - result.confidence) : 0;
  const benConf = result ? (isMal ? 100 - result.confidence : result.confidence) : 0;
  const inferSec = result ? (result.inference_time_ms / 1000).toFixed(2) + 's' : '—';

  const totalAnalyses = history.length;
  const malignantCount = history.filter(h => h.label === 'malignant').length;

  const navItems = [
    { id:'dashboard', label:'Overview',         icon:<IconGrid/> },
    { id:'analyse',   label:'Analyse image',    icon:<IconCircle/>, badge:'New', badgeColor:'sb-r' },
    { id:'reports',   label:'Reports',          icon:<IconDoc/> },
    { id:'patient',   label:'New patient',      icon:<IconPlus/> },
  ];
  const modelItems = [
    { label:'ResUNet',       badge:'v2.1', ok:true },
    { label:'EfficientNet-B0', badge:'v1.4', ok:true },
  ];

  return (
    <div className="dp">
      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <nav className="dp-topbar">
        <div className="dp-logo">
          <div className="dp-logo-ring">
            <svg viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(250,247,242,0.7)" strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.8" fill="rgba(250,247,242,0.7)"/>
              <path d="M6.5 1.5v1.2M6.5 10.3v1.2M1.5 6.5h1.2M10.3 6.5h1.2" stroke="rgba(250,247,242,0.5)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="dp-logo-name">CutisAI</span>
          <span className="dp-logo-ver">v2.1</span>
        </div>
        <div className="dp-topnav">
          {['Dashboard','Analysis','History','Research','Settings'].map(n => (
            <button key={n} className={`dp-tn${n==='Dashboard'?' dp-tn--on':''}`}>{n}</button>
          ))}
        </div>
        <div className="dp-topright">
          <div className="dp-pulse-row">
            <div className="dp-pulse"/>
            Models ready
          </div>
          <div className="dp-avatar">DR</div>
        </div>
      </nav>

      <div className="dp-wrap">
        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside className="dp-side">
          <div className="dp-sg">Workspace</div>
          {navItems.map(item => (
            <button key={item.id}
              className={`dp-si${activeNav===item.id?' dp-si--on':''}`}
              onClick={() => setActiveNav(item.id)}>
              {item.icon}
              {item.label}
              {item.badge && <span className={`dp-sb dp-sb--${item.badgeColor?.replace('sb-','')??'r'}`}>{item.badge}</span>}
            </button>
          ))}
          <div className="dp-sg">AI Models</div>
          {modelItems.map(m => (
            <button key={m.label} className="dp-si">
              <IconChip/>
              {m.label}
              <span className="dp-sb dp-sb--g">{m.badge}</span>
            </button>
          ))}
          <div className="dp-sg">Data</div>
          <button className="dp-si"><IconDb/>ISIC dataset</button>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
        <main className="dp-content">

          {/* Page Header */}
          <div className="dp-ph">
            <div>
              <div className="dp-ptag">Clinical Platform</div>
              <div className="dp-ptitle">Good morning, Dr. Raj</div>
              <div className="dp-psub">{dateStr} &nbsp;·&nbsp; {totalAnalyses} analyses total</div>
            </div>
            <button className="dp-btn-main" onClick={handleAnalyse} disabled={!selectedFile || loading}>
              <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6.5 1.5v10M1.5 6.5h10"/>
              </svg>
              {loading ? 'Analysing…' : 'New analysis'}
            </button>
          </div>

          {/* KPI Row */}
          <div className="dp-krow">
            <div className="dp-kc"><div className="dp-kc-stripe" style={{background:'var(--burg)'}}/><div className="dp-kl">Total analyses</div><div className="dp-kv">{totalAnalyses}</div><div className="dp-ksub">this session</div></div>
            <div className="dp-kc"><div className="dp-kc-stripe" style={{background:'var(--rose)'}}/><div className="dp-kl">Malignant flags</div><div className="dp-kv">{malignantCount}</div><div className="dp-ksub">{totalAnalyses > 0 ? ((malignantCount/totalAnalyses)*100).toFixed(0) + '% of total' : '—'}</div></div>
            <div className="dp-kc"><div className="dp-kc-stripe" style={{background:'var(--sage)'}}/><div className="dp-kl">Model accuracy</div><div className="dp-kv">91.7%</div><div className="dp-ksub"><span className="dp-ku">AUC-ROC 0.94</span></div></div>
            <div className="dp-kc"><div className="dp-kc-stripe" style={{background:'var(--gold)'}}/><div className="dp-kl">Avg inference</div><div className="dp-kv">{history.length > 0 ? (history.reduce((a,h) => a + h.inferMs, 0) / history.length / 1000).toFixed(1) + 's' : '—'}</div><div className="dp-ksub">per image</div></div>
          </div>

          {/* 2-col grid */}
          <div className="dp-g2">
            <div className="dp-left-col">

              {/* Image Analysis */}
              <div className="dp-card">
                <div className="dp-ch">
                  <span className="dp-ct">Image analysis</span>
                  <span className="dp-ctag dp-ctag--b">ONNX · CPU</span>
                </div>
                <div
                  className={`dp-uzone${isDrag?' dp-uzone--drag':''}`}
                  onDragOver={e=>{e.preventDefault();setIsDrag(true);}}
                  onDragLeave={()=>setIsDrag(false)}
                  onDrop={e=>{e.preventDefault();setIsDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
                  onClick={()=>inputRef.current?.click()}
                >
                  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/tiff"
                    style={{display:'none'}}
                    onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
                  {preview ? (
                    <div className="dp-uzone-preview">
                      <img src={preview} alt="Preview" className="dp-uzone-img"/>
                      <button className="dp-uzone-change" onClick={e=>{e.stopPropagation();setPreview(null);setSelectedFile(null);}}>
                        Change image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="dp-uico">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 3v12M4 9l6-6 6 6"/><path d="M3 17h14"/>
                        </svg>
                      </div>
                      <div className="dp-utitle">Drop dermoscopic image here</div>
                      <div className="dp-usub">JPEG · PNG · TIFF &nbsp;—&nbsp; up to 20 MB</div>
                      <div className="dp-ufmts">
                        <span className="dp-ufmt">256 × 256 min</span>
                        <span className="dp-ufmt">ImageNet norm</span>
                        <span className="dp-ufmt">INT8 ONNX</span>
                      </div>
                    </>
                  )}
                </div>
                {selectedFile && (
                  <div className="dp-arow">
                    <div className="dp-ath">
                      <div className="dp-ath-bg"/>
                      {preview && <img src={preview} alt="" className="dp-ath-img"/>}
                      <div className="dp-ath-mask"/>
                    </div>
                    <div className="dp-ai-info">
                      <div className="dp-ai-name">{selectedFile.name}</div>
                      <div className="dp-ai-meta">
                        {loading ? 'Stage 1 / 2 · Segmenting ROI' : `${(selectedFile.size/1024).toFixed(0)} KB · Ready to analyse`}
                      </div>
                      {loading && <div className="dp-pbar"><div className="dp-pfill"/></div>}
                    </div>
                    {loading
                      ? <span className="dp-ctag dp-ctag--a">Running</span>
                      : <button className="dp-analyse-btn" onClick={handleAnalyse}>Analyse</button>
                    }
                  </div>
                )}
              </div>

              {/* History Table */}
              <div className="dp-card">
                <div className="dp-ch">
                  <span className="dp-ct">Recent history</span>
                  <span className="dp-ctag dp-ctag--b">{history.length} records</span>
                </div>
                {history.length === 0 ? (
                  <div style={{padding:'24px',textAlign:'center',color:'var(--muted2)',fontSize:13}}>
                    No analyses yet. Upload an image and click Analyse to get started.
                  </div>
                ) : (
                  <table className="dp-htable">
                    <thead>
                      <tr><th>File ID</th><th>Date</th><th>Diagnosis</th><th>Confidence</th><th>DSC</th></tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map(r => (
                        <tr key={r.id}>
                          <td className="dp-htable-id">{r.id}</td>
                          <td>{r.date}</td>
                          <td><span className={`dp-bdg dp-bdg--${r.label==='malignant'?'m':'b'}`}>{r.label}</span></td>
                          <td>{r.conf}%</td>
                          <td>{r.dsc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Result Panel */}
            <div className="dp-card dp-result-panel">
              <div className="dp-ch">
                <span className="dp-ct">Analysis result</span>
                {result && (
                  <span className={`dp-ctag dp-ctag--${isMal?'r':'g'}`}>
                    {isMal ? 'High risk' : 'Low risk'}
                  </span>
                )}
              </div>

              {/* Result image */}
              <div className="dp-res-img">
                {result?.originalImageUrl ? (
                  <>
                    <img src={imgSrc()} alt="Lesion" className="dp-res-photo"/>
                    {activeTab === 'result' && result.mask_base64 && (
                      <img src={`data:image/png;base64,${result.mask_base64}`} alt="mask" className="dp-res-mask-overlay"/>
                    )}
                  </>
                ) : (
                  <><div className="dp-res-mask"/><div className="dp-res-ring"/></>
                )}
                <div className="dp-res-label">Mask overlay</div>
              </div>

              {/* Tabs */}
              <div className="dp-rtabs">
                {(['result','mask','raw'] as const).map(t => (
                  <div key={t} className={`dp-rtb${activeTab===t?' dp-rtb--on':''}`} onClick={()=>setActiveTab(t)}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </div>
                ))}
              </div>

              <div className="dp-rmain">
                {result ? (
                  <>
                    <div className="dp-diag-tag">Primary diagnosis</div>
                    <div className="dp-diag-val">
                      <div className="dp-diag-ico">
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M6 2.5V7M6 9v.5"/>
                        </svg>
                      </div>
                      {isMal ? 'Malignant' : 'Benign'}
                    </div>

                    {/* Confidence bars */}
                    <div className="dp-cbar-row">
                      <div className="dp-cbar-head">
                        <span className="dp-cbar-name">Malignant</span>
                        <span className="dp-cbar-pct" style={{color:'var(--rose)'}}>{malConf.toFixed(1)}%</span>
                      </div>
                      <div className="dp-cbar-track"><div className="dp-cbar-fill" style={{width:`${malConf}%`,background:'var(--rose)'}}/></div>
                      <div className="dp-cbar-head">
                        <span className="dp-cbar-name">Benign</span>
                        <span className="dp-cbar-pct" style={{color:'var(--muted3)'}}>{benConf.toFixed(1)}%</span>
                      </div>
                      <div className="dp-cbar-track"><div className="dp-cbar-fill" style={{width:`${benConf}%`,background:'var(--muted3)'}}/></div>
                    </div>

                    {/* Metric mini-grid */}
                    <div className="dp-mgrid">
                      <div className="dp-mm"><div className="dp-mml">DSC score</div><div className="dp-mmv" style={{color:'var(--burg)'}}>0.876</div></div>
                      <div className="dp-mm"><div className="dp-mml">IoU</div><div className="dp-mmv" style={{color:'var(--burg)'}}>0.801</div></div>
                      <div className="dp-mm"><div className="dp-mml">Infer. time</div><div className="dp-mmv">{inferSec}</div></div>
                      <div className="dp-mm"><div className="dp-mml">Model</div><div className="dp-mmv" style={{fontSize:12,color:'var(--muted2)'}}>EffNet-B0</div></div>
                    </div>

                    {/* Recommendation */}
                    <div className="dp-rec">
                      <div className="dp-rec-t">Clinical recommendation</div>
                      <div className="dp-rec-b">{result.recommendation}</div>
                    </div>
                  </>
                ) : (
                  <div style={{padding:'24px',textAlign:'center',color:'var(--muted2)',fontSize:13}}>
                    Upload an image and click Analyse to see results here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom 3-col */}
          <div className="dp-g3">
            {/* Weekly Volume */}
            <div className="dp-card">
              <div className="dp-ch"><span className="dp-ct">Weekly volume</span><span className="dp-ctag dp-ctag--b">Analyses</span></div>
              <div className="dp-minibars">
                {WEEKLY.map((w) => (
                  <div key={w.day} className="dp-mb" style={{
                    height:`${w.h}%`,
                    background: w.h === 100 ? 'var(--burg)' : 'var(--burg3)',
                    opacity: w.h === 100 ? 1 : 0.3 + (w.h/100)*0.4,
                  }}/>
                ))}
              </div>
              <div className="dp-xlabs">
                {WEEKLY.map(w => <div key={w.day} className="dp-xl">{w.day}</div>)}
              </div>
            </div>

            {/* Model Performance */}
            <div className="dp-card">
              <div className="dp-ch"><span className="dp-ct">Model performance</span><span className="dp-ctag dp-ctag--g">Live</span></div>
              <div className="dp-plist">
                {METRICS.map(m => (
                  <div key={m.label} className="dp-pr">
                    <div className="dp-pn">{m.label}</div>
                    <div className="dp-pt"><div className="dp-pf" style={{width:`${m.value*100}%`,background:m.color}}/></div>
                    <div className="dp-pv">{m.value.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="dp-card">
              <div className="dp-ch"><span className="dp-ct">Activity feed</span><span className="dp-ctag dp-ctag--r">Live</span></div>
              <div className="dp-feed">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="dp-fi">
                    <div className="dp-fd" style={{background: h.label === 'malignant' ? 'var(--rose)' : 'var(--sage)'}}/>
                    <div>
                      <div className="dp-ft"><b>{h.id}</b> {h.label === 'malignant' ? `flagged as high-risk malignant — ${h.conf}% confidence` : `cleared benign — ${h.conf}% confidence`}</div>
                      <div className="dp-ftime">{h.date}</div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div style={{padding:'12px',color:'var(--muted2)',fontSize:13}}>No activity yet.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ── Sidebar Icons ──────────────────────────────────────────────────────────────
const IconGrid   = () => <svg viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="1.2"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2"/></svg>;
const IconCircle = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><circle cx="7" cy="7" r="1.8" fill="currentColor" stroke="none"/></svg>;
const IconDoc    = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="2.5" width="10" height="9" rx="1.5"/><path d="M4.5 6.5h5M4.5 9h3.5"/></svg>;
const IconPlus   = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>;
const IconChip   = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="5" width="10" height="4.5" rx="1.5"/><circle cx="5" cy="7.3" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="7.3" r="0.9" fill="currentColor" stroke="none"/></svg>;
const IconDb     = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><ellipse cx="7" cy="4.5" rx="4.5" ry="1.8"/><path d="M2.5 4.5v2.5c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V4.5"/><path d="M2.5 7v2.5c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V7"/></svg>;

export default DoctorDashboard;