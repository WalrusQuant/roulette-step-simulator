import { BettingStrategy } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pre-loaded betting strategies based on classic roulette systems
 */
export const PRELOADED_STRATEGIES: BettingStrategy[] = [
  {
    id: 'mod-tie-fighter',
    name: 'MOD Tie Fighter',
    description: 'A multi-bet strategy covering the 2nd dozen with supporting double streets and corners. Aims for consistent small wins.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'dozen', betAmount: 10, betDetail: '2nd' },
          { betType: 'double_street', betAmount: 5, betDetail: 1 },
          { betType: 'double_street', betAmount: 5, betDetail: 31 },
          { betType: 'corner', betAmount: 5, betDetail: [8, 9, 11, 12] },
          { betType: 'corner', betAmount: 5, betDetail: [26, 27, 29, 30] },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 100,
    maxDrawdown: 250,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'double-street-straight',
    name: 'Double Street Straight',
    description: 'A progressive double street bet with an increasing straight bet. Reset on any win.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 10, betDetail: 13 },
          { betType: 'straight', betAmount: 2, betDetail: 17 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 20, betDetail: 13 },
          { betType: 'straight', betAmount: 4, betDetail: 17 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 40, betDetail: 13 },
          { betType: 'straight', betAmount: 8, betDetail: 17 },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 50,
    maxDrawdown: 200,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'double-street-mod',
    name: 'Double Street Mod',
    description: 'Modified double street with coverage on multiple lines. A balanced approach to table coverage.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 6, betDetail: 1 },
          { betType: 'double_street', betAmount: 6, betDetail: 13 },
          { betType: 'double_street', betAmount: 6, betDetail: 25 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 12, betDetail: 1 },
          { betType: 'double_street', betAmount: 12, betDetail: 13 },
          { betType: 'double_street', betAmount: 12, betDetail: 25 },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 40,
    maxDrawdown: 150,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'double-street-125',
    name: 'Double Street 125',
    description: 'A 125-unit double street progression. Start small, increase on losses to recover.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 1, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 2, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 5, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 10, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 20, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 40, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'double_street', betAmount: 47, betDetail: 7 },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 250,
    targetBankroll: 260,
    maxIterations: 100,
    maxDrawdown: 125,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'random-number-dozens',
    name: 'Random Number Dozens',
    description: 'Bet on two dozens with a small straight bet for potential big wins. A coverage strategy with upside potential.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'dozen', betAmount: 5, betDetail: '1st' },
          { betType: 'dozen', betAmount: 5, betDetail: '2nd' },
          { betType: 'straight', betAmount: 1, betDetail: 29 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'dozen', betAmount: 10, betDetail: '1st' },
          { betType: 'dozen', betAmount: 10, betDetail: '2nd' },
          { betType: 'straight', betAmount: 2, betDetail: 29 },
        ],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'dozen', betAmount: 20, betDetail: '1st' },
          { betType: 'dozen', betAmount: 20, betDetail: '2nd' },
          { betType: 'straight', betAmount: 4, betDetail: 29 },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 50,
    maxDrawdown: 200,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'progressive-let-it-ride',
    name: 'Progressive Let-It-Ride',
    description: 'Start with even money bets and let winnings ride on subsequent spins. High risk, high reward strategy.',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'even_money', betAmount: 10, betDetail: 'red' },
        ],
        continueOnWin: true,
        resetOnLoss: true,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'even_money', betAmount: 'let-it-ride', betDetail: 'black' },
        ],
        continueOnWin: true,
        resetOnLoss: true,
      },
      {
        id: uuidv4(),
        bets: [
          { betType: 'dozen', betAmount: 'let-it-ride', betDetail: '2nd' },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 200,
    targetBankroll: 400,
    maxIterations: 100,
    maxDrawdown: 100,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'martingale-red',
    name: 'Classic Martingale (Red)',
    description: 'The classic Martingale system: double your bet after each loss on red. Demonstrates why this system fails long-term.',
    steps: [
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 5, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 10, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 20, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 40, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 80, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 160, betDetail: 'red' }],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 200,
    maxDrawdown: 315,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
  {
    id: 'dalembert-system',
    name: "D'Alembert System",
    description: "A safer progression than Martingale. Increase bet by 1 unit after loss, decrease by 1 after win.",
    steps: [
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 10, betDetail: 'black' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 15, betDetail: 'black' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 20, betDetail: 'black' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 25, betDetail: 'black' }],
        continueOnWin: false,
        resetOnLoss: false,
      },
      {
        id: uuidv4(),
        bets: [{ betType: 'even_money', betAmount: 30, betDetail: 'black' }],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 300,
    targetBankroll: 400,
    maxIterations: 100,
    maxDrawdown: 150,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: true,
  },
];

/**
 * Get a preloaded strategy by ID
 */
export function getPreloadedStrategy(id: string): BettingStrategy | undefined {
  return PRELOADED_STRATEGIES.find(s => s.id === id);
}

/**
 * Create a blank strategy template
 */
export function createBlankStrategy(): BettingStrategy {
  return {
    id: `custom-${Date.now()}`,
    name: 'New Strategy',
    description: 'A custom betting strategy',
    steps: [
      {
        id: uuidv4(),
        bets: [
          { betType: 'even_money', betAmount: 10, betDetail: 'red' },
        ],
        continueOnWin: false,
        resetOnLoss: true,
      },
    ],
    initialBankroll: 500,
    targetBankroll: 600,
    maxIterations: 100,
    maxDrawdown: 250,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    isPreloaded: false,
  };
}
