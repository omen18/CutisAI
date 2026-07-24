import {
  BattleState, BattleAction, Unit, Player,
  GRID_ROWS, GRID_COLS, UNIT_STATS
} from './types'
import {
  cloneState, getUnitsForPlayer, getEnemyUnits,
  getUnitAt, isInRange, getTerrainAt
} from './BattleState'

// ─── Get all legal actions for a player ──────────────────────────────────────

export function getLegalActions(state: BattleState, player: Player): BattleAction[] {
  const actions: BattleAction[] = []
  const myUnits = getUnitsForPlayer(state, player)
  const enemies = getEnemyUnits(state, player)

  for (const unit of myUnits) {
    // ATTACK — any enemy in range
    for (const target of enemies) {
      if (isInRange(unit, target)) {
        const terrain = getTerrainAt(state, unit.row, unit.col)
        const damage = Math.max(5, unit.attack - terrain.attackPenalty)
        actions.push({
          unitId: unit.id,
          type: 'ATTACK',
          targetId: target.id,
          description: `${unit.id} attacks ${target.id} [DMG: ~${damage}]`,
        })
      }
    }

    // DEFEND
    actions.push({
      unitId: unit.id,
      type: 'DEFEND',
      description: `${unit.id} takes defensive stance`,
    })

    // RETREAT — move 1-2 tiles away from nearest enemy
    const nearest = nearestEnemy(unit, enemies)
    if (nearest) {
      const retreat = getRetreatPosition(state, unit, nearest)
      if (retreat) {
        actions.push({
          unitId: unit.id,
          type: 'RETREAT',
          fromRow: unit.row,
          fromCol: unit.col,
          toRow: retreat.row,
          toCol: retreat.col,
          description: `${unit.id} retreats to [${retreat.row},${retreat.col}]`,
        })
      }
    }

    // ADVANCE — move toward nearest enemy
    const advance = getAdvancePosition(state, unit, enemies)
    if (advance) {
      actions.push({
        unitId: unit.id,
        type: 'ATTACK', // use attack type but it's a move-attack
        fromRow: unit.row,
        fromCol: unit.col,
        toRow: advance.row,
        toCol: advance.col,
        description: `${unit.id} advances to [${advance.row},${advance.col}]`,
      })
    }
  }

  // Always have at least 1 action (defend first unit)
  if (actions.length === 0 && myUnits.length > 0) {
    actions.push({
      unitId: myUnits[0].id,
      type: 'DEFEND',
      description: `${myUnits[0].id} holds position`,
    })
  }

  return actions
}

// ─── Apply an action to state ─────────────────────────────────────────────────

export function applyAction(state: BattleState, action: BattleAction): BattleState {
  const next = cloneState(state)
  const unit = next.units.find(u => u.id === action.unitId)
  if (!unit) return next

  // Reset defending status
  next.units.forEach(u => {
    if (u.player === state.currentPlayer) u.isDefending = false
  })

  if (action.type === 'ATTACK' && action.targetId) {
    const target = next.units.find(u => u.id === action.targetId)
    if (target) {
      const attackerTerrain = getTerrainAt(state, unit.row, unit.col)
      const defenderTerrain = getTerrainAt(state, target.row, target.col)

      let damage = Math.max(5, unit.attack - attackerTerrain.attackPenalty)
      if (target.isDefending) {
        damage = Math.floor(damage * 0.5)
      }
      damage = Math.max(5, damage - Math.floor(defenderTerrain.defenseBonus * 0.5))

      target.hp = Math.max(0, target.hp - damage)
      action.damageDealt = damage

      unit.stamina = Math.max(0, unit.stamina - 10)
    }
  } else if (action.type === 'ATTACK' && action.toRow !== undefined && action.toCol !== undefined) {
    // Move action
    const terrain = getTerrainAt(state, action.toRow, action.toCol)
    if (terrain.passable && !getUnitAt(next, action.toRow, action.toCol)) {
      unit.row = action.toRow
      unit.col = action.toCol
    }
  } else if (action.type === 'DEFEND') {
    unit.isDefending = true
    unit.stamina = Math.min(unit.maxStamina, unit.stamina + 15)
    // Partial HP regen
    unit.hp = Math.min(unit.maxHp, unit.hp + 5)
  } else if (action.type === 'RETREAT') {
    if (action.toRow !== undefined && action.toCol !== undefined) {
      const terrain = getTerrainAt(state, action.toRow, action.toCol)
      if (terrain.passable && !getUnitAt(next, action.toRow, action.toCol)) {
        unit.row = action.toRow
        unit.col = action.toCol
      }
    }
    unit.stamina = Math.min(unit.maxStamina, unit.stamina + 5)
  }

  // Remove dead units
  next.units = next.units.filter(u => u.hp > 0)

  // Switch player
  next.currentPlayer = state.currentPlayer === 'BLUE' ? 'RED' : 'BLUE'
  next.turn = state.currentPlayer === 'RED' ? state.turn + 1 : state.turn
  next.lastAction = action

  return next
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nearestEnemy(unit: Unit, enemies: Unit[]): Unit | null {
  if (!enemies.length) return null
  return enemies.reduce((closest, e) => {
    const d1 = Math.abs(unit.row - e.row) + Math.abs(unit.col - e.col)
    const d2 = Math.abs(unit.row - closest.row) + Math.abs(unit.col - closest.col)
    return d1 < d2 ? e : closest
  })
}

function getRetreatPosition(
  state: BattleState, unit: Unit, enemy: Unit
): { row: number; col: number } | null {
  const dr = unit.row - enemy.row
  const dc = unit.col - enemy.col
  const len = Math.sqrt(dr * dr + dc * dc) || 1
  const nr = unit.row + Math.round(dr / len)
  const nc = unit.col + Math.round(dc / len)

  if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
    const terrain = getTerrainAt(state, nr, nc)
    if (terrain.passable && !getUnitAt(state, nr, nc)) {
      return { row: nr, col: nc }
    }
  }
  return null
}

function getAdvancePosition(
  state: BattleState, unit: Unit, enemies: Unit[]
): { row: number; col: number } | null {
  if (!enemies.length) return null
  const target = nearestEnemy(unit, enemies)!
  if (isInRange(unit, target)) return null // already in range

  const dr = Math.sign(target.row - unit.row)
  const dc = Math.sign(target.col - unit.col)

  // Try diagonal, then cardinal
  const candidates = [
    { row: unit.row + dr, col: unit.col + dc },
    { row: unit.row + dr, col: unit.col },
    { row: unit.row, col: unit.col + dc },
  ]

  for (const c of candidates) {
    if (c.row >= 0 && c.row < GRID_ROWS && c.col >= 0 && c.col < GRID_COLS) {
      const terrain = getTerrainAt(state, c.row, c.col)
      if (terrain.passable && !getUnitAt(state, c.row, c.col)) {
        return c
      }
    }
  }
  return null
}
