// frontend/src/components/layout/DataTable/DataTable.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/DataTable/DataTable.tsx
// Used in: Doctor Dashboard Recent History card
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Badge from '../../common/Badges/Badge';
import './DataTable.css';

export interface HistoryRow {
  id: string;
  imageId: string;
  label: 'malignant' | 'benign';
  confidence: number;
  timestamp: string;
  inferenceMs: number;
}

interface DataTableProps {
  rows: HistoryRow[];
  onRowClick?: (row: HistoryRow) => void;
}

const DataTable: React.FC<DataTableProps> = ({ rows, onRowClick }) => (
  <div className="data-table-wrap" role="region" aria-label="Recent history">
    <table className="data-table">
      <thead>
        <tr>
          <th className="data-table__th mono">Image ID</th>
          <th className="data-table__th mono">Result</th>
          <th className="data-table__th mono">Confidence</th>
          <th className="data-table__th mono">Time</th>
          <th className="data-table__th mono">Infer.</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={`data-table__row${onRowClick ? ' data-table__row--clickable' : ''}`}
            onClick={() => onRowClick?.(row)}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
          >
            <td className="data-table__td mono data-table__td--id">{row.imageId}</td>
            <td className="data-table__td">
              <Badge variant={row.label} size="sm" uppercase>
                {row.label}
              </Badge>
            </td>
            <td className="data-table__td mono">{(row.confidence * 100).toFixed(1)}%</td>
            <td className="data-table__td mono">{row.timestamp}</td>
            <td className="data-table__td mono">{row.inferenceMs} ms</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
