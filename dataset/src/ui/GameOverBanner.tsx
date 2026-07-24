import React from 'react'
import { Player } from '../core/types'

interface Props {
  winner: Player
  onReset: () => void
}

export default function GameOverBanner({ winner, onReset }: Props) {
  const isBlue = winner === 'BLUE'
  const color = isBlue ? '#1a6b8a' : '#8b1a1a'
  const label = isBlue ? 'ALPHA FORCE VICTORIOUS' : 'OMEGA FORCE VICTORIOUS'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          border: `2px solid ${color}`,
          padding: '40px 60px',
          textAlign: 'center',
          background: 'rgba(10,14,15,0.9)',
          boxShadow: `0 0 40px ${color}40`,
        }}
      >
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#4a5a3a', letterSpacing: '0.2em', marginBottom: 8 }}>
          BATTLE CONCLUDED
        </div>
        <div style={{ fontSize: 28, fontFamily: 'monospace', color, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#6b7c2e', marginBottom: 24 }}>
          {winner} FORCE HAS ELIMINATED ALL OPPOSITION
        </div>
        <button
          className="btn-tac primary"
          onClick={onReset}
          style={{ fontSize: 13, padding: '10px 32px' }}
        >
          ↺ NEW ENGAGEMENT
        </button>
      </div>
    </div>
  )
}
