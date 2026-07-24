// frontend/src/components/layout/ResultPanel/ResultPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/ResultPanel/ResultPanel.tsx
// Used in: Doctor Dashboard (right column) + User Result page
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Badge from '../../common/Badges/Badge';
import './ResultPanel.css';

export interface AnalysisResult {
  label: 'malignant' | 'benign';
  confidence: number;           // 0–1, e.g. 0.87
  confidenceBenign: number;     // 0–1
  maskBase64: string | null;    // base64 PNG mask or null
  originalImageUrl: string | null;
  dsc: number;                  // e.g. 0.91
  iou: number;
  inferenceTimeMs: number;
  modelName: string;
  recommendation: string;
}

interface ResultPanelProps {
  result: AnalysisResult | null;
  loading?: boolean;
}

type ViewTab = 'result' | 'mask' | 'raw';

const IconAlertCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ResultPanel: React.FC<ResultPanelProps> = ({ result, loading = false }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('result');

  if (loading) {
    return (
      <div className="result-panel result-panel--loading">
        <div className="result-panel__spinner-wrap">
          <div className="result-panel__spinner" aria-label="Analysing…" />
          <p className="result-panel__loading-text mono">Running inference…</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-panel result-panel--empty">
        <div className="result-panel__empty-icon" aria-hidden="true">◈</div>
        <p className="result-panel__empty-title serif">No analysis yet</p>
        <p className="result-panel__empty-sub">Upload an image and click Analyse to see results here.</p>
      </div>
    );
  }

  const isMalignant = result.label === 'malignant';
  const badgeVariant = isMalignant ? 'malignant' : 'benign';
  const accentColor = isMalignant ? 'var(--rose)' : 'var(--sage)';

  const getImageSrc = () => {
    if (activeTab === 'mask' && result.maskBase64) return `data:image/png;base64,${result.maskBase64}`;
    if (activeTab === 'raw' && result.originalImageUrl) return result.originalImageUrl;
    return result.originalImageUrl ?? '';
  };

  return (
    <div className="result-panel">
      {/* Image area */}
      <div className="result-panel__image-area">
        {result.originalImageUrl ? (
          <div className="result-panel__img-wrap">
            <img
              src={getImageSrc()}
              alt={`Lesion — ${activeTab} view`}
              className="result-panel__img"
            />
            {activeTab === 'result' && result.maskBase64 && (
              <img
                src={`data:image/png;base64,${result.maskBase64}`}
                alt="Segmentation mask overlay"
                className="result-panel__mask-overlay"
              />
            )}
            {/* Segmentation ring */}
            <div
              className="result-panel__ring"
              style={{ borderColor: accentColor }}
              aria-hidden="true"
            />
            {/* Label chip */}
            <div className="result-panel__img-label">
              <Badge variant={badgeVariant} size="sm" uppercase>
                {isMalignant ? '⚠ Malignant' : '✓ Benign'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="result-panel__img-placeholder">
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted3)' }}>No image</span>
          </div>
        )}

        {/* View tabs */}
        <div className="result-panel__tabs" role="tablist">
          {(['result', 'mask', 'raw'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`result-panel__tab mono${activeTab === tab ? ' result-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnosis */}
      <div className="result-panel__diagnosis">
        <div className="result-panel__diagnosis-left">
          <p className="result-panel__diagnosis-label uppercase mono">Diagnosis</p>
          <p
            className="result-panel__diagnosis-value serif"
            style={{ color: accentColor }}
          >
            {isMalignant ? 'Malignant lesion' : 'Benign lesion'}
          </p>
        </div>
        <div
          className="result-panel__diagnosis-icon"
          style={{ color: accentColor }}
          aria-hidden="true"
        >
          {isMalignant ? <IconAlertCircle /> : <IconCheckCircle />}
        </div>
      </div>

      {/* Confidence bars */}
      <div className="result-panel__confidence">
        <ConfidenceBar
          label="Malignant"
          value={isMalignant ? result.confidence : result.confidenceBenign}
          color="var(--rose)"
        />
        <ConfidenceBar
          label="Benign"
          value={isMalignant ? result.confidenceBenign : result.confidence}
          color="var(--sage)"
        />
      </div>

      {/* 2×2 metric mini-grid — dsc/iou not returned by inference, show infer time + model */}
      <div className="result-panel__metrics">
        <MetricCell label="Confidence" value={`${(result.confidence * 100).toFixed(1)}%`} />
        <MetricCell label="Infer. time" value={`${result.inferenceTimeMs} ms`} />
        <MetricCell label="Model" value={result.modelName} small />
        <MetricCell label="Device" value="CPU · INT8" small />
      </div>

      {/* Recommendation box */}
      <div className="result-panel__recommend" style={{ borderColor: accentColor }}>
        <p className="result-panel__recommend-title uppercase mono">Recommended action</p>
        <p className="result-panel__recommend-body">{result.recommendation}</p>
      </div>
    </div>
  );
};

/* Sub-components */

const ConfidenceBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="conf-bar">
    <div className="conf-bar__header">
      <span className="conf-bar__label mono">{label}</span>
      <span className="conf-bar__pct mono">{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="conf-bar__track">
      <div
        className="conf-bar__fill"
        style={{ width: `${value * 100}%`, backgroundColor: color }}
        role="progressbar"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  </div>
);

const MetricCell: React.FC<{ label: string; value: string; small?: boolean }> = ({ label, value, small }) => (
  <div className="metric-cell">
    <p className="metric-cell__label uppercase mono">{label}</p>
    <p className={`metric-cell__value mono${small ? ' metric-cell__value--small' : ''}`}>{value}</p>
  </div>
);

export default ResultPanel;
