// Roulette wheel types (American roulette with 0 and 00)
export type RouletteNumber =
  | 0 | '00'
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36;

export type BetType =
  | 'straight'
  | 'split'
  | 'street'
  | 'corner'
  | 'double_street'
  | 'dozen'
  | 'column'
  | 'even_money';

export type DozenType = '1st' | '2nd' | '3rd';
export type ColumnType = '1st' | '2nd' | '3rd';
export type EvenMoneyType = '1-18' | '19-36' | 'red' | 'black' | 'odd' | 'even';

// Bet detail type depends on bet type
export type StraightBetDetail = number;
export type SplitBetDetail = [number, number];
export type StreetBetDetail = number; // starting number of the row
export type CornerBetDetail = [number, number, number, number];
export type DoubleStreetBetDetail = number; // starting number
export type DozenBetDetail = DozenType;
export type ColumnBetDetail = ColumnType;
export type EvenMoneyBetDetail = EvenMoneyType;

export type BetDetail =
  | StraightBetDetail
  | SplitBetDetail
  | StreetBetDetail
  | CornerBetDetail
  | DoubleStreetBetDetail
  | DozenBetDetail
  | ColumnBetDetail
  | EvenMoneyBetDetail;

export type BetSizing = number | 'all-in' | 'half-bankroll' | 'let-it-ride';

export interface Bet {
  betType: BetType;
  betAmount: BetSizing;
  betDetail: BetDetail;
}

export interface BetStep {
  id: string;
  bets: Bet[];
  continueOnWin: boolean;
  resetOnLoss: boolean;
  nextStepOnWin?: string; // step id to go to on win, undefined = next step
  nextStepOnLoss?: string; // step id to go to on loss, undefined = reset
}

export interface BettingStrategy {
  id: string;
  name: string;
  description: string;
  steps: BetStep[];
  initialBankroll: number;
  targetBankroll: number;
  maxIterations: number;
  maxDrawdown?: number;
  createdAt: number;
  modifiedAt: number;
  isPreloaded?: boolean;
}

export interface SpinResult {
  number: RouletteNumber;
  isWin: boolean;
  payout: number;
  profit: number;
  stepId: string;
}

export interface SingleSimulationResult {
  finalBankroll: number;
  iterations: number;
  goalReached: boolean;
  maxDrawdown: number;
  bankrollHistory: number[];
  spinResults: SpinResult[];
  endReason: 'goal_reached' | 'bankruptcy' | 'max_iterations' | 'max_drawdown';
}

export interface SimulationResults {
  strategyId: string;
  strategyName: string;
  numSimulations: number;
  successRate: number;
  avgFinalBankroll: number;
  avgIterationsToSuccess: number;
  bankruptcyCount: number;
  profitCount: number;
  maxDrawdownAvg: number;
  expectedValue: number;
  finalBankrollDistribution: number[];
  allSimulations: SingleSimulationResult[];
  timestamp: number;
}

export interface SimulationParameters {
  strategy: BettingStrategy;
  numSimulations: number;
  showRealTime: boolean;
}

export interface UserPreferences {
  defaultSimulationCount: number;
  chartType: 'line' | 'bar' | 'area';
  theme: 'light' | 'dark';
  showProbabilities: boolean;
  animateSimulations: boolean;
}

export interface SavedData {
  strategies: BettingStrategy[];
  simulationHistory: SimulationResults[];
  userPreferences: UserPreferences;
  version: string;
}

// Worker message types
export interface SimulationWorkerMessage {
  type: 'start' | 'stop' | 'progress';
  payload?: {
    strategy?: BettingStrategy;
    numSimulations?: number;
    progress?: number;
    currentSimulation?: number;
    result?: SimulationResults;
  };
}

export interface SimulationWorkerResponse {
  type: 'progress' | 'complete' | 'error' | 'single_complete';
  payload: {
    progress?: number;
    currentSimulation?: number;
    singleResult?: SingleSimulationResult;
    results?: SimulationResults;
    error?: string;
  };
}

// Payout multipliers for each bet type
export const PAYOUTS: Record<BetType, number> = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  double_street: 5,
  dozen: 2,
  column: 2,
  even_money: 1,
};

// Probabilities for American roulette (38 numbers total: 0-36 plus 00)
export const PROBABILITIES: Record<BetType, number> = {
  straight: 1 / 38,
  split: 2 / 38,
  street: 3 / 38,
  corner: 4 / 38,
  double_street: 6 / 38,
  dozen: 12 / 38,
  column: 12 / 38,
  even_money: 18 / 38,
};

// Red numbers on American roulette wheel
export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// All wheel numbers including 0 and 00
export const ALL_NUMBERS: RouletteNumber[] = [
  0, '00', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36
];

// Bet type display names
export const BET_TYPE_NAMES: Record<BetType, string> = {
  straight: 'Straight (Single Number)',
  split: 'Split (Two Numbers)',
  street: 'Street (Three Numbers)',
  corner: 'Corner (Four Numbers)',
  double_street: 'Double Street (Six Numbers)',
  dozen: 'Dozen (12 Numbers)',
  column: 'Column (12 Numbers)',
  even_money: 'Even Money (18 Numbers)',
};

// Chart color palette (colorblind-friendly)
export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#6366F1',
  neutral: '#6B7280',
  purple: '#8B5CF6',
  pink: '#EC4899',
};
