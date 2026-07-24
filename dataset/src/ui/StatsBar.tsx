import React from 'react'
import { PruningStats } from '../core/types'

interface Props {
  stats: PruningStats
  turn: number
  depth: number
  useAlphaBeta: boolean
}

export default function StatsBar({ stats, turn, depth, useAlphaBeta }: Props) {
  const effColor = stats.efficiency > 60 ? '#1e8449' : stats.efficiency > 30 ? '#d68910' : '#c0392b'

  return (
    <div
      className="tac-panel px-4 py-2 flex items-center gap-6 flex-wrap"
      style={{ borderTop: '1px solid #1e2a2d' }}
    >
      <StatItem label="TURN" value={String(turn)} color="#9ca653" />
      <StatItem label="DEPTH" value={String(depth)} color="#6b7c2e" />
      <StatItem label="NODES" value={stats.nodesExplored.toLocaleString()} color="#1a6b8a" />
      <StatItem label="PRUNED" value={stats.nodesPruned.toLocaleString()} color="#d68910" />
      <StatItem label="EFFICIENCY" value={`${stats.efficiency}%`} color={effColor} />
      <StatItem label="α-β PRUNING" value={useAlphaBeta ? 'ON' : 'OFF'} color={useAlphaBeta ? '#1e8449' : '#c0392b'} />

      {/* Efficiency bar */}
      <div className="flex items-center gap-2 flex-1 min-w-32">
        <span style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          PRUNE RATE
        </span>
        <div style={{ flex: 1, height: 6, background: '#1a2a1a', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${stats.efficiency}%`,
              height: '100%',
              background: effColor,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span style={{ fontSize: 7, color: '#3a4a3a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontFamily: 'monospace', color, fontWeight: 700 }}>
        {value}
      </span>
    </div>
  )
}
