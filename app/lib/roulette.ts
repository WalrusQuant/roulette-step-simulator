import {
  RouletteNumber,
  BetType,
  Bet,
  BetStep,
  BettingStrategy,
  SpinResult,
  SingleSimulationResult,
  ColumnType,
  DozenType,
  EvenMoneyType,
  PAYOUTS,
  PROBABILITIES,
  RED_NUMBERS,
  ALL_NUMBERS,
} from './types';

/**
 * Spin the American roulette wheel and return a random number
 */
export function spinWheel(): RouletteNumber {
  const index = Math.floor(Math.random() * 38);
  return ALL_NUMBERS[index];
}

/**
 * Convert a roulette number to a numeric value for calculations
 */
export function toNumeric(num: RouletteNumber): number {
  if (num === '00') return -1; // Special case for 00
  return num;
}

/**
 * Check if a straight bet (single number) wins
 */
export function checkStraightBet(number: RouletteNumber, betNumber: number): boolean {
  const num = toNumeric(number);
  return num === betNumber;
}

/**
 * Check if a split bet (two adjacent numbers) wins
 */
export function checkSplitBet(number: RouletteNumber, betNumbers: [number, number]): boolean {
  const num = toNumeric(number);
  return betNumbers.includes(num);
}

/**
 * Check if a street bet (row of three) wins
 * streetStart should be 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, or 34
 */
export function checkStreetBet(number: RouletteNumber, streetStart: number): boolean {
  const num = toNumeric(number);
  if (num < 0) return false; // 0 and 00 don't win street bets
  return num >= streetStart && num < streetStart + 3;
}

/**
 * Check if a corner bet (four numbers forming a square) wins
 */
export function checkCornerBet(
  number: RouletteNumber,
  cornerNumbers: [number, number, number, number]
): boolean {
  const num = toNumeric(number);
  return cornerNumbers.includes(num);
}

/**
 * Check if a double street bet (two rows, six numbers) wins
 * doubleStreetStart should be 1, 7, 13, 19, 25, or 31
 */
export function checkDoubleStreetBet(number: RouletteNumber, doubleStreetStart: number): boolean {
  const num = toNumeric(number);
  if (num < 0) return false;
  return num >= doubleStreetStart && num < doubleStreetStart + 6;
}

/**
 * Check if a column bet wins
 * 1st column: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
 * 2nd column: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
 * 3rd column: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
 */
export function checkColumnBet(number: RouletteNumber, column: ColumnType): boolean {
  const num = toNumeric(number);
  if (num <= 0) return false; // 0 and 00 don't win column bets

  const columnRemainder = num % 3;
  switch (column) {
    case '1st':
      return columnRemainder === 1;
    case '2nd':
      return columnRemainder === 2;
    case '3rd':
      return columnRemainder === 0;
    default:
      return false;
  }
}

/**
 * Check if a dozen bet wins
 * 1st dozen: 1-12
 * 2nd dozen: 13-24
 * 3rd dozen: 25-36
 */
export function checkDozenBet(number: RouletteNumber, dozen: DozenType): boolean {
  const num = toNumeric(number);
  if (num <= 0) return false; // 0 and 00 don't win dozen bets

  switch (dozen) {
    case '1st':
      return num >= 1 && num <= 12;
    case '2nd':
      return num >= 13 && num <= 24;
    case '3rd':
      return num >= 25 && num <= 36;
    default:
      return false;
  }
}

/**
 * Check if an even money bet wins
 */
export function checkEvenMoneyBet(number: RouletteNumber, betType: EvenMoneyType): boolean {
  const num = toNumeric(number);
  if (num <= 0) return false; // 0 and 00 lose all even money bets

  switch (betType) {
    case '1-18':
      return num >= 1 && num <= 18;
    case '19-36':
      return num >= 19 && num <= 36;
    case 'red':
      return RED_NUMBERS.includes(num);
    case 'black':
      return !RED_NUMBERS.includes(num);
    case 'odd':
      return num % 2 === 1;
    case 'even':
      return num % 2 === 0;
    default:
      return false;
  }
}

/**
 * Check if a bet wins for the given number
 */
export function checkBet(number: RouletteNumber, bet: Bet): boolean {
  const { betType, betDetail } = bet;

  switch (betType) {
    case 'straight':
      return checkStraightBet(number, betDetail as number);
    case 'split':
      return checkSplitBet(number, betDetail as [number, number]);
    case 'street':
      return checkStreetBet(number, betDetail as number);
    case 'corner':
      return checkCornerBet(number, betDetail as [number, number, number, number]);
    case 'double_street':
      return checkDoubleStreetBet(number, betDetail as number);
    case 'column':
      return checkColumnBet(number, betDetail as ColumnType);
    case 'dozen':
      return checkDozenBet(number, betDetail as DozenType);
    case 'even_money':
      return checkEvenMoneyBet(number, betDetail as EvenMoneyType);
    default:
      return false;
  }
}

