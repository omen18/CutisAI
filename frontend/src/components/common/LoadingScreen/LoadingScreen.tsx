import React, { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete?: () => void;
  isInitialBoot?: boolean;
}

const MESSAGES = [
  'Initializing CutisAI Neural Engine...',
  'Loading ResUNet Segmentation Model (v2.1)...',
  'Loading EfficientNet-B0 Classifier (INT8 ONNX)...',
  'Calibrating Clinical Diagnostic Pipeline...',
  'System Ready — Launching Workspace...',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isInitialBoot = false }) => {
  const [progress, setProgress] = useState<number>(0);
  const [msgIdx, setMsgIdx] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Particle ring canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 260;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    type Dot = { angle: number; radius: number; speed: number; size: number; opacity: number; drift: number; };
    const dots: Dot[] = Array.from({ length: 40 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 40 + Math.random() * 0.3,
      radius: 80 + Math.random() * 20,
      speed: 0.003 + Math.random() * 0.004,
      size: Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      drift: Math.random() * 0.5 - 0.25,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Outer ring glow
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner ring glow
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      dots.forEach(d => {
        d.angle += d.speed;
        const x = cx + Math.cos(d.angle) * (d.radius + Math.sin(d.angle * 2) * d.drift * 8);
        const y = cy + Math.sin(d.angle) * (d.radius + Math.cos(d.angle * 3) * d.drift * 8);
        ctx.beginPath();
        ctx.arc(x, y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${d.opacity})`;
        ctx.fill();
      });

      // Draw connections between nearby dots
      dots.forEach((a, i) => {
        const ax = cx + Math.cos(a.angle) * a.radius;
        const ay = cy + Math.sin(a.angle) * a.radius;
        dots.slice(i + 1).forEach(b => {
          const bx = cx + Math.cos(b.angle) * b.radius;
          const by = cy + Math.sin(b.angle) * b.radius;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist < 50) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.12 * (1 - dist / 50)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Progress timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialBoot) return;

    const duration = 2400;
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 300);
          return 100;
        }

        if (next > 85) setMsgIdx(4);
        else if (next > 65) setMsgIdx(3);
        else if (next > 40) setMsgIdx(2);
        else if (next > 15) setMsgIdx(1);

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInitialBoot, onComplete]);

  const pct = isInitialBoot ? Math.round(progress) : null;

  return (
    <div className={`cl ${isFading ? 'cl--fading' : ''}`}>
      {/* Ambient background effects */}
      <div className="cl-orb cl-orb--1" />
      <div className="cl-orb cl-orb--2" />
      <div className="cl-grid" />

      {/* Scan lines */}
      <div className="cl-scanline" />

      {/* Main content */}
      <div className="cl-content">

        {/* Animated particle ring canvas + center logo */}
        <div className="cl-ring-wrap">
          <canvas ref={canvasRef} className="cl-ring-canvas" />

          {/* Spinning outer arc */}
          <svg className="cl-arc cl-arc--outer" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="92" fill="none" stroke="url(#arcGrad)" strokeWidth="1.5"
              strokeDasharray="120 460" strokeLinecap="round" />
            <defs>
              <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Counter-spinning inner arc */}
          <svg className="cl-arc cl-arc--inner" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="1"
              strokeDasharray="40 420" strokeLinecap="round" />
          </svg>

          {/* Center icon */}
          <div className="cl-center-icon">
            <span className="cl-icon-glyph">◈</span>
            {pct !== null && (
              <span className="cl-icon-pct">{pct}%</span>
            )}
          </div>
        </div>

        {/* Brand */}
        <h1 className="cl-brand">CutisAI</h1>
        <div className="cl-badge">
          <span className="cl-badge-dot" />
          <span>v2.1 · Clinical Neural Engine</span>
        </div>

        {/* Progress bar */}
        <div className="cl-progress-wrap">
          <div className="cl-progress-track">
            <div
              className="cl-progress-fill"
              style={{ width: isInitialBoot ? `${Math.min(progress, 100)}%` : '100%' }}
            />
            <div
              className="cl-progress-glow"
              style={{ left: isInitialBoot ? `${Math.min(progress, 100)}%` : '100%' }}
            />
          </div>
        </div>

        {/* Status readout */}
        <div className="cl-status-row">
          <span className="cl-status-msg">
            {isInitialBoot ? MESSAGES[msgIdx] : 'Loading workspace resources...'}
          </span>
          {pct !== null && (
            <span className="cl-status-pct">{pct}%</span>
          )}
        </div>

        {/* Module status indicators */}
        {isInitialBoot && (
          <div className="cl-modules">
            {[
              { name: 'RESUNET', thresh: 25 },
              { name: 'EFFNET-B0', thresh: 50 },
              { name: 'PIPELINE', thresh: 75 },
              { name: 'WORKSPACE', thresh: 90 },
            ].map(m => (
              <div key={m.name} className={`cl-module ${progress >= m.thresh ? 'cl-module--on' : ''}`}>
                <span className="cl-module-dot" />
                <span className="cl-module-name">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="cl-tagline">
          Deep Learning Skin Lesion Analysis Platform
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
