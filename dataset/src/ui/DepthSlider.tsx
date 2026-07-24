import React from 'react'

interface Props {
  depth: number
  onChange: (val: number) => void
  disabled?: boolean
}

export default function DepthSlider({ depth, onChange, disabled }: Props) {
  return (
    <div className="tac-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          SEARCH DEPTH
        </span>
        <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#9ca653', fontWeight: 700 }}>
          {depth}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={6}
        value={depth}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#6b7c2e',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <div className="flex justify-between mt-1">
        {[1,2,3,4,5,6].map(v => (
          <span
            key={v}
            style={{
              fontSize: 8,
              fontFamily: 'monospace',
              color: v === depth ? '#9ca653' : '#3a4a3a',
            }}
          >
            {v}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#3a4a3a', fontFamily: 'monospace', marginTop: 4, textAlign: 'center' }}>
        {depth <= 2 ? 'FAST — Low precision' : depth <= 4 ? 'BALANCED' : 'DEEP — Slow but optimal'}
      </div>
    </div>
  )
}
