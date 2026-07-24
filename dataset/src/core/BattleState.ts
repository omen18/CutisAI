import {
  BattleState, Unit, UnitType, TerrainType, Player,
  GRID_ROWS, GRID_COLS, UNIT_STATS, TERRAIN_DATA
} from './types'

let unitIdCounter = 0

function makeUnit(player: Player, type: UnitType, row: number, col: number): Unit {
  const stats = UNIT_STATS[type]
  return {
    id: `${player[0]}${++unitIdCounter}`,
    player,
    type,
    hp: stats.hp,
    maxHp: stats.hp,
    stamina: stats.stamina,
    maxStamina: stats.stamina,
    attack: stats.attack,
    defense: stats.defense,
    range: stats.range,
    row,
    col,
    isDefending: false,
  }
}

function generateTerrain(): TerrainType[][] {
  const grid: TerrainType[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill('PLAINS' as TerrainType)
  )

  // Forest clusters
  const forests = [[1,3],[1,4],[2,3],[2,4],[2,5],[5,6],[5,7],[6,6],[6,7]]
  forests.forEach(([r,c]) => { if (r < GRID_ROWS && c < GRID_COLS) grid[r][c] = 'FOREST' })

  // Hills
  const hills = [[0,6],[0,7],[1,7],[3,0],[3,1],[4,0],[7,2],[7,3],[6,8],[7,8]]
  hills.forEach(([r,c]) => { if (r < GRID_ROWS && c < GRID_COLS) grid[r][c] = 'HILLS' })

  // Water river in the middle
  for (let r = 2; r <= 5; r++) grid[r][5] = 'WATER'
  grid[3][4] = 'WATER'
  grid[4][4] = 'WATER'

  return grid
}

export function createInitialState(): BattleState {
  unitIdCounter = 0
  const grid = generateTerrain()

  // BLUE units — left side
  const units: Unit[] = [
    makeUnit('BLUE', 'INFANTRY',  2, 0),
    makeUnit('BLUE', 'INFANTRY',  4, 0),
    makeUnit('BLUE', 'INFANTRY',  6, 0),
    makeUnit('BLUE', 'ARMOR',     3, 1),
    makeUnit('BLUE', 'ARMOR',     5, 1),
    makeUnit('BLUE', 'ARTILLERY', 1, 0),
    makeUnit('BLUE', 'ARTILLERY', 7, 0),
  ]

  // RED units — right side
  const redUnits: Unit[] = [
    makeUnit('RED', 'INFANTRY',  2, 9),
    makeUnit('RED', 'INFANTRY',  4, 9),
    makeUnit('RED', 'INFANTRY',  6, 9),
    makeUnit('RED', 'ARMOR',     3, 8),
    makeUnit('RED', 'ARMOR',     5, 8),
    makeUnit('RED', 'ARTILLERY', 1, 9),
    makeUnit('RED', 'ARTILLERY', 7, 9),
  ]

  return {
    grid,
    units: [...units, ...redUnits],
    currentPlayer: 'BLUE',
    turn: 1,
    phase: 'PLAYING',
    winner: null,
    lastAction: null,
    pruningStats: { nodesExplored: 0, nodesPruned: 0, efficiency: 0 },
  }
}

export function cloneState(state: BattleState): BattleState {
  return {
    ...state,
    units: state.units.map(u => ({ ...u })),
    grid: state.grid.map(row => [...row]),
    lastAction: state.lastAction ? { ...state.lastAction } : null,
    pruningStats: { ...state.pruningStats },
  }
}

export function getUnitsForPlayer(state: BattleState, player: Player): Unit[] {
  return state.units.filter(u => u.player === player && u.hp > 0)
}

export function getEnemyUnits(state: BattleState, player: Player): Unit[] {
  const enemy: Player = player === 'BLUE' ? 'RED' : 'BLUE'
  return state.units.filter(u => u.player === enemy && u.hp > 0)
}

export function getUnitAt(state: BattleState, row: number, col: number): Unit | null {
  return state.units.find(u => u.row === row && u.col === col && u.hp > 0) ?? null
}

export function isInRange(attacker: Unit, target: Unit): boolean {
  const dr = Math.abs(attacker.row - target.row)
  const dc = Math.abs(attacker.col - target.col)
  // Chebyshev distance for range
  return Math.max(dr, dc) <= attacker.range
}

export function getTerrainAt(state: BattleState, row: number, col: number) {
  return TERRAIN_DATA[state.grid[row][col]]
}
