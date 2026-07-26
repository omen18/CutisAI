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

      {/* Top Header: CUTIS AI SVG Logo & LOADING.. */}
      <div className="exact-loader__top">
        <div className="exact-loader__brand-svg-container">
          <svg className="exact-loader__brand-svg" viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cutisAiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#7DD3FC" />
              </linearGradient>
              <linearGradient id="whiteTextGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <filter id="cyanGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Emblem: Shield & AI Neural Core */}
            <g transform="translate(6, 4)">
              <path
                d="M 21 3 L 39 21 L 21 39 L 3 21 Z"
                fill="rgba(14, 165, 233, 0.15)"
                stroke="url(#cutisAiGradient)"
                strokeWidth="3"
                strokeLinejoin="round"
                filter="url(#cyanGlowFilter)"
              />
              <circle cx="21" cy="21" r="4.5" fill="#38BDF8" />
              <path d="M 21 8 V 16.5 M 21 25.5 V 34 M 8 21 H 16.5 M 25.5 21 H 34" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            </g>

            {/* Vector Text: CUTIS */}
            <text
              x="56"
              y="30"
              fill="url(#whiteTextGradient)"
              fontFamily="'Fredoka', 'Geist', sans-serif"
              fontSize="24"
              fontWeight="700"
              letterSpacing="2.5"
            >
              CUTIS
            </text>

            {/* Vector Text: AI */}
            <text
              x="154"
              y="30"
              fill="url(#cutisAiGradient)"
              fontFamily="'Fredoka', 'Geist', sans-serif"
              fontSize="24"
              fontWeight="800"
              letterSpacing="2.5"
              filter="url(#cyanGlowFilter)"
            >
              AI
            </text>
          </svg>
        </div>
        <h1 className="exact-loader__title">
          LOADING<span className="exact-loader__dots">..</span>
        </h1>
      </div>

      {/* Center Sphere Area (3D Rotating Earth Globe with Atmospheric Halo) */}
      <div className="exact-loader__center">
        <div className="exact-loader__sphere-glow exact-loader__sphere-glow--earth" />
        
        <div className="exact-loader__sphere exact-loader__sphere--earth">
          {/* Seamless Rotating Earth Map (Continents & Ocean Swirls) */}
          <div className="exact-loader__earth-map">
            <svg viewBox="0 0 800 400" className="exact-loader__earth-svg">
              <defs>
                <linearGradient id="earthLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>

              {/* Earth Continents (Set 1 & Set 2 for seamless infinite loop) */}
              <g fill="url(#earthLandGradient)" stroke="#059669" strokeWidth="1">
                {/* Set 1: Americas, Europe, Africa, Asia, Australia */}
                <path d="M 50,70 Q 80,50 120,60 Q 150,80 135,130 Q 110,150 85,130 Q 60,100 50,70 Z" />
                <path d="M 115,140 Q 145,140 165,180 Q 155,250 125,270 Q 95,230 105,180 Z" />
                <path d="M 220,50 Q 270,40 300,60 Q 290,100 250,100 Q 220,80 220,50 Z" />
                <path d="M 230,110 Q 300,100 320,160 Q 300,240 250,250 Q 210,210 230,110 Z" />
                <path d="M 320,50 Q 410,30 450,80 Q 440,150 370,150 Q 320,110 320,50 Z" />
                <path d="M 390,180 Q 440,170 450,210 Q 420,250 380,230 Z" />

                {/* Set 2: Repeat (+400px X Offset for seamless scrolling) */}
                <path d="M 450,70 Q 480,50 520,60 Q 550,80 535,130 Q 510,150 485,130 Q 460,100 450,70 Z" />
                <path d="M 515,140 Q 545,140 565,180 Q 555,250 525,270 Q 495,230 505,180 Z" />
                <path d="M 620,50 Q 670,40 700,60 Q 690,100 650,100 Q 620,80 620,50 Z" />
                <path d="M 630,110 Q 700,100 720,160 Q 700,240 650,250 Q 610,210 630,110 Z" />
                <path d="M 720,50 Q 810,30 850,80 Q 840,150 770,150 Q 720,110 720,50 Z" />
                <path d="M 790,180 Q 840,170 850,210 Q 820,250 780,230 Z" />
              </g>

              {/* Cloud Layer Swirls */}
              <g fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="9" strokeLinecap="round">
                <path d="M 30,90 Q 110,70 190,100" />
                <path d="M 210,190 Q 280,220 370,200" />
                <path d="M 430,90 Q 510,70 590,100" />
                <path d="M 610,190 Q 680,220 770,200" />
              </g>
            </svg>
          </div>

          {/* 3D Inner Edge Atmosphere & Spherical Shadow Overlay */}
          <div className="exact-loader__earth-atmosphere" />
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
