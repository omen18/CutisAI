import React, { useEffect, useRef } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import BattlefieldGrid from './ui/BattlefieldGrid'
import StatusPanel from './ui/StatusPanel'
import DecisionPanel from './ui/DecisionPanel'
import GameLog from './ui/GameLog'
import StatsBar from './ui/StatsBar'
import DepthSlider from './ui/DepthSlider'
import AlphaBetaToggle from './ui/AlphaBetaToggle'
import ModeSelector from './ui/ModeSelector'
import ActionButtons from './ui/ActionButtons'
import GameOverBanner from './ui/GameOverBanner'

export default function App() {
  const {
    state,
    executeHumanAction,
    triggerAITurn,
    resetGame,
    setMode,
    setDepth,
    setUseAlphaBeta,
    selectUnit,
  } = useGameEngine()

  const { battle, logs, lastDecision, mode, depth, useAlphaBeta, isAIThinking, selectedUnitId } = state
  const autoPlayRef = useRef(false)
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [autoPlay, setAutoPlay] = React.useState(false)
  const [autoSpeed, setAutoSpeed] = React.useState(800)

  // Auto-play loop for AI vs AI
  useEffect(() => {
    if (autoPlay && mode === 'AI_VS_AI' && battle.phase === 'PLAYING') {
      autoIntervalRef.current = setInterval(() => {
        if (!isAIThinking) triggerAITurn()
      }, autoSpeed)
    }
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current)
    }
  }, [autoPlay, mode, battle.phase, isAIThinking, autoSpeed, triggerAITurn])

  // Auto-trigger AI turn in Human vs AI when it's RED's turn
  useEffect(() => {
    if (
      mode === 'HUMAN_VS_AI' &&
      battle.currentPlayer === 'RED' &&
      battle.phase === 'PLAYING' &&
      !isAIThinking
    ) {
      const t = setTimeout(() => triggerAITurn(), 600)
      return () => clearTimeout(t)
    }
  }, [mode, battle.currentPlayer, battle.phase, isAIThinking, triggerAITurn])

  const handleReset = () => {
    setAutoPlay(false)
    resetGame()
  }

  const isPlaying = battle.phase === 'PLAYING'
  const isOver = battle.phase === 'GAME_OVER'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e0f', color: '#c8d4b0' }}>
      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Header */}
      <header
        style={{
          background: '#0d1214',
          borderBottom: '1px solid #1e2a2d',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => (
              <div
                key={i}
                style={{
                  width: 6, height: 6,
                  background: ['#c0392b','#d68910','#1e8449'][i],
                  borderRadius: '50%',
                }}
              />
            ))}
          </div>
          <span
            className="glow-olive"
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 700,
              color: '#9ca653',
              letterSpacing: '0.2em',
            }}
          >
            ◈ BATTLEFIELD AI — TACTICAL COMMAND v1.0
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a5a3a' }}>
            TURN {battle.turn} | {battle.currentPlayer} ACTIVE
          </span>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isAIThinking ? '#9ca653' : '#2a3b2e',
              boxShadow: isAIThinking ? '0 0 8px #9ca653' : 'none',
            }}
          />
        </div>
      </header>

      {/* Stats bar */}
      <StatsBar
        stats={battle.pruningStats}
        turn={battle.turn}
        depth={depth}
        useAlphaBeta={useAlphaBeta}
      />

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'flex-start' }}>

        {/* LEFT — controls */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ModeSelector mode={mode} onChange={m => { setMode(m); handleReset() }} disabled={isAIThinking} />
          <DepthSlider depth={depth} onChange={setDepth} disabled={isAIThinking} />
          <AlphaBetaToggle enabled={useAlphaBeta} onChange={setUseAlphaBeta} disabled={isAIThinking} />

          {/* Control buttons */}
          <div className="tac-panel p-3" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 2 }}>
              CONTROLS
            </div>

            {mode === 'AI_VS_AI' && (
              <>
                <button
                  className="btn-tac primary"
                  onClick={() => triggerAITurn()}
                  disabled={!isPlaying || isAIThinking}
                >
                  ▶ STEP ONCE
                </button>

                <button
                  className={`btn-tac ${autoPlay ? 'danger' : 'primary'}`}
                  onClick={() => setAutoPlay(p => !p)}
                  disabled={!isPlaying}
                >
                  {autoPlay ? '⏹ STOP AUTO' : '⏩ AUTO PLAY'}
                </button>

                {/* Speed */}
                <div>
                  <div style={{ fontSize: 8, color: '#3a4a3a', fontFamily: 'monospace', marginBottom: 3 }}>
                    SPEED: {autoSpeed}ms
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={autoSpeed}
                    onChange={e => setAutoSpeed(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#6b7c2e' }}
                  />
                </div>
              </>
            )}

            <button
              className="btn-tac danger"
              onClick={handleReset}
            >
              ↺ RESET
            </button>
          </div>

          {/* Terrain guide */}
          <div className="tac-panel p-3">
            <div style={{ fontSize: 9, color: '#4a5a3a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
              TERRAIN EFFECTS
            </div>
            {[
              { name: 'Plains', def: '+0', atk: '+0', move: '×1' },
              { name: 'Forest', def: '+15', atk: '-10', move: '×2' },
              { name: 'Hills', def: '+20', atk: '-5', move: '×2' },
              { name: 'Water', def: '-10', atk: '-20', move: '×3' },
            ].map(t => (
              <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#6b8c5a' }}>{t.name}</span>
                <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#3a4a3a' }}>
                  DEF{t.def} ATK{t.atk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — battlefield */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div style={{ position: 'relative' }}>
            <BattlefieldGrid
              state={battle}
              selectedUnitId={selectedUnitId}
              onSelectUnit={selectUnit}
            />
            {isOver && battle.winner && (
              <GameOverBanner winner={battle.winner} onReset={handleReset} />
            )}
          </div>

          <GameLog logs={logs} />
        </div>

        {/* RIGHT — status + decision */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StatusPanel state={battle} />

          {mode === 'HUMAN_VS_AI' && (
            <ActionButtons
              battle={battle}
              selectedUnitId={selectedUnitId}
              onAction={executeHumanAction}
            />
          )}

          <DecisionPanel
            decision={lastDecision}
            stats={battle.pruningStats}
            isThinking={isAIThinking}
            depth={depth}
          />
        </div>
      </div>
    </div>
  )
}
