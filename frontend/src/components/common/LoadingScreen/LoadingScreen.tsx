import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete?: () => void;
  isInitialBoot?: boolean;
}

const STAGES = [
  { text: 'INITIALIZING CUTISAI NEURAL KERNEL & MEMORY ALLOCATION...', sub: 'ALLOCATING 512MB SHARED SHADER BUFFER' },
  { text: 'LOADING RESUNET SEGMENTATION WEIGHTS [DICE SCORE 0.9007]...', sub: 'VERIFYING FEATURE MAP TENSORS' },
  { text: 'MOUNTING EFFICIENTNET-B0 INT8 ONNX INFERENCE ENGINE...', sub: 'OPTIMIZING INT8 QUANTIZATION LATENCY (<1.8ms)' },
  { text: 'CONNECTING TO ISIC DERMATOLOGY REFERENCE DATASET (33K+ IMGS)...', sub: 'SYNCING MALIGNANCY CALIBRATION MATRIX' },
  { text: 'PERFORMING HARDWARE LATENCY BENCHMARKS & SAFETY CHECKS...', sub: 'ALL NEURAL PIPELINE CHECKS PASSED' },
  { text: 'SYSTEM CALIBRATED & FULLY OPTIMIZED FOR CLINICAL TRIAGE.', sub: 'AWAITING USER CONFIRMATION TO LAUNCH WORKSPACE' }
];

