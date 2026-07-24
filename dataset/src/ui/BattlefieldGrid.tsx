import React from 'react'
import { BattleState, Unit, TERRAIN_COLOR, TERRAIN_LABELS, UNIT_STATS, PLAYER_COLORS } from '../core/types'
import { getUnitAt } from '../core/BattleState'

interface Props {
  state: BattleState
  selectedUnitId: string | null
  onSelectUnit: (id: string | null) => void
}

function UnitToken({ unit, selected }: { unit: Unit; selected: boolean }) {
  const stats = UNIT_STATS[unit.type]
  const colors = PLAYER_COLORS[unit.player]
  const hpPct = Math.round((unit.hp / unit.maxHp) * 100)
  const hpColor = hpPct > 60 ? '#1e8449' : hpPct > 30 ? '#d68910' : '#c0392b'

  return (
    <div
      className="absolute inset-0.5 flex flex-col items-center justify-center rounded-sm cursor-pointer transition-all"
      style={{
        background: colors.bg,
        border: `1px solid ${selected ? '#9ca653' : colors.border}`,
        boxShadow: selected ? '0 0 8px rgba(156,166,83,0.6)' : undefined,
      }}
      title={`${unit.player} ${stats.label} | HP: ${unit.hp}/${unit.maxHp} | ATK: ${stats.attack} | DEF: ${stats.defense} | RNG: ${stats.range}`}
    >
      <span style={{ fontSize: 12 }}>{stats.symbol}</span>
      <span
        style={{
          fontSize: 8,
          fontFamily: 'monospace',
          color: colors.primary,
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
      >
        {unit.type[0]}
      </span>
      {/* HP bar */}
      <div style={{ width: '80%', height: 3, background: '#111', borderRadius: 1, marginTop: 1 }}>
        <div
          style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpColor,
            borderRadius: 1,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {unit.isDefending && (
        <div
          style={{
            position: 'absolute',
            top: 1,
            right: 1,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#1a6b8a',
          }}
        />
      )}
    </div>
  )
}

export default function BattlefieldGrid({ state, selectedUnitId, onSelectUnit }: Props) {
  const handleCellClick = (row: number, col: number) => {
    const unit = getUnitAt(state, row, col)
    if (unit) {
      onSelectUnit(selectedUnitId === unit.id ? null : unit.id)
    } else {
      onSelectUnit(null)
    }
  }

  return (
    <div className="tac-panel tac-corner p-3">
      {/* Column labels */}
      <div className="flex mb-1 ml-6">
        {Array.from({ length: state.grid[0]?.length ?? 0 }, (_, c) => (
          <div
            key={c}
            style={{
              width: 52,
              textAlign: 'center',
              fontSize: 9,
              color: '#4a5a3a',
              fontFamily: 'monospace',
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {state.grid.map((row, r) => (
        <div key={r} className="flex items-center mb-0.5">
          {/* Row label */}
          <div
            style={{
              width: 20,
              fontSize: 9,
              color: '#4a5a3a',
              fontFamily: 'monospace',
              textAlign: 'right',
              marginRight: 4,
              flexShrink: 0,
            }}
          >
            {r}
          </div>

          {row.map((terrain, c) => {
            const unit = getUnitAt(state, r, c)
            const isSelected = unit ? unit.id === selectedUnitId : false
            const terrainColor = TERRAIN_COLOR[terrain]

            return (
              <div
                key={c}
                className="grid-cell relative"
                style={{
                  width: 52,
                  height: 44,
                  background: terrainColor,
                  border: `1px solid rgba(30,42,45,0.8)`,
                  flexShrink: 0,
                  marginRight: 1,
                }}
                onClick={() => handleCellClick(r, c)}
                title={TERRAIN_LABELS[terrain]}
              >
                {/* Terrain pattern overlay */}
                {terrain === 'FOREST' && (
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.15, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🌲
                  </div>
                )}
                {terrain === 'HILLS' && (
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.2, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ⛰
                  </div>
                )}
                {terrain === 'WATER' && (
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.3, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    〜
                  </div>
                )}

                {unit && <UnitToken unit={unit} selected={isSelected} />}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {(['PLAINS', 'FOREST', 'HILLS', 'WATER'] as const).map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 12, background: TERRAIN_COLOR[t], border: '1px solid #2a3b2e' }} />
            <span style={{ fontSize: 10, color: '#6b8c5a', fontFamily: 'monospace' }}>{TERRAIN_LABELS[t]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'rgba(26,107,138,0.3)', border: '1px solid #1a6b8a' }} />
          <span style={{ fontSize: 10, color: '#6b8c5a', fontFamily: 'monospace' }}>BLUE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'rgba(139,26,26,0.3)', border: '1px solid #8b1a1a' }} />
          <span style={{ fontSize: 10, color: '#6b8c5a', fontFamily: 'monospace' }}>RED</span>
        </div>
      </div>
    </div>
  )
}
