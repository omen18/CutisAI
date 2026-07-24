import React from 'react'
import { LogEntry } from '../core/types'

interface Props {
  logs: LogEntry[]
}

function getActionColor(type: string) {
  if (type === 'ATTACK') return '#c0392b'
  if (type === 'DEFEND') return '#1a6b8a'
  if (type === 'RETREAT') return '#d68910'
  return '#6b7c2e'
}

export default function GameLog({ logs }: Props) {
  return (
    <div className="tac-panel p-3" style={{ height: 220 }}>
      <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 6 }}>
        ▸ BATTLE LOG
      </div>
      <div style={{ height: 178, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#3a4a3a', fontFamily: 'monospace', fontSize: 10, padding: '8px 0' }}>
            No actions recorded.
          </div>
        ) : (
          logs.map((entry, i) => {
            const color = entry.player === 'BLUE' ? '#1a6b8a' : '#8b1a1a'
            const actionColor = getActionColor(entry.action.type)
            return (
              <div
                key={i}
                className="log-entry"
                style={{ paddingBottom: 4, marginBottom: 2 }}
              >
                <span style={{ color: '#3a4a3a' }}>T{String(entry.turn).padStart(2,'0')} </span>
                <span style={{ color, fontWeight: 700 }}>[{entry.player}] </span>
                <span style={{ color: actionColor }}>{entry.action.type} </span>
                <span style={{ color: '#7a8a6a' }}>{entry.action.description}</span>
                {entry.action.damageDealt !== undefined && (
                  <span style={{ color: '#c0392b' }}> (-{entry.action.damageDealt} HP)</span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
