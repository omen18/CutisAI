import { BattleState, BattleAction, Player, PruningStats } from './types'
import { getLegalActions, applyAction } from './actions'
import { evaluate, isTerminal } from './heuristic'

interface MinimaxResult {
  score: number
  action: BattleAction | null
  stats: PruningStats
}

let nodesExplored = 0
let nodesPruned = 0

export function minimax(
  state: BattleState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  rootPlayer: Player,
  useAlphaBeta: boolean
): MinimaxResult {
  nodesExplored++

  if (depth === 0 || isTerminal(state)) {
    return {
      score: evaluate(state, rootPlayer),
      action: null,
      stats: { nodesExplored, nodesPruned, efficiency: 0 },
    }
  }

  const actions = getLegalActions(state, state.currentPlayer)

  if (actions.length === 0) {
    return {
      score: evaluate(state, rootPlayer),
      action: null,
      stats: { nodesExplored, nodesPruned, efficiency: 0 },
    }
  }

  let bestAction: BattleAction | null = null

  if (maximizing) {
    let maxScore = -Infinity
    for (const action of actions) {
      const nextState = applyAction(state, action)
      const result = minimax(nextState, depth - 1, alpha, beta, false, rootPlayer, useAlphaBeta)
      if (result.score > maxScore) {
        maxScore = result.score
        bestAction = action
      }
      if (useAlphaBeta) {
        alpha = Math.max(alpha, maxScore)
        if (beta <= alpha) {
          nodesPruned++
          break
        }
      }
    }
    return { score: maxScore, action: bestAction, stats: { nodesExplored, nodesPruned, efficiency: 0 } }
  } else {
    let minScore = Infinity
    for (const action of actions) {
      const nextState = applyAction(state, action)
      const result = minimax(nextState, depth - 1, alpha, beta, true, rootPlayer, useAlphaBeta)
      if (result.score < minScore) {
        minScore = result.score
        bestAction = action
      }
      if (useAlphaBeta) {
        beta = Math.min(beta, minScore)
        if (beta <= alpha) {
          nodesPruned++
          break
        }
      }
    }
    return { score: minScore, action: bestAction, stats: { nodesExplored, nodesPruned, efficiency: 0 } }
  }
}

export function runMinimax(
  state: BattleState,
  depth: number,
  useAlphaBeta: boolean
): { action: BattleAction | null; score: number; stats: PruningStats } {
  nodesExplored = 0
  nodesPruned = 0

  const result = minimax(state, depth, -Infinity, Infinity, true, state.currentPlayer, useAlphaBeta)

  const total = nodesExplored + nodesPruned
  const efficiency = total > 0 ? Math.round((nodesPruned / total) * 100) : 0

  return {
    action: result.action,
    score: result.score,
    stats: { nodesExplored, nodesPruned, efficiency },
  }
}
