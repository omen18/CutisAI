import React from 'react'

interface Props {
  enabled: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}

export default function AlphaBetaToggle({ enabled, onChange, disabled }: Props) {
  return (
    <div className="tac-panel p-3 flex items-center justify-between">
      <div>
        <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          α-β PRUNING
        </div>
        <div style={{ fontSize: 9, color: enabled ? '#1e8449' : '#c0392b', fontFamily: 'monospace', marginTop: 2 }}>
          {enabled ? 'ENABLED — Faster search' : 'DISABLED — Full tree'}
        </div>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        style={{
          width: 44,
          height: 22,
          borderRadius: 11,
          background: enabled ? 'rgba(30,132,73,0.3)' : 'rgba(30,42,45,0.8)',
          border: `1px solid ${enabled ? '#1e8449' : '#1e2a2d'}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: enabled ? 22 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: enabled ? '#1e8449' : '#2a3b2e',
            transition: 'left 0.2s',
            boxShadow: enabled ? '0 0 6px #1e8449' : 'none',
          }}
        />
      </button>
    </div>
  )
}
