import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete?: () => void;
  isInitialBoot?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isInitialBoot = true }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isReadyToProceed, setIsReadyToProceed] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleProceed = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  }, [isFading, onComplete]);

  // Keyboard shortcut: Press Enter or Space to proceed when ready
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isReadyToProceed) {
        handleProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadyToProceed, handleProceed]);

  // ── 5-Second Boot Progress Timer ───────────────────────────────────────────
  useEffect(() => {
    const totalDurationMs = 5000;
    const intervalMs = 40;
    const increment = 100 / (totalDurationMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsReadyToProceed(true);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  // ── Starry Night & Moon Atmosphere Canvas Animation ───────────────────────
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

    // Stars generator
    type Star = { x: number; y: number; r: number; alpha: number; speed: number };
    const stars: Star[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.7,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Twinkling Stars
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 0.9 || s.alpha < 0.2) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const pct = Math.round(progress);

  return (
    <div className={`exact-loader ${isFading ? 'exact-loader--fading' : ''}`}>
      {/* Starry Canvas Background */}
      <canvas ref={canvasRef} className="exact-loader__stars-canvas" />

      {/* Top Header: LOADING.. */}
      <div className="exact-loader__top">
        <h1 className="exact-loader__title">
          LOADING<span className="exact-loader__dots">..</span>
        </h1>
      </div>

      {/* Center Sphere Area (Moon/Globe with Atmospheric Glow) */}
      <div className="exact-loader__center">
        <div className="exact-loader__sphere-glow" />
        <div className="exact-loader__sphere">
          {/* Moon Surface Craters / Continent Patterns */}
          <div className="exact-loader__crater exact-loader__crater--1" />
          <div className="exact-loader__crater exact-loader__crater--2" />
          <div className="exact-loader__crater exact-loader__crater--3" />
          <div className="exact-loader__crater exact-loader__crater--4" />
          <div className="exact-loader__sphere-shading" />
        </div>

        {/* Percentage Counter Below Sphere */}
        <div className="exact-loader__pct">{pct}%</div>

        {/* Interactive YES Confirmation Prompt when 100% reached */}
        {isReadyToProceed && (
          <div className="exact-loader__prompt">
            <button className="exact-loader__yes-btn" onClick={handleProceed} autoFocus>
              <span>YES — ENTER WORKSPACE</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div className="exact-loader__hint">
              Press <kbd>ENTER</kbd> or click button to proceed
            </div>
          </div>
        )}
      </div>

      {/* Bottom Village & Rolling Hills Landscape (Exact SVG Matching Screenshot) */}
      <div className="exact-loader__village">
        <svg viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
          {/* Background Dark Blue Rolling Hills */}
          <path
            d="M0 160 Q 360 90 720 140 T 1440 120 V 320 H 0 Z"
            fill="#09142B"
          />
          {/* Middle Hill Layer */}
          <path
            d="M0 200 Q 420 140 840 180 T 1440 150 V 320 H 0 Z"
            fill="#0A1835"
          />
          {/* Foreground Dark Hill Base */}
          <path
            d="M0 230 Q 380 180 760 210 T 1440 190 V 320 H 0 Z"
            fill="#060E21"
          />

          {/* Left House Cluster */}
          <g transform="translate(80, 190)">
            {/* House 1 */}
            <path d="M 10 70 L 60 20 L 110 70 V 120 H 10 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
            <path d="M 5 70 L 60 15 L 115 70" stroke="#881337" strokeWidth="6" strokeLinecap="round" />
            <polygon points="60,35 40,60 80,60" fill="#38BDF8" opacity="0.85" />
            {/* House 2 Behind */}
            <path d="M 100 80 L 140 40 L 180 80 V 120 H 100 Z" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2" />
            <path d="M 95 80 L 140 35 L 185 80" stroke="#9F1239" strokeWidth="5" strokeLinecap="round" />
          </g>

          {/* Center-Left Small Houses */}
          <g transform="translate(500, 215)">
            <path d="M 10 50 L 45 15 L 80 50 V 90 H 10 Z" fill="#94A3B8" stroke="#0F172A" strokeWidth="2" />
            <path d="M 5 50 L 45 10 L 85 50" stroke="#881337" strokeWidth="5" strokeLinecap="round" />
            <path d="M 75 60 L 105 30 L 135 60 V 90 H 75 Z" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2" />
            <path d="M 70 60 L 105 25 L 140 60" stroke="#9F1239" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Right Main Village Houses */}
          <g transform="translate(980, 150)">
            {/* Big Right House */}
            <path d="M 80 100 L 160 20 L 240 100 V 170 H 80 Z" fill="#F1F5F9" stroke="#0F172A" strokeWidth="3" />
            <path d="M 70 100 L 160 10 L 250 100" stroke="#9F1239" strokeWidth="9" strokeLinecap="round" />
            {/* Triangular Window Gable */}
            <polygon points="160,45 125,85 195,85" fill="#38BDF8" opacity="0.9" stroke="#0F172A" strokeWidth="2" />
            <rect x="100" y="115" width="30" height="35" fill="#38BDF8" opacity="0.85" rx="3" />
            <rect x="190" y="115" width="30" height="35" fill="#F59E0B" opacity="0.85" rx="3" />

            {/* Adjacent Left House */}
            <path d="M 0 115 L 50 70 L 100 115 V 170 H 0 Z" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2" />
            <path d="M -5 115 L 50 65 L 105 115" stroke="#BE123C" strokeWidth="6" strokeLinecap="round" />
            <rect x="35" y="125" width="25" height="30" fill="#F59E0B" opacity="0.85" rx="2" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LoadingScreen;
