import React from 'react'
import { AIDecision, PruningStats } from '../core/types'

interface Props {
  decision: AIDecision | null
  stats: PruningStats
  isThinking: boolean
  depth: number
}

export default function DecisionPanel({ decision, stats, isThinking, depth }: Props) {
  return (
    <div className="tac-panel tac-corner p-3">
      <div className="flex items-center gap-2 mb-3">
        <div
          style={{
            width: 6, height: 6,
            background: isThinking ? '#9ca653' : '#2a3b2e',
            borderRadius: '50%',
            boxShadow: isThinking ? '0 0 8px #9ca653' : 'none',
            transition: 'all 0.3s',
          }}
        />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7c2e', letterSpacing: '0.15em' }}>
          AI TACTICAL DECISION ENGINE
        </span>
      </div>

      {isThinking ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#9ca653' }}>
            COMPUTING OPTIMAL STRATEGY
            <span className="cursor-blink" />
          </div>
          <div style={{ fontSize: 10, color: '#4a5a3a', fontFamily: 'monospace', marginTop: 4 }}>
            Depth: {depth} | Alpha-Beta pruning active
          </div>
        </div>
      ) : decision ? (
        <div>
          {/* Action */}
          <div className="mb-2 p-2" style={{ background: 'rgba(107,124,46,0.08)', border: '1px solid rgba(107,124,46,0.2)' }}>
            <div style={{ fontSize: 10, color: '#6b7c2e', fontFamily: 'monospace', marginBottom: 4, letterSpacing: '0.1em' }}>
              ▸ SELECTED ACTION
            </div>
            <div style={{ fontSize: 12, color: '#c8d4b0', fontFamily: 'monospace' }}>
              {decision.action.description}
            </div>
            {decision.action.damageDealt !== undefined && (
              <div style={{ fontSize: 10, color: '#c0392b', fontFamily: 'monospace', marginTop: 2 }}>
                DMG DEALT: {decision.action.damageDealt}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
              <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>EVAL SCORE</div>
              <div style={{
                fontSize: 14, fontFamily: 'monospace', fontWeight: 700,
                color: decision.score > 0 ? '#1e8449' : decision.score < 0 ? '#c0392b' : '#9ca653'
              }}>
                {decision.score > 0 ? '+' : ''}{decision.score}
              </div>
            </div>
            <div className="flex-1 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
              <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>SEARCH DEPTH</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#9ca653' }}>
                {decision.depth}
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="mb-2 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
            <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace', marginBottom: 4 }}>TACTICAL REASONING</div>
            <div style={{ fontSize: 10, color: '#8a9a6a', fontFamily: 'monospace', lineHeight: 1.6 }}>
              {decision.reasoning.split(' | ').map((r, i) => (
                <div key={i}>▸ {r}</div>
              ))}
            </div>
          </div>

          {/* Pruning stats */}
          <div className="flex gap-2">
            <div className="flex-1 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
              <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>NODES EXPLORED</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1a6b8a' }}>
                {stats.nodesExplored.toLocaleString()}
              </div>
            </div>
            <div className="flex-1 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
              <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>PRUNED</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#d68910' }}>
                {stats.nodesPruned.toLocaleString()}
              </div>
            </div>
            <div className="flex-1 p-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1e2a2d' }}>
              <div style={{ fontSize: 8, color: '#4a5a3a', fontFamily: 'monospace' }}>EFFICIENCY</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1e8449' }}>
                {stats.efficiency}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#4a5a3a', fontFamily: 'monospace', fontSize: 11 }}>
          AWAITING COMMAND INPUT
        </div>
      )}
    </div>
  )
}
