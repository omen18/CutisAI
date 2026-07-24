// ─── Enums ────────────────────────────────────────────────────────────────────

export type Player = 'BLUE' | 'RED'
export type UnitType = 'INFANTRY' | 'ARMOR' | 'ARTILLERY'
export type TerrainType = 'PLAINS' | 'FOREST' | 'HILLS' | 'WATER'
export type ActionType = 'ATTACK' | 'DEFEND' | 'RETREAT'
export type GameMode = 'HUMAN_VS_AI' | 'AI_VS_AI'
export type GamePhase = 'SETUP' | 'PLAYING' | 'GAME_OVER'

// ─── Unit ─────────────────────────────────────────────────────────────────────

export interface Unit {
  id: string
  player: Player
  type: UnitType
  hp: number
  maxHp: number
  stamina: number
  maxStamina: number
  attack: number
  defense: number
  range: number
  row: number
  col: number
  isDefending: boolean
}

// ─── Terrain ──────────────────────────────────────────────────────────────────

export interface TerrainCell {
  type: TerrainType
  moveCost: number
  defenseBonus: number
  attackPenalty: number
  passable: boolean
}

// ─── Game State ───────────────────────────────────────────────────────────────

export interface BattleState {
  grid: TerrainType[][]
  units: Unit[]
  currentPlayer: Player
  turn: number
  phase: GamePhase
  winner: Player | null
  lastAction: BattleAction | null
  pruningStats: PruningStats
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export interface BattleAction {
  unitId: string
  type: ActionType
  targetId?: string
  fromRow?: number
  fromCol?: number
  toRow?: number
  toCol?: number
  damageDealt?: number
  description: string
}

// ─── AI Decision ──────────────────────────────────────────────────────────────

export interface AIDecision {
  action: BattleAction
  score: number
  reasoning: string
  depth: number
  nodesExplored: number
  pruned: number
}

// ─── Pruning Stats ────────────────────────────────────────────────────────────

export interface PruningStats {
  nodesExplored: number
  nodesPruned: number
  efficiency: number
}

// ─── Log Entry ────────────────────────────────────────────────────────────────

export interface LogEntry {
  turn: number
  player: Player
  action: BattleAction
  timestamp: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const GRID_ROWS = 8
export const GRID_COLS = 10

export const UNIT_STATS: Record<UnitType, {
  hp: number; stamina: number; attack: number; defense: number; range: number; symbol: string; label: string
}> = {
  INFANTRY: {
    hp: 100, stamina: 100, attack: 30, defense: 20, range: 1,
    symbol: '⚔', label: 'Infantry'
  },
  ARMOR: {
    hp: 150, stamina: 80, attack: 45, defense: 40, range: 1,
    symbol: '🛡', label: 'Armor'
  },
  ARTILLERY: {
    hp: 70, stamina: 60, attack: 60, defense: 10, range: 3,
    symbol: '🎯', label: 'Artillery'
  },
}

export const TERRAIN_DATA: Record<TerrainType, TerrainCell> = {
  PLAINS: {
    type: 'PLAINS', moveCost: 1, defenseBonus: 0, attackPenalty: 0, passable: true
  },
  FOREST: {
    type: 'FOREST', moveCost: 2, defenseBonus: 15, attackPenalty: 10, passable: true
  },
  HILLS: {
    type: 'HILLS', moveCost: 2, defenseBonus: 20, attackPenalty: 5, passable: true
  },
  WATER: {
    type: 'WATER', moveCost: 3, defenseBonus: -10, attackPenalty: 20, passable: false
  },
}

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  PLAINS: 'Plains',
  FOREST: 'Forest',
  HILLS: 'Hills',
  WATER: 'Water',
}

export const TERRAIN_COLOR: Record<TerrainType, string> = {
  PLAINS: '#1a2218',
  FOREST: '#0f1f10',
  HILLS:  '#1a1a14',
  WATER:  '#0d1a20',
}

export const PLAYER_COLORS: Record<Player, { primary: string; bg: string; border: string }> = {
  BLUE: { primary: '#1a6b8a', bg: 'rgba(26,107,138,0.2)', border: '#1a6b8a' },
  RED:  { primary: '#8b1a1a', bg: 'rgba(139,26,26,0.2)', border: '#8b1a1a' },
}
