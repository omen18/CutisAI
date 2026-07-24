import React from 'react'
import { GameMode } from '../core/types'

interface Props {
  mode: GameMode
  onChange: (mode: GameMode) => void
  disabled?: boolean
}

const MODES: { value: GameMode; label: string; desc: string }[] = [
  { value: 'AI_VS_AI', label: 'AI vs AI', desc: 'Watch the AIs battle' },
  { value: 'HUMAN_VS_AI', label: 'Human vs AI', desc: 'Command BLUE forces' },
]

export default function ModeSelector({ mode, onChange, disabled }: Props) {
  return (
    <div className="tac-panel p-3">
      <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>
        BATTLE MODE
      </div>
      <div className="flex gap-2">
        {MODES.map(m => (
          <button
            key={m.value}
            disabled={disabled}
            onClick={() => onChange(m.value)}
            className="btn-tac flex-1"
            style={{
              borderColor: mode === m.value ? '#6b7c2e' : '#1e2a2d',
              background: mode === m.value ? 'rgba(107,124,46,0.15)' : 'transparent',
              color: mode === m.value ? '#9ca653' : '#5a6a4a',
              padding: '6px 8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11 }}>{m.label}</div>
            <div style={{ fontSize: 8, opacity: 0.7, textTransform: 'none', letterSpacing: 0 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