/**
 * Calculate payout for a winning bet
 */
export function calculatePayout(betType: BetType, betAmount: number): number {
  return betAmount * PAYOUTS[betType] + betAmount; // Return includes original bet
}

/**
 * Get the probability of winning a bet type
 */
export function getBetProbability(betType: BetType): number {
  return PROBABILITIES[betType];
}

/**
 * Calculate actual bet amount based on sizing and current bankroll
 */
export function calculateBetAmount(
  sizing: number | 'all-in' | 'half-bankroll' | 'let-it-ride',
  bankroll: number,
  previousWinnings: number = 0
): number {
  switch (sizing) {
    case 'all-in':
      return bankroll;
    case 'half-bankroll':
      return Math.floor(bankroll / 2);
    case 'let-it-ride':
      return previousWinnings > 0 ? previousWinnings : bankroll;
    default:
      return Math.min(sizing, bankroll);
  }
}

/**
 * Handle multiple bets on a single spin
 */
export function handleMultipleBets(
  number: RouletteNumber,
  bets: Bet[],
  bankroll: number,
  previousWinnings: number = 0
): { totalPayout: number; profit: number; totalBetAmount: number; anyWin: boolean } {
  let totalPayout = 0;
  let totalBetAmount = 0;
  let anyWin = false;

  for (const bet of bets) {
    const betAmount = calculateBetAmount(bet.betAmount, bankroll, previousWinnings);
    totalBetAmount += betAmount;

    if (checkBet(number, bet)) {
      totalPayout += calculatePayout(bet.betType, betAmount);
      anyWin = true;
    }
  }

  const profit = totalPayout - totalBetAmount;
  return { totalPayout, profit, totalBetAmount, anyWin };
}

/**
 * Calculate expected value for a betting strategy step
 */
export function calculateExpectedValue(bets: Bet[], baseAmount: number = 1): number {
  let totalEV = 0;

  for (const bet of bets) {
    const amount = typeof bet.betAmount === 'number' ? bet.betAmount : baseAmount;
    const probability = getBetProbability(bet.betType);
    const payout = PAYOUTS[bet.betType];

    // EV = P(win) * winnings - P(loss) * bet amount
    // For American roulette, house edge is 5.26%
    const ev = probability * (payout * amount) - (1 - probability) * amount;
    totalEV += ev;
  }

  return totalEV;
}

/**
 * Run a single simulation of a betting strategy
 */
