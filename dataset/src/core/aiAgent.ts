import { BattleState, BattleAction, AIDecision } from './types'
import { runMinimax } from './minimax'

export function getAIDecision(
  state: BattleState,
  depth: number,
  useAlphaBeta: boolean
): AIDecision | null {
  const { action, score, stats } = runMinimax(state, depth, useAlphaBeta)

  if (!action) return null

  return {
    action,
    score,
    reasoning: buildReasoning(action, score, stats.efficiency),
    depth,
    nodesExplored: stats.nodesExplored,
    pruned: stats.nodesPruned,
  }
}

function buildReasoning(action: BattleAction, score: number, efficiency: number): string {
  const parts: string[] = []

  if (action.type === 'ATTACK' && action.targetId) {
    parts.push(`Optimal attack: ${action.unitId} → ${action.targetId}`)
    if (score > 500) parts.push('Favourable tactical position')
    else if (score < -500) parts.push('Aggressive gambit — under pressure')
  } else if (action.type === 'DEFEND') {
    parts.push(`Defensive stance: ${action.unitId}`)
    parts.push('Conserving resources, fortifying position')
  } else if (action.type === 'RETREAT') {
    parts.push(`Strategic withdrawal: ${action.unitId}`)
    parts.push('Regroup and reposition')
  } else {
    parts.push(`Advance: ${action.unitId}`)
    parts.push('Closing gap to engage')
  }

  parts.push(`Pruning efficiency: ${efficiency}%`)
  return parts.join(' | ')
}
