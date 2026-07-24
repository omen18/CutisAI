import { useState, useCallback, useRef } from 'react'
import {
  BattleState, BattleAction, AIDecision, LogEntry,
  GameMode, Player
} from '../core/types'
import { createInitialState } from '../core/BattleState'
import { getLegalActions, applyAction } from '../core/actions'
import { getAIDecision } from '../core/aiAgent'
import { checkWinCondition } from '../game/winConditions'

export interface GameEngineState {
  battle: BattleState
  logs: LogEntry[]
  lastDecision: AIDecision | null
  mode: GameMode
  depth: number
  useAlphaBeta: boolean
  isAIThinking: boolean
  selectedUnitId: string | null
}

export function useGameEngine() {
  const [state, setState] = useState<GameEngineState>({
    battle: createInitialState(),
    logs: [],
    lastDecision: null,
    mode: 'AI_VS_AI',
    depth: 3,
    useAlphaBeta: true,
    isAIThinking: false,
    selectedUnitId: null,
  })

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Execute a single turn (AI) ────────────────────────────────────────────

  const executeAITurn = useCallback((currentState: GameEngineState) => {
    if (currentState.battle.phase !== 'PLAYING') return
    if (currentState.isAIThinking) return

    setState(prev => ({ ...prev, isAIThinking: true }))

    // Small delay so UI can update
    aiTimerRef.current = setTimeout(() => {
      setState(prev => {
        const { battle, depth, useAlphaBeta } = prev

        const decision = getAIDecision(battle, depth, useAlphaBeta)
        if (!decision) return { ...prev, isAIThinking: false }

        let newBattle = applyAction(battle, decision.action)
        const winner = checkWinCondition(newBattle)
        if (winner) {
          newBattle = { ...newBattle, phase: 'GAME_OVER', winner }
        }

        const logEntry: LogEntry = {
          turn: battle.turn,
          player: battle.currentPlayer,
          action: decision.action,
          timestamp: Date.now(),
        }

        return {
          ...prev,
          battle: newBattle,
          logs: [logEntry, ...prev.logs].slice(0, 100),
          lastDecision: decision,
          isAIThinking: false,
        }
      })
    }, 400)
  }, [])

  // ─── Human action ──────────────────────────────────────────────────────────

  const executeHumanAction = useCallback((action: BattleAction) => {
    setState(prev => {
      if (prev.battle.phase !== 'PLAYING') return prev
      if (prev.battle.currentPlayer !== 'BLUE') return prev

      let newBattle = applyAction(prev.battle, action)
      const winner = checkWinCondition(newBattle)
      if (winner) {
        newBattle = { ...newBattle, phase: 'GAME_OVER', winner }
      }

      const logEntry: LogEntry = {
        turn: prev.battle.turn,
        player: prev.battle.currentPlayer,
        action,
        timestamp: Date.now(),
      }

      return {
        ...prev,
        battle: newBattle,
        logs: [logEntry, ...prev.logs].slice(0, 100),
        selectedUnitId: null,
      }
    })
  }, [])

  // ─── Step — one AI turn ────────────────────────────────────────────────────

  const stepOnce = useCallback(() => {
    setState(prev => {
      executeAITurn(prev)
      return prev
    })
  }, [executeAITurn])

  // Expose executeAITurn for external triggering
  const triggerAITurn = useCallback(() => {
    setState(prev => {
      if (prev.battle.phase !== 'PLAYING') return prev
      if (prev.isAIThinking) return prev
      // Schedule AI
      executeAITurn(prev)
      return prev
    })
  }, [executeAITurn])

  // ─── Get legal actions for selected human unit ─────────────────────────────

  const getLegalHumanActions = useCallback((unitId: string) => {
    const unit = state.battle.units.find(u => u.id === unitId)
    if (!unit || unit.player !== 'BLUE') return []
    return getLegalActions(state.battle, 'BLUE').filter(a => a.unitId === unitId)
  }, [state.battle])

  // ─── Controls ──────────────────────────────────────────────────────────────

  const resetGame = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    setState(prev => ({
      ...prev,
      battle: createInitialState(),
      logs: [],
      lastDecision: null,
      isAIThinking: false,
      selectedUnitId: null,
    }))
  }, [])

  const setMode = useCallback((mode: GameMode) => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  const setDepth = useCallback((depth: number) => {
    setState(prev => ({ ...prev, depth }))
  }, [])

  const setUseAlphaBeta = useCallback((val: boolean) => {
    setState(prev => ({ ...prev, useAlphaBeta: val }))
  }, [])

  const selectUnit = useCallback((unitId: string | null) => {
    setState(prev => ({ ...prev, selectedUnitId: unitId }))
  }, [])

  return {
    state,
    executeHumanAction,
    triggerAITurn,
    stepOnce,
    getLegalHumanActions,
    resetGame,
    setMode,
    setDepth,
    setUseAlphaBeta,
    selectUnit,
  }
}
