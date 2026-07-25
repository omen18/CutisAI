import React, { useState, useEffect, useCallback } from 'react';
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

  const handleProceed = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
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
    <div className={`clean-loader ${isFading ? 'clean-loader--fading' : ''}`}>
      {/* Brand Header */}
      <div className="clean-loader__header">
        <div className="clean-loader__brand">
          <div className="clean-loader__logo-ring">
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#0EA5E9" strokeWidth="1.2" />
              <circle cx="8" cy="8" r="2.5" fill="#38BDF8" />
              <path
                d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14"
                stroke="#0EA5E9"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="clean-loader__brand-name">CutisAI</span>
        </div>
      </div>

      {/* Main Central Container */}
      <div className="clean-loader__center">
        {/* Animated Ring Spinner */}
        <div className="clean-loader__spinner-wrap">
          <div className="clean-loader__spinner-ring" />
          <div className="clean-loader__spinner-inner" />
          <div className="clean-loader__logo-icon">◈</div>
        </div>

        {/* Loading Title & Progress Readout */}
        <h2 className="clean-loader__title">
          LOADING<span className="clean-loader__dots">..</span>
        </h2>
        <div className="clean-loader__pct">{pct}%</div>
        <div className="clean-loader__stage">{STAGES[stageIdx]}</div>

        {/* Progress Bar Track */}
        <div className="clean-loader__bar-wrap">
          <div className="clean-loader__bar-track">
            <div className="clean-loader__bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Interactive YES Confirmation Prompt when 100% reached */}
        {isReadyToProceed ? (
          <div className="clean-loader__prompt">
            <button className="clean-loader__yes-btn" onClick={handleProceed} autoFocus>
              <span>YES — ENTER WORKSPACE</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <div className="clean-loader__hint">
              Press <kbd>ENTER</kbd> or click button to proceed
            </div>
          </div>
        ) : (
          <div className="clean-loader__sub">
            v2.1 · Clinical AI Skin Lesion Screening System
          </div>
        )}
      </div>

      {/* Clean Footer */}
      <div className="clean-loader__footer">
        <span>ResUNet + EfficientNet-B0 · ISIC 2018</span>
        <span>Copyright © 2026 Yash Raj Sharan</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
