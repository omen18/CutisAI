import React from 'react'
import { BattleAction, Unit, UNIT_STATS } from '../core/types'
import { getLegalActions } from '../core/actions'
import { BattleState } from '../core/types'

interface Props {
  battle: BattleState
  selectedUnitId: string | null
  onAction: (action: BattleAction) => void
}

export default function ActionButtons({ battle, selectedUnitId, onAction }: Props) {
  const unit = selectedUnitId ? battle.units.find(u => u.id === selectedUnitId) : null
  const isHumanTurn = battle.currentPlayer === 'BLUE'

  if (!isHumanTurn) {
    return (
      <div className="tac-panel p-3 text-center" style={{ color: '#c0392b', fontFamily: 'monospace', fontSize: 11 }}>
        ⚠ ENEMY TURN IN PROGRESS
      </div>
    )
  }

  if (!unit || unit.player !== 'BLUE') {
    return (
      <div className="tac-panel p-3 text-center" style={{ color: '#4a5a3a', fontFamily: 'monospace', fontSize: 11 }}>
        SELECT A BLUE UNIT TO COMMAND
      </div>
    )
  }

  const actions = getLegalActions(battle, 'BLUE').filter(a => a.unitId === unit.id)
  const stats = UNIT_STATS[unit.type]

  return (
    <div className="tac-panel p-3">
      <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
        COMMANDING: {unit.id} [{stats.label.toUpperCase()}]
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {actions.map((action, i) => {
          let color = '#6b7c2e'
          if (action.type === 'ATTACK' && action.targetId) color = '#8b1a1a'
          else if (action.type === 'DEFEND') color = '#1a5276'
          else if (action.type === 'RETREAT') color = '#7d6608'

          return (
            <button
              key={i}
              className="btn-tac"
              onClick={() => onAction(action)}
              style={{
                borderColor: color,
                color: color,
                textAlign: 'left',
                padding: '5px 10px',
                fontSize: 10,
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              <span style={{ marginRight: 6, fontFamily: 'monospace' }}>
                {action.type === 'ATTACK' && action.targetId ? '⚔' :
                 action.type === 'DEFEND' ? '🛡' :
                 action.type === 'RETREAT' ? '↩' : '→'}
              </span>
              {action.description}
            </button>
          )
        })}
        {actions.length === 0 && (
          <div style={{ color: '#3a4a3a', fontFamily: 'monospace', fontSize: 10 }}>
            No actions available for this unit
          </div>
        )}
      </div>
    </div>
  )
}
