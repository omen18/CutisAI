import { BattleState, Player } from '../core/types'
import { getUnitsForPlayer } from '../core/BattleState'

export function checkWinCondition(state: BattleState): Player | null {
  const blue = getUnitsForPlayer(state, 'BLUE').length
  const red = getUnitsForPlayer(state, 'RED').length

  if (blue === 0 && red === 0) return 'BLUE' // draw → no winner but we pick BLUE
  if (blue === 0) return 'RED'
  if (red === 0) return 'BLUE'
  if (state.turn > 50) {
    // Decide by HP
    const blueHp = getUnitsForPlayer(state, 'BLUE').reduce((s, u) => s + u.hp, 0)
    const redHp = getUnitsForPlayer(state, 'RED').reduce((s, u) => s + u.hp, 0)
    return blueHp >= redHp ? 'BLUE' : 'RED'
  }
  return null
}