export function runSingleSimulation(strategy: BettingStrategy): SingleSimulationResult {
  let bankroll = strategy.initialBankroll;
  const bankrollHistory: number[] = [bankroll];
  const spinResults: SpinResult[] = [];
  let maxBankroll = bankroll;
  let maxDrawdown = 0;
  let iterations = 0;
  let currentStepIndex = 0;
  let previousWinnings = 0;

  while (
    bankroll > 0 &&
    bankroll < strategy.targetBankroll &&
    iterations < strategy.maxIterations
  ) {
    const currentStep = strategy.steps[currentStepIndex];

    if (!currentStep) {
      // No more steps, reset to beginning
      currentStepIndex = 0;
      previousWinnings = 0;
      continue;
    }

    // Calculate total bet amount for this step
    let totalBetAmount = 0;
    for (const bet of currentStep.bets) {
      totalBetAmount += calculateBetAmount(bet.betAmount, bankroll, previousWinnings);
    }

    // Skip if can't afford the bets
    if (totalBetAmount > bankroll) {
      break;
    }

    // Spin the wheel
    const number = spinWheel();
    const result = handleMultipleBets(number, currentStep.bets, bankroll, previousWinnings);

    // Update bankroll
    bankroll = bankroll - result.totalBetAmount + result.totalPayout;
    bankrollHistory.push(bankroll);

    // Track max bankroll and drawdown
    if (bankroll > maxBankroll) {
      maxBankroll = bankroll;
    }
    const currentDrawdown = maxBankroll - bankroll;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    // Check max drawdown limit
    if (strategy.maxDrawdown && currentDrawdown >= strategy.maxDrawdown) {
      spinResults.push({
        number,
        isWin: result.anyWin,
        payout: result.totalPayout,
        profit: result.profit,
        stepId: currentStep.id,
      });

      return {
        finalBankroll: bankroll,
        iterations: iterations + 1,
        goalReached: false,
        maxDrawdown,
        bankrollHistory,
        spinResults,
        endReason: 'max_drawdown',
      };
    }

    // Record spin result
    spinResults.push({
      number,
      isWin: result.anyWin,
      payout: result.totalPayout,
      profit: result.profit,
      stepId: currentStep.id,
    });

    // Determine next step
    if (result.anyWin) {
      previousWinnings = result.totalPayout;
      if (currentStep.continueOnWin) {
        // Move to next step or wrap around
        if (currentStep.nextStepOnWin) {
          const nextIndex = strategy.steps.findIndex(s => s.id === currentStep.nextStepOnWin);
          currentStepIndex = nextIndex >= 0 ? nextIndex : currentStepIndex + 1;
        } else {
          currentStepIndex++;
        }
        if (currentStepIndex >= strategy.steps.length) {
          currentStepIndex = 0;
          previousWinnings = 0;
        }
      } else {
        // Reset on win
        currentStepIndex = 0;
        previousWinnings = 0;
      }
    } else {
      previousWinnings = 0;
      if (currentStep.resetOnLoss) {
        currentStepIndex = 0;
      } else {
        // Move to next step or use custom navigation
        if (currentStep.nextStepOnLoss) {
          const nextIndex = strategy.steps.findIndex(s => s.id === currentStep.nextStepOnLoss);
          currentStepIndex = nextIndex >= 0 ? nextIndex : currentStepIndex + 1;
        } else {
          currentStepIndex++;
        }
        if (currentStepIndex >= strategy.steps.length) {
          currentStepIndex = 0;
        }
      }
    }

    iterations++;
  }

  // Determine end reason
  let endReason: SingleSimulationResult['endReason'];
  if (bankroll <= 0) {
    endReason = 'bankruptcy';
  } else if (bankroll >= strategy.targetBankroll) {
    endReason = 'goal_reached';
  } else {
    endReason = 'max_iterations';
  }

  return {
    finalBankroll: bankroll,
    iterations,
    goalReached: bankroll >= strategy.targetBankroll,
    maxDrawdown,
    bankrollHistory,
    spinResults,
    endReason,
  };
}

/**
 * Get the color of a roulette number
 */
export function getNumberColor(num: RouletteNumber): 'red' | 'black' | 'green' {
  if (num === 0 || num === '00') return 'green';
  const numValue = typeof num === 'number' ? num : 0;
  return RED_NUMBERS.includes(numValue) ? 'red' : 'black';
}

/**
 * Format a bet for display
 */
export function formatBet(bet: Bet): string {
  const { betType, betDetail, betAmount } = bet;
  let amountStr = '';

  if (typeof betAmount === 'number') {
    amountStr = `$${betAmount}`;
  } else if (betAmount === 'all-in') {
    amountStr = 'All-In';
  } else if (betAmount === 'half-bankroll') {
    amountStr = 'Half Bankroll';
  } else {
    amountStr = 'Let It Ride';
  }

  let detailStr = '';
  switch (betType) {
    case 'straight':
      detailStr = `Number ${betDetail}`;
      break;
    case 'split':
      detailStr = `${(betDetail as [number, number]).join('-')}`;
      break;
    case 'street':
      detailStr = `Row ${betDetail}-${(betDetail as number) + 2}`;
      break;
    case 'corner':
      detailStr = `${(betDetail as number[]).join(',')}`;
      break;
    case 'double_street':
      detailStr = `${betDetail}-${(betDetail as number) + 5}`;
      break;
    case 'dozen':
      detailStr = `${betDetail} Dozen`;
      break;
    case 'column':
      detailStr = `${betDetail} Column`;
      break;
    case 'even_money':
      detailStr = `${betDetail}`;
      break;
  }

  return `${amountStr} on ${detailStr}`;
}

/**
 * Validate a betting strategy
 */
export function validateStrategy(strategy: BettingStrategy): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!strategy.name || strategy.name.trim().length === 0) {
    errors.push('Strategy name is required');
  }

  if (strategy.steps.length === 0) {
    errors.push('Strategy must have at least one step');
  }

  if (strategy.initialBankroll <= 0) {
    errors.push('Initial bankroll must be positive');
  }

  if (strategy.targetBankroll <= strategy.initialBankroll) {
    errors.push('Target bankroll must be greater than initial bankroll');
  }

  if (strategy.maxIterations <= 0) {
    errors.push('Max iterations must be positive');
  }

  for (const step of strategy.steps) {
    if (step.bets.length === 0) {
      errors.push(`Step "${step.id}" must have at least one bet`);
    }
  }

  return { valid: errors.length === 0, errors };
}
