// frontend/src/components/layout/Charts/ModelPerformance.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/Charts/ModelPerformance.tsx
// Used in: Doctor Dashboard bottom row (2nd card)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './ModelPerformance.css';

export interface MetricRow {
  label: string;
  value: number;   // 0–1
  target?: number; // 0–1, shows target line
}

interface ModelPerformanceProps {
  metrics: MetricRow[];
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ metrics }) => (
  <ul className="model-perf" aria-label="Model performance metrics">
    {metrics.map((m) => {
      const pct = m.value * 100;
      const meetsTarget = m.target == null || m.value >= m.target;
      return (
        <li key={m.label} className="model-perf__row">
          <div className="model-perf__header">
            <span className="model-perf__label mono">{m.label}</span>
            <span
              className="model-perf__value mono"
              style={{ color: meetsTarget ? 'var(--sage)' : 'var(--rose)' }}
            >
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="model-perf__track">
            <div
              className="model-perf__fill"
              style={{
                width: `${pct}%`,
                backgroundColor: meetsTarget ? 'var(--sage2)' : 'var(--rose)',
              }}
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            {m.target != null && (
              <div
                className="model-perf__target-line"
                style={{ left: `${m.target * 100}%` }}
                aria-label={`Target: ${(m.target * 100).toFixed(0)}%`}
              />
            )}
          </div>
        </li>
      );
    })}
  </ul>
);

export default ModelPerformance;
