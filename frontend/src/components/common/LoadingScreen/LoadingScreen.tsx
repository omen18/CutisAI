import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete?: () => void;
  isInitialBoot?: boolean;
}

const STAGES = [
  'INITIALIZING CUTISAI NEURAL ENGINE...',
  'LOADING RESUNET SEGMENTATION MODEL (v2.1)...',
  'LOADING EFFICIENTNET-B0 INT8 ONNX CLASSIFIER...',
  'CONNECTING TO ISIC DERMATOLOGY DATASET...',
  'CALIBRATING CLINICAL TRIAGE PIPELINE...',
  'SYSTEM READY — AWAITING USER CONFIRMATION.',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isInitialBoot = true }) => {
  const [progress, setProgress] = useState<number>(0);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isReadyToProceed, setIsReadyToProceed] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleProceed = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 700);
  }, [isFading, onComplete]);

  // Keyboard shortcut: Press Enter to proceed when ready
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isReadyToProceed) {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadyToProceed, handleProceed]);

  // ── 3D Rotating Celestial Sphere & Starry Night Canvas ─────────────────────
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

    // Stars
    type Star = { x: number; y: number; r: number; alpha: number; speed: number };
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.75,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
    }));

    // Sphere latitude & longitude grid lines for 3D rotation effect
    let rotationY = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 40;
      const sphereR = Math.min(w, h) * 0.22;

      // 1. Render Starry Sky
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha)})`;
        ctx.fill();
      });

      // 2. Render Outer Atmosphere Aura Glow around Globe
      const auraGrad = ctx.createRadialGradient(cx, cy, sphereR * 0.8, cx, cy, sphereR * 1.45);
      auraGrad.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
      auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, sphereR * 1.45, 0, Math.PI * 2);
      ctx.fillStyle = auraGrad;
      ctx.fill();

      // 3. Render 3D Base Globe Gradient
      const sphereGrad = ctx.createRadialGradient(
        cx - sphereR * 0.35,
        cy - sphereR * 0.35,
        sphereR * 0.1,
        cx,
        cy,
        sphereR
      );
      sphereGrad.addColorStop(0, '#38BDF8');
      sphereGrad.addColorStop(0.45, '#0284C7');
      sphereGrad.addColorStop(0.85, '#075985');
      sphereGrad.addColorStop(1, '#031E38');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = '#0EA5E9';
      ctx.shadowBlur = 35;
      ctx.fill();
      ctx.clip(); // Clip pattern within sphere bounds

      // 4. Render Rotating Continents / Lesion Topography Lines
      rotationY += 0.008;

      // Draw latitude / longitude 3D wireframe mesh on sphere
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      // Latitudes
      for (let lat = -60; lat <= 60; lat += 20) {
        const rLat = (lat * Math.PI) / 180;
        const yLat = cy + sphereR * Math.sin(rLat);
        const rxLat = sphereR * Math.cos(rLat);

        ctx.beginPath();
        ctx.ellipse(cx, yLat, rxLat, rxLat * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudes (Rotating)
      for (let lon = 0; lon < 360; lon += 30) {
        const rad = ((lon + rotationY * 180) * Math.PI) / 180;
        const xOffset = Math.sin(rad) * sphereR;
        const isVisible = Math.cos(rad) > -0.2;

        if (isVisible) {
          ctx.beginPath();
          ctx.ellipse(cx + xOffset * 0.5, cy, Math.abs(xOffset) * 0.5, sphereR, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(224, 242, 254, ${0.1 + Math.cos(rad) * 0.15})`;
          ctx.stroke();
        }
      }

      // Shading overlay to give deep 3D curve depth
      const shadowGrad = ctx.createRadialGradient(
        cx + sphereR * 0.4,
        cy + sphereR * 0.4,
        sphereR * 0.2,
        cx,
        cy,
        sphereR
      );
      shadowGrad.addColorStop(0, 'rgba(3, 7, 18, 0.7)');
      shadowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shadowGrad;
      ctx.fill();

      ctx.restore(); // Unclip

      // 5. Render Outer Glowing Ring Orbit
      ctx.beginPath();
      ctx.ellipse(cx, cy, sphereR * 1.25, sphereR * 0.45, -0.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── 12-Second Boot Progress Timer ──────────────────────────────────────────
  useEffect(() => {
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

        if (next > 85) setStageIdx(4);
        else if (next > 65) setStageIdx(3);
        else if (next > 45) setStageIdx(2);
        else if (next > 20) setStageIdx(1);

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  const pct = Math.round(progress);

  return (
    <div className={`celestial-loader ${isFading ? 'celestial-loader--fading' : ''}`}>
      {/* Starry Night Sky & 3D Globe Canvas */}
      <canvas ref={canvasRef} className="celestial-loader__canvas" />

      {/* Subtle Bottom Horizon Landscape Silhouette */}
      <div className="celestial-loader__landscape">
        <svg viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
          {/* Back Hills */}
          <path
            d="M0 180 Q360 120 720 160 T1440 140 V280 H0 Z"
            fill="#091328"
            opacity="0.8"
          />
          {/* Front Hills */}
          <path
            d="M0 210 Q400 160 800 200 T1440 170 V280 H0 Z"
            fill="#050C1C"
          />
          {/* Houses / Village Silhouettes */}
          <g fill="#08162E" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1">
            {/* House 1 */}
            <path d="M 120 220 L 150 185 L 180 220 Z M 130 220 V 250 H 170 V 220 Z" />
            <rect x="145" y="228" width="10" height="12" fill="#F59E0B" opacity="0.85" />
            {/* House 2 */}
            <path d="M 1180 210 L 1220 170 L 1260 210 Z M 1190 210 V 255 H 1250 V 210 Z" />
            <rect x="1210" y="220" width="14" height="14" fill="#38BDF8" opacity="0.75" />
            {/* House 3 */}
            <path d="M 1280 225 L 1315 190 L 1350 225 Z M 1290 225 V 260 H 1340 V 225 Z" />
            <rect x="1308" y="234" width="10" height="10" fill="#F59E0B" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Top Floating Text Header: "LOADING.." */}
      <div className="celestial-loader__top">
        <h2 className="celestial-loader__loading-text">
          LOADING<span className="celestial-loader__dots">..</span>
        </h2>
        <div className="celestial-loader__stage-subtitle">{STAGES[stageIdx]}</div>
      </div>

      {/* Middle Center Percentage Readout (Placed Under Globe) */}
      <div className="celestial-loader__middle">
        <div className="celestial-loader__pct-display">{pct}%</div>
      </div>

      {/* Bottom Interactive Area & Confirmation Prompt */}
      <div className="celestial-loader__bottom">
        {/* Progress Line Bar */}
        <div className="celestial-loader__bar-wrap">
          <div className="celestial-loader__bar-track">
            <div className="celestial-loader__bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Interactive YES Confirmation Prompt when 100% reached */}
        {isReadyToProceed ? (
          <div className="celestial-loader__prompt">
            <div className="celestial-loader__prompt-badge">
              ✓ NEURAL PIPELINE CALIBRATED & READY
            </div>
            <button className="celestial-loader__yes-btn" onClick={handleProceed} autoFocus>
              <span>YES — ENTER WORKSPACE</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div className="celestial-loader__hint">
              Press <kbd>ENTER</kbd> or click button to proceed
            </div>
          </div>
        ) : (
          <div className="celestial-loader__brand-tag">
            CutisAI v2.1 · Deep Learning Dermatology Platform
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
