// frontend/src/pages/Landing/Landing.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate   = useNavigate();
  const [visible, setVisible]   = useState(false);
  const [hovered, setHovered]   = useState<'user'|'doctor'|null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // ── DNA Helix particle canvas ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x:number; y:number; vx:number; vy:number; r:number; o:number; };
    const particles: Particle[] = Array.from({ length: 70 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r:  Math.random() * 1.8 + 0.4,
      o:  Math.random() * 0.3 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${p.o})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i+1).forEach(b => {
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(14,165,233,${0.08*(1-dist/120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    setTimeout(() => setVisible(true), 150);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="lp">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="lp-canvas"/>

      {/* Animated gradient orbs */}
      <div className="lp-orb lp-orb--1"/>
      <div className="lp-orb lp-orb--2"/>
      <div className="lp-orb lp-orb--3"/>

      {/* Grid overlay */}
      <div className="lp-grid-overlay"/>

      {/* Topbar */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <div className="lp-nav-logo">
            <span className="lp-nav-logo-icon">◈</span>
          </div>
          <span className="lp-nav-name">CutisAI</span>
          <span className="lp-nav-ver">v2.1</span>
        </div>
        <div className="lp-nav-links">
          <a href="#about" className="lp-nav-link">About</a>
          <a href="#how-it-works" className="lp-nav-link">How it works</a>
          <a href="#portals" className="lp-nav-link">Portals</a>
        </div>
        <div className="lp-nav-right">
          <div className="lp-status-dot"/>
          <span className="lp-status-text">System operational</span>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className={`lp-hero${visible ? ' lp-hero--visible' : ''}`}>

        <div className="lp-tag-row">
          <span className="lp-micro-tag">
            <span className="lp-micro-tag-dot"/>
            AI-Powered Dermatology
          </span>
          <span className="lp-divider">·</span>
          <span className="lp-micro-tag lp-micro-tag--muted">Research Grade</span>
        </div>

        <h1 className="lp-headline">
          <span className="lp-headline-serif">Early detection</span>
          <br/>
          <span className="lp-headline-gradient">saves lives.</span>
        </h1>

        <p className="lp-subheadline">
          Clinical-grade AI analysis of dermoscopic images.<br/>
          Segmentation, classification, and risk assessment — in under 2 seconds.
        </p>

        <div className="lp-metrics">
          {[
            { val: '0.9007', label: 'DSC Score',   sub: 'Segmentation',    icon: '◎' },
            { val: '95.6%',  label: 'AUC-ROC',     sub: 'Classification',  icon: '◆' },
            { val: '<2s',    label: 'Inference',    sub: 'CPU · INT8',      icon: '⚡' },
            { val: '33K+',   label: 'ISIC Images', sub: 'Training data',   icon: '◫' },
          ].map(m => (
            <div key={m.label} className="lp-metric">
              <div className="lp-metric-icon">{m.icon}</div>
              <div className="lp-metric-val">{m.val}</div>
              <div className="lp-metric-label">{m.label}</div>
              <div className="lp-metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="lp-hero-cta-row">
          <button className="lp-cta-primary" onClick={() => navigate('/home')}>
            <span>Start Analysis</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
          <button className="lp-cta-secondary" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <span>How it works</span>
          </button>
        </div>

        {/* Scroll hint */}
        <div className="lp-scroll-hint">
          <svg className="lp-scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="lp-hiw-section">
        <div className="lp-section-header">
          <span className="lp-section-tag">Pipeline</span>
          <h2 className="lp-section-title">How It Works</h2>
          <p className="lp-section-desc">Three-stage clinical AI pipeline powered by state-of-the-art deep learning</p>
        </div>

        <div className="lp-hiw-steps">
          {[
            {
              num: '01',
              title: 'Upload',
              desc: 'Submit a dermoscopic skin lesion image through our secure, HIPAA-compliant upload interface.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              ),
            },
            {
              num: '02',
              title: 'Segment & Classify',
              desc: 'ResUNet segments the lesion boundary. EfficientNet-B0 classifies the lesion type with 95.6% AUC-ROC.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              ),
            },
            {
              num: '03',
              title: 'Report',
              desc: 'Receive a detailed clinical report with segmentation mask, risk score, and actionable recommendations.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              ),
            },
          ].map((step) => (
            <div key={step.num} className="lp-hiw-step">
              <div className="lp-hiw-num">{step.num}</div>
              <div className="lp-hiw-icon">{step.icon}</div>
              <h3 className="lp-hiw-title">{step.title}</h3>
              <p className="lp-hiw-desc">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Connector lines */}
        <div className="lp-hiw-connectors">
          <div className="lp-hiw-connector"/>
          <div className="lp-hiw-connector"/>
        </div>
      </section>

      {/* ── PORTAL SECTION ───────────────────────────────────────────────────── */}
      <section id="portals" className="lp-portal-section">
        <div className="lp-section-header">
          <span className="lp-section-tag">Access</span>
          <h2 className="lp-section-title">Select Your Portal</h2>
          <p className="lp-section-desc">Choose the workspace that fits your role</p>
        </div>

        <div className="lp-cards">
          {/* User card */}
          <div
            className={`lp-card lp-card--user${hovered==='user' ? ' lp-card--hovered' : ''}`}
            onMouseEnter={() => setHovered('user')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/home')}
          >
            <div className="lp-card-glow lp-card-glow--user"/>
            <div className="lp-card-inner">
              <div className="lp-card-icon-wrap lp-card-icon-wrap--user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="lp-card-content">
                <div className="lp-card-eyebrow">For patients</div>
                <div className="lp-card-title">Patient Portal</div>
                <div className="lp-card-desc">Upload a dermoscopic image and receive a preliminary risk assessment with segmentation mask and clinical recommendation.</div>
              </div>
              <div className="lp-card-features">
                {['Image upload', 'Risk analysis', 'PDF report'].map(f => (
                  <span key={f} className="lp-card-feature">{f}</span>
                ))}
              </div>
              <button className="lp-card-btn lp-card-btn--user">
                <span>Enter Patient Portal</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Doctor card */}
          <div
            className={`lp-card lp-card--doctor${hovered==='doctor' ? ' lp-card--hovered' : ''}`}
            onMouseEnter={() => setHovered('doctor')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/doctor')}
          >
            <div className="lp-card-glow lp-card-glow--doctor"/>
            <div className="lp-card-inner">
              <div className="lp-card-icon-wrap lp-card-icon-wrap--doctor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="lp-card-content">
                <div className="lp-card-eyebrow">For clinicians</div>
                <div className="lp-card-title">Clinical Dashboard</div>
                <div className="lp-card-desc">Full clinical workspace with batch analysis, patient history, model performance metrics, and detailed segmentation results.</div>
              </div>
              <div className="lp-card-features">
                {['Analytics dashboard', 'Model metrics', 'Activity feed'].map(f => (
                  <span key={f} className="lp-card-feature lp-card-feature--doctor">{f}</span>
                ))}
              </div>
              <button className="lp-card-btn lp-card-btn--doctor">
                <span>Enter Clinical Dashboard</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="lp-disclaimer">
          This tool is for informational and research purposes only and is not a substitute
          for professional medical diagnosis or treatment.
        </p>
      </section>

      {/* Bottom strip */}
      <footer className="lp-footer">
        <span>© 2026 CutisAI · Yash Raj Sharan</span>
        <span>ResUNet + EfficientNet-B0 · ISIC 2018</span>
        <span>Research prototype · Not for clinical deployment</span>
      </footer>
    </div>
  );
};

export default Landing;