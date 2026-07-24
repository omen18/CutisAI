import { BattleState, Player, TERRAIN_DATA, UNIT_STATS } from './types'
import { getUnitsForPlayer, getEnemyUnits } from './BattleState'

export function evaluate(state: BattleState, player: Player): number {
  const enemy: Player = player === 'BLUE' ? 'RED' : 'BLUE'
  const myUnits = getUnitsForPlayer(state, player)
  const enemyUnits = getEnemyUnits(state, player)

  // Win / Loss terminal
  if (enemyUnits.length === 0) return 100_000
  if (myUnits.length === 0) return -100_000

  let score = 0

  // 1. Unit count advantage (weighted by type)
  score += myUnits.length * 200
  score -= enemyUnits.length * 200

  // 2. HP advantage
  const myHp = myUnits.reduce((s, u) => s + u.hp, 0)
  const enemyHp = enemyUnits.reduce((s, u) => s + u.hp, 0)
  score += (myHp - enemyHp) * 2

  // 3. Unit type value
  for (const u of myUnits) {
    score += UNIT_STATS[u.type].attack * 3 + UNIT_STATS[u.type].defense * 2
  }
  for (const u of enemyUnits) {
    score -= UNIT_STATS[u.type].attack * 3 + UNIT_STATS[u.type].defense * 2
  }

  // 4. Terrain bonus
  for (const u of myUnits) {
    const terrain = TERRAIN_DATA[state.grid[u.row][u.col]]
    score += terrain.defenseBonus * 2
    score -= terrain.attackPenalty
  }
  for (const u of enemyUnits) {
    const terrain = TERRAIN_DATA[state.grid[u.row][u.col]]
    score -= terrain.defenseBonus * 2
    score += terrain.attackPenalty
  }

  // 5. Proximity pressure — reward closing distance
  for (const u of myUnits) {
    const closest = enemyUnits.reduce((best, e) => {
      const d = Math.abs(u.row - e.row) + Math.abs(u.col - e.col)
      return d < best ? d : best
    }, 999)
    // Artillery prefers distance, others prefer proximity
    if (u.type === 'ARTILLERY') {
      score += Math.min(closest, u.range) * 10
    } else {
      score -= closest * 5
    }
  }

  // 6. Stamina advantage
  const myStamina = myUnits.reduce((s, u) => s + u.stamina, 0)
  const enemyStamina = enemyUnits.reduce((s, u) => s + u.stamina, 0)
  score += (myStamina - enemyStamina) * 0.5

  // 7. Defending units with terrain bonus
  for (const u of myUnits) {
    if (u.isDefending) {
      const terrain = TERRAIN_DATA[state.grid[u.row][u.col]]
      score += terrain.defenseBonus > 0 ? 50 : 20
    }
  }

  return score
}

export function isTerminal(state: BattleState): boolean {
  const blue = getUnitsForPlayer(state, 'BLUE').length
  const red = getUnitsForPlayer(state, 'RED').length
  return blue === 0 || red === 0 || state.turn > 50
}
