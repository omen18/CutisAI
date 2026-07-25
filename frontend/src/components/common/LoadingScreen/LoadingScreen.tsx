import React, { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete?: () => void;
  isInitialBoot?: boolean;
}

const MESSAGES = [
  'INITIALIZING CUTISAI NEURAL ENGINE v2.1',
  'LOADING RESUNET SEGMENTATION WEIGHTS [DSC 0.9007]',
  'MOUNTING EFFICIENTNET-B0 INT8 ONNX INFERENCE ENGINE',
  'CALIBRATING CLINICAL TRIAGE & RISK ASSESSMENT PIPELINE',
  'SYSTEM READY — LAUNCHING CLINICAL WORKSPACE...',
];

const LOG_ITEMS = [
  { label: 'KERNEL', val: 'SYS_BOOT_OK' },
  { label: 'SEGMENTATION', val: 'RESUNET_FP16' },
  { label: 'CLASSIFIER', val: 'EFFNET_INT8' },
  { label: 'LATENCY', val: '<1.8ms CPU' },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isInitialBoot = false }) => {
  const [progress, setProgress] = useState<number>(0);
  const [msgIdx, setMsgIdx] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── High-Tech Neural Canvas Animation ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Neural nodes
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
    };

    const count = 55;
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Data pulse packets along connections
    type Packet = {
      from: number;
      to: number;
      progress: number;
      speed: number;
    };
    const packets: Packet[] = [];

    const createPacket = () => {
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      packets.push({ from, to, progress: 0, speed: 0.015 + Math.random() * 0.02 });
    };

    const packetInterval = setInterval(createPacket, 400);

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & render nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        n.pulse += 0.03;
        const currentAlpha = n.alpha + Math.sin(n.pulse) * 0.15;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${Math.max(0.05, currentAlpha)})`;
        ctx.fill();
      });

      // Render connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Render data packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(packetInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── Smooth Progress Timer ──────────────────────────────────────────────────
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
    <div className={`wc-loader ${isFading ? 'wc-loader--fading' : ''}`}>
      {/* Full-screen Neural Mesh Background Canvas */}
      <canvas ref={canvasRef} className="wc-loader__canvas" />

      {/* Cybernetic Radial Glows & Grid */}
      <div className="wc-loader__glow wc-loader__glow--cyan" />
      <div className="wc-loader__glow wc-loader__glow--rose" />
      <div className="wc-loader__grid" />
      <div className="wc-loader__scanline" />

      {/* Outer Telemetry Framing Brackets */}
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--tl" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--tr" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--bl" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--br" />

      {/* Header Telemetry Bar */}
      <div className="wc-loader__top-bar">
        <div className="wc-loader__sys-id">
          <span className="wc-loader__sys-pulse" />
          <span>CUTIS_AI // MEDICAL_NEURAL_NODE_01</span>
        </div>
        <div className="wc-loader__top-metrics">
          {LOG_ITEMS.map((item) => (
            <div key={item.label} className="wc-loader__top-metric">
              <span className="wc-loader__metric-label">{item.label}:</span>
              <span className="wc-loader__metric-val">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main HUD Container */}
      <div className="wc-loader__hud">
        {/* Holographic Target Reticle Scanner */}
        <div className="wc-loader__scanner">
          {/* Outer Dashed Compass Ring */}
          <div className="wc-loader__ring wc-loader__ring--dashed" />

          {/* Rotating Segmented Ring */}
          <svg className="wc-loader__ring-svg wc-loader__ring-svg--outer" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r="110"
              fill="none"
              stroke="url(#ringGradOuter)"
              strokeWidth="1.5"
              strokeDasharray="160 80 40 120"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ringGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Counter-Spinning Inner HUD Ring */}
          <svg className="wc-loader__ring-svg wc-loader__ring-svg--inner" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r="85"
              fill="none"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1.2"
              strokeDasharray="30 25 90 25"
              strokeLinecap="round"
            />
          </svg>

          {/* Target Reticle Crosshairs */}
          <div className="wc-loader__crosshair wc-loader__crosshair--h" />
          <div className="wc-loader__crosshair wc-loader__crosshair--v" />

          {/* Center Brand Badge & Percentage Readout */}
          <div className="wc-loader__center-core">
            <div className="wc-loader__glyph-wrap">
              <span className="wc-loader__glyph">◈</span>
            </div>
            {pct !== null && (
              <div className="wc-loader__counter">
                <span className="wc-loader__counter-num">{pct}</span>
                <span className="wc-loader__counter-symbol">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="wc-loader__title">
          Cutis<span className="wc-loader__title-accent">AI</span>
        </h1>

        <div className="wc-loader__sub-tag">
          <span className="wc-loader__sub-dot" />
          <span>v2.1 · CLINICAL DEEP LEARNING PLATFORM</span>
        </div>

        {/* Main Neon Progress Bar */}
        <div className="wc-loader__progress-box">
          <div className="wc-loader__progress-track">
            <div
              className="wc-loader__progress-fill"
              style={{ width: isInitialBoot ? `${Math.min(progress, 100)}%` : '100%' }}
            >
              <div className="wc-loader__fill-wave" />
            </div>
            <div
              className="wc-loader__progress-laser"
              style={{ left: isInitialBoot ? `${Math.min(progress, 100)}%` : '100%' }}
            />
          </div>
        </div>

        {/* Console Message Readout */}
        <div className="wc-loader__console">
          <div className="wc-loader__console-left">
            <span className="wc-loader__console-prompt">&gt;</span>
            <span className="wc-loader__console-text">
              {isInitialBoot ? MESSAGES[msgIdx] : 'INITIALIZING WORKSPACE...'}
            </span>
          </div>
          {pct !== null && <span className="wc-loader__console-pct">{pct}%</span>}
        </div>

        {/* Neural Pipeline Module Matrix */}
        {isInitialBoot && (
          <div className="wc-loader__modules">
            {[
              { name: 'RESUNET SEG', detail: 'DSC 0.9007', thresh: 25 },
              { name: 'EFFNET-B0', detail: 'INT8 ONNX', thresh: 50 },
              { name: 'ISIC PIPELINE', detail: '33K+ IMGS', thresh: 75 },
              { name: 'TRIAGE ENGINE', detail: 'ACTIVE', thresh: 90 },
            ].map((m) => {
              const active = progress >= m.thresh;
              return (
                <div
                  key={m.name}
                  className={`wc-loader__module ${active ? 'wc-loader__module--active' : ''}`}
                >
                  <div className="wc-loader__module-indicator">
                    <span className="wc-loader__module-dot" />
                  </div>
                  <div className="wc-loader__module-info">
                    <span className="wc-loader__module-name">{m.name}</span>
                    <span className="wc-loader__module-detail">{m.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Classification & Compliance Note */}
      <div className="wc-loader__footer">
        <span>RESEARCH PROTOTYPE · RESUNET + EFFICIENTNET-B0 · ISIC 2018</span>
        <span>YASH RAJ SHARAN © 2026</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