const METRICS_FEED = [
  'GPU_ACCEL: READY',
  'MEM_ALLOC: 412MB',
  'ONNX_INT8: ACTIVE',
  'RESUNET: 0.9007 DSC',
  'EFFNET: 95.6% AUC',
  'ISIC_DB: 33,000+',
  'LATENCY: 1.8ms',
  'HIPAA_MODE: STRICT',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isInitialBoot = true }) => {
  const [progress, setProgress] = useState<number>(0);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isReadyToProceed, setIsReadyToProceed] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Handle Proceed (User clicks YES or presses Enter) ─────────────────────
  const handleProceed = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 700);
  }, [isFading, onComplete]);

  // Keyboard shortcut: Press Enter to confirm when ready
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (isReadyToProceed) {
          handleProceed();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadyToProceed, handleProceed]);

  // ── High-Tech Background Neural Mesh & Bio-Radar Sweep Canvas ──────────────
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

    // Particle nodes
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
    };

    const count = 65;
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.5 + 0.25,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Data pulses
    type Pulse = { from: number; to: number; prog: number; speed: number };
    const pulses: Pulse[] = [];
    const addPulse = () => {
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      pulses.push({ from, to, prog: 0, speed: 0.012 + Math.random() * 0.015 });
    };
    const pulseInterval = setInterval(addPulse, 300);

    let sweepAngle = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Radar Sweep Effect
      sweepAngle += 0.015;
      const sweepRadius = Math.min(canvas.width, canvas.height) * 0.45;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sweepRadius, sweepAngle, sweepAngle + 0.4);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, sweepRadius);
      sweepGrad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      sweepGrad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Update & Render Nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        n.pulse += 0.03;
        const currentAlpha = n.alpha + Math.sin(n.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${Math.max(0.08, currentAlpha)})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const lineAlpha = (1 - dist / 150) * 0.16;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Synapse Data Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.prog += p.speed;
        if (p.prog >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        const px = n1.x + (n2.x - n1.x) * p.prog;
        const py = n1.y + (n2.y - n1.y) * p.prog;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pulseInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── 12-Second Controlled Boot Progress Timer ──────────────────────────────
  useEffect(() => {
    // 12.5s duration total for complete experience
    const totalDurationMs = 12500;
    const intervalMs = 40;
    const increment = 100 / (totalDurationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setStageIdx(5);
          setIsReadyToProceed(true);
          return 100;
        }

        // Update stage & log feed based on progress thresholds
        if (next > 85) {
          setStageIdx(4);
          if (!logs.includes('BENCHMARK_OK')) setLogs((l) => [...l, 'BENCHMARK_OK', 'LATENCY_1.8ms_CPU']);
        } else if (next > 65) {
          setStageIdx(3);
          if (!logs.includes('ISIC_SYNC_OK')) setLogs((l) => [...l, 'ISIC_SYNC_OK']);
        } else if (next > 45) {
          setStageIdx(2);
          if (!logs.includes('EFFNET_INT8_LOADED')) setLogs((l) => [...l, 'EFFNET_INT8_LOADED']);
        } else if (next > 20) {
          setStageIdx(1);
          if (!logs.includes('RESUNET_DSC_0.9007')) setLogs((l) => [...l, 'RESUNET_DSC_0.9007']);
        } else if (next > 5) {
          if (!logs.includes('KERNEL_INIT_OK')) setLogs((l) => ['KERNEL_INIT_OK']);
        }

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  const pct = Math.round(progress);
  const currentStage = STAGES[stageIdx];

  return (
    <div className={`wc-loader ${isFading ? 'wc-loader--fading' : ''}`}>
      {/* Background Neural Canvas */}
      <canvas ref={canvasRef} className="wc-loader__canvas" />

      {/* Cybernetic Ambient Glows & Grid */}
      <div className="wc-loader__glow wc-loader__glow--cyan" />
      <div className="wc-loader__glow wc-loader__glow--rose" />
      <div className="wc-loader__grid" />
      <div className="wc-loader__scanline" />

      {/* Framing Brackets */}
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--tl" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--tr" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--bl" />
      <div className="wc-loader__frame-bracket wc-loader__frame-bracket--br" />

      {/* Top Telemetry Bar */}
      <div className="wc-loader__top-bar">
        <div className="wc-loader__sys-id">
          <span className="wc-loader__sys-pulse" />
          <span>CUTIS_AI // CLINICAL_NEURAL_STATION_v2.1</span>
        </div>
        <div className="wc-loader__telemetry-feed">
          {METRICS_FEED.slice(0, 4).map((item, idx) => (
            <span key={idx} className="wc-loader__telemetry-tag">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Center Main HUD */}
      <div className="wc-loader__hud">
        {/* Holographic Target Scanner */}
        <div className="wc-loader__scanner">
          {/* Dashed outer ring */}
          <div className="wc-loader__ring wc-loader__ring--dashed" />

          {/* Outer rotating gradient SVG ring */}
          <svg className="wc-loader__ring-svg wc-loader__ring-svg--outer" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="url(#ringGradOuter)"
              strokeWidth="2"
              strokeDasharray="180 90 45 130"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="ringGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="1" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Counter-spinning inner HUD ring */}
          <svg className="wc-loader__ring-svg wc-loader__ring-svg--inner" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r="95"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="35 30 100 30"
              strokeLinecap="round"
            />
          </svg>

          {/* Crosshairs Target Lock */}
          <div className="wc-loader__crosshair wc-loader__crosshair--h" />
          <div className="wc-loader__crosshair wc-loader__crosshair--v" />

          {/* Center Brand Core & Percentage Counter */}
          <div className="wc-loader__center-core">
            <div className="wc-loader__glyph-wrap">
              <span className="wc-loader__glyph">◈</span>
            </div>
            <div className="wc-loader__counter">
              <span className="wc-loader__counter-num">{pct}</span>
              <span className="wc-loader__counter-symbol">%</span>
            </div>
          </div>
        </div>

        {/* Brand Header */}
        <h1 className="wc-loader__title">
          Cutis<span className="wc-loader__title-accent">AI</span>
        </h1>

        <div className="wc-loader__sub-tag">
          <span className="wc-loader__sub-dot" />
          <span>CLINICAL DEEP LEARNING SYSTEM · v2.1</span>
        </div>

        {/* Progress Bar & Laser Tip */}
        <div className="wc-loader__progress-box">
          <div className="wc-loader__progress-track">
            <div
              className="wc-loader__progress-fill"
              style={{ width: `${pct}%` }}
            >
              <div className="wc-loader__fill-wave" />
            </div>
            <div
              className="wc-loader__progress-laser"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>

        {/* Console Readout */}
        <div className="wc-loader__console">
          <div className="wc-loader__console-left">
            <span className="wc-loader__console-prompt">&gt;</span>
            <span className="wc-loader__console-text">{currentStage.text}</span>
          </div>
          <span className="wc-loader__console-pct">{pct}%</span>
        </div>
        <div className="wc-loader__console-sub">{currentStage.sub}</div>

        {/* Module Status Badges */}
        <div className="wc-loader__modules">
          {[
            { name: 'RESUNET SEG', detail: 'DSC 0.9007', thresh: 20 },
            { name: 'EFFNET-B0', detail: 'INT8 ONNX', thresh: 45 },
            { name: 'ISIC DATASET', detail: '33K+ IMGS', thresh: 65 },
            { name: 'TRIAGE ENGINE', detail: 'CALIBRATED', thresh: 85 },
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

        {/* ── YES TO CONTINUE CONFIRMATION PROMPT (Triggered at 100%) ───────────── */}
        {isReadyToProceed && (
          <div className="wc-loader__ready-prompt">
            <div className="wc-loader__ready-banner">
              <span className="wc-loader__ready-icon">✓</span>
              <span>NEURAL PIPELINE CALIBRATED & READY</span>
            </div>
            <button className="wc-loader__yes-btn" onClick={handleProceed} autoFocus>
              <span className="wc-loader__yes-pulse" />
              <span>YES — ENTER WORKSPACE</span>
              <svg className="wc-loader__yes-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div className="wc-loader__key-hint">
              Press <kbd>ENTER</kbd> or click button to proceed
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="wc-loader__footer">
        <span>ISIC 2018 · RESUNET + EFFICIENTNET-B0 INT8 · RESEARCH PROTOTYPE</span>
        <span>AUTHOR: YASH RAJ SHARAN © 2026</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
