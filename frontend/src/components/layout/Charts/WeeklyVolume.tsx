// frontend/src/components/layout/Charts/WeeklyVolume.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/Charts/WeeklyVolume.tsx
// Used in: Doctor Dashboard bottom row (1st card)
// Pure CSS bar chart — no external chart library dependency.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './WeeklyVolume.css';

export interface DayData {
  day: string;   // e.g. 'Mon'
  count: number;
}

interface WeeklyVolumeProps {
  data: DayData[];
}

const WeeklyVolume: React.FC<WeeklyVolumeProps> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="weekly-volume" aria-label="Weekly analysis volume">
      <div className="weekly-volume__bars">
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.day} className="weekly-volume__col">
              <span className="weekly-volume__count mono">{d.count}</span>
              <div className="weekly-volume__bar-track">
                <div
                  className="weekly-volume__bar-fill"
                  style={{ height: `${pct}%` }}
                  role="img"
                  aria-label={`${d.day}: ${d.count} analyses`}
                />
              </div>
              <span className="weekly-volume__label mono">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyVolume;
