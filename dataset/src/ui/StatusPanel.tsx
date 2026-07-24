import React from 'react'
import { BattleState, Player, Unit, UNIT_STATS } from '../core/types'
import { getUnitsForPlayer } from '../core/BattleState'

function UnitRow({ unit }: { unit: Unit }) {
  const stats = UNIT_STATS[unit.type]
  const hpPct = (unit.hp / unit.maxHp) * 100
  const staminaPct = (unit.stamina / unit.maxStamina) * 100
  const hpColor = hpPct > 60 ? '#1e8449' : hpPct > 30 ? '#d68910' : '#c0392b'

  return (
    <div className="mb-2 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 12 }}>{stats.symbol}</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca653' }}>
            {unit.id}
          </span>
          <span style={{ fontSize: 9, color: '#5a6a4a', fontFamily: 'monospace' }}>
            [{unit.type[0]}]
          </span>
        </div>
        <div className="flex gap-2">
          {unit.isDefending && (
            <span style={{ fontSize: 8, color: '#1a6b8a', fontFamily: 'monospace', border: '1px solid #1a6b8a', padding: '0 3px' }}>
              DEF
            </span>
          )}
          <span style={{ fontSize: 9, color: '#6b7c3a', fontFamily: 'monospace' }}>
            [{unit.row},{unit.col}]
          </span>
        </div>
      </div>

      {/* HP */}
      <div className="flex items-center gap-2 mb-0.5">
        <span style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace', width: 20 }}>HP</span>
        <div style={{ flex: 1, height: 4, background: '#1a2a1a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${hpPct}%`, height: '100%', background: hpColor, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 8, color: hpColor, fontFamily: 'monospace', width: 32 }}>
          {unit.hp}/{unit.maxHp}
        </span>
      </div>

      {/* Stamina */}
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace', width: 20 }}>STA</span>
        <div style={{ flex: 1, height: 4, background: '#1a1a2a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${staminaPct}%`, height: '100%', background: '#1a5276', transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 8, color: '#1a6b8a', fontFamily: 'monospace', width: 32 }}>
          {unit.stamina}/{unit.maxStamina}
        </span>
      </div>
    </div>
  )
}

function PlayerPanel({ state, player }: { state: BattleState; player: Player }) {
  const units = getUnitsForPlayer(state, player)
  const totalHp = units.reduce((s, u) => s + u.hp, 0)
  const maxHp = units.reduce((s, u) => s + u.maxHp, 0)
  const isActive = state.currentPlayer === player
  const color = player === 'BLUE' ? '#1a6b8a' : '#8b1a1a'
  const label = player === 'BLUE' ? '◀ ALPHA FORCE' : 'OMEGA FORCE ▶'

  return (
    <div
      className="tac-panel p-3 flex-1"
      style={{ borderColor: isActive ? color : '#1e2a2d' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isActive ? color : 'transparent',
              border: `1px solid ${color}`,
              boxShadow: isActive ? `0 0 6px ${color}` : 'none',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color,
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            {label}
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#4a5a3a' }}>
          {units.length} units
        </span>
      </div>

      {/* Total HP bar */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>FORCE</span>
        <div style={{ flex: 1, height: 6, background: '#1a2a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: maxHp > 0 ? `${(totalHp / maxHp) * 100}%` : '0%',
              height: '100%',
              background: color,
              transition: 'width 0.4s',
            }}
          />
        </div>
        <span style={{ fontSize: 9, color, fontFamily: 'monospace' }}>
          {totalHp}/{maxHp}
        </span>
      </div>

      {/* Unit list */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {units.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#c0392b', fontFamily: 'monospace', fontSize: 11, padding: 8 }}>
            ☠ ELIMINATED
          </div>
        ) : (
          units.map(u => <UnitRow key={u.id} unit={u} />)
        )}
      </div>
    </div>
  )
}

export default function StatusPanel({ state }: { state: BattleState }) {
  return (
    <div className="flex gap-2">
      <PlayerPanel state={state} player="BLUE" />
      <PlayerPanel state={state} player="RED" />
    </div>
  )
}
