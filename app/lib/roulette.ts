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
  BetSizing,
  WinTier,
  StepAction,
  StepActionType,
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
 * Context for calculating bet amounts in advanced mode
 */
export interface BetContext {
  bankroll: number;
  carryAmount: number;        // Amount carried from previous step
  bulletSize: number;         // Fixed bullet size from strategy
  numBetsInStep: number;      // Number of bets in current step (for carry_split)
  previousWinnings: number;   // Legacy: for let-it-ride
}

/**
 * Calculate actual bet amount based on sizing and context
 */
export function calculateBetAmount(
  sizing: BetSizing,
  bankroll: number,
  previousWinnings: number = 0
): number {
  // Legacy sizing options
  switch (sizing) {
    case 'all-in':
      return bankroll;
    case 'half-bankroll':
      return Math.floor(bankroll / 2);
    case 'let-it-ride':
      return previousWinnings > 0 ? previousWinnings : bankroll;
    default:
      if (typeof sizing === 'number') {
        return Math.min(sizing, bankroll);
      }
      // New sizing options handled by calculateBetAmountAdvanced
      return 0;
  }
}

/**
 * Calculate bet amount with full context (for advanced step progression)
 */
export function calculateBetAmountAdvanced(
  sizing: BetSizing,
  context: BetContext
): number {
  const { bankroll, carryAmount, bulletSize, numBetsInStep, previousWinnings } = context;

  if (typeof sizing === 'number') {
    return Math.min(sizing, bankroll);
  }

  switch (sizing) {
    case 'all-in':
      return bankroll;
    case 'half-bankroll':
      return Math.floor(bankroll / 2);
    case 'let-it-ride':
      return previousWinnings > 0 ? previousWinnings : bankroll;
    case 'bullet':
      return Math.min(bulletSize, bankroll);
    case 'carry':
      return carryAmount;
    case 'carry_split':
      return numBetsInStep > 0 ? Math.floor(carryAmount / numBetsInStep) : carryAmount;
    default:
      return 0;
  }
}

/**
 * Handle multiple bets on a single spin (legacy)
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
 * Handle multiple bets with advanced context (for win tier system)
 */
export function handleMultipleBetsAdvanced(
  number: RouletteNumber,
  bets: Bet[],
  context: BetContext
): { totalPayout: number; profit: number; totalBetAmount: number; anyWin: boolean; winsCount: number } {
  let totalPayout = 0;
  let totalBetAmount = 0;
  let anyWin = false;
  let winsCount = 0;

  // Update context with number of bets for carry_split calculation
  const betContext = { ...context, numBetsInStep: bets.length };

  for (const bet of bets) {
    const betAmount = calculateBetAmountAdvanced(bet.betAmount, betContext);
    totalBetAmount += betAmount;

    if (checkBet(number, bet)) {
      totalPayout += calculatePayout(bet.betType, betAmount);
      anyWin = true;
      winsCount++;
    }
  }

  const profit = totalPayout - totalBetAmount;
  return { totalPayout, profit, totalBetAmount, anyWin, winsCount };
}

/**
 * Find the matching win tier for a given payout
 * Win tiers are evaluated in order - first match wins
 */
export function findMatchingWinTier(winTiers: WinTier[], payout: number): WinTier | null {
  for (const tier of winTiers) {
    const meetsMin = payout >= tier.minPayout;
    const meetsMax = tier.maxPayout === undefined || payout < tier.maxPayout;
    if (meetsMin && meetsMax) {
      return tier;
    }
  }
  return null;
}

/**
 * Check if a step uses the advanced win tier system
 */
export function isAdvancedStep(step: BetStep): boolean {
  return step.winTiers !== undefined && step.winTiers.length > 0;
}

/**
 * Check if a strategy uses the advanced system (has bulletSize or any step with winTiers)
 */
export function isAdvancedStrategy(strategy: BettingStrategy): boolean {
  if (strategy.bulletSize !== undefined) return true;
  return strategy.steps.some(step => isAdvancedStep(step));
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
 * Execute a step action and return the new state
 */
function executeStepAction(
  action: StepAction,
  currentStepIndex: number,
  payout: number,
  strategy: BettingStrategy
): { newStepIndex: number; newCarry: number; pocketAmount: number } {
  let pocketAmount = 0;
  let newCarry = 0;

  // Handle pocketing
  if (action.pocket !== undefined) {
    if (action.pocket === 'all') {
      pocketAmount = payout;
    } else {
      pocketAmount = Math.min(action.pocket, payout);
    }
  }

  // Handle carry forward
  if (action.carryAmount !== undefined) {
    if (action.carryAmount === 'all') {
      newCarry = payout;
    } else if (action.carryAmount === 'remainder') {
      newCarry = payout - pocketAmount;
    } else {
      newCarry = Math.min(action.carryAmount, payout - pocketAmount);
    }
  }

  // Determine next step index
  let newStepIndex = currentStepIndex;
  switch (action.type) {
    case 'next_step':
      newStepIndex = currentStepIndex + 1;
      if (newStepIndex >= strategy.steps.length) {
        newStepIndex = 0; // Wrap around = restart
      }
      break;
    case 'repeat_step':
      newStepIndex = currentStepIndex; // Stay on same step
      break;
    case 'goto_step':
      if (action.targetStepId) {
        const targetIndex = strategy.steps.findIndex(s => s.id === action.targetStepId);
        newStepIndex = targetIndex >= 0 ? targetIndex : 0;
      }
      break;
    case 'restart':
      newStepIndex = 0;
      newCarry = 0; // Clear carry on restart
      break;
  }

  return { newStepIndex, newCarry, pocketAmount };
}

/**
 * Run a single simulation of a betting strategy
 * Supports both legacy mode and advanced win tier mode
 */
export function runSingleSimulation(strategy: BettingStrategy): SingleSimulationResult {
  const useAdvancedMode = isAdvancedStrategy(strategy);
  const bulletSize = strategy.bulletSize || strategy.initialBankroll; // Default to bankroll if no bullet

  let bankroll = strategy.initialBankroll;
  const bankrollHistory: number[] = [bankroll];
  const spinResults: SpinResult[] = [];
  let maxBankroll = bankroll;
  let maxDrawdown = 0;
  let iterations = 0;
  let currentStepIndex = 0;
  let carryAmount = 0;           // Money carried between steps (not in bankroll)
  let previousWinnings = 0;      // Legacy: for let-it-ride
  let insufficientFunds = false;
  let completedCycles = 0;

  while (
    bankroll > 0 &&
    bankroll < strategy.targetBankroll &&
    iterations < strategy.maxIterations
  ) {
    const currentStep = strategy.steps[currentStepIndex];

    if (!currentStep) {
      // No more steps, reset to beginning
      currentStepIndex = 0;
      carryAmount = 0;
      previousWinnings = 0;
      completedCycles++;
      continue;
    }

    // For step 0 in advanced mode, take a new bullet from bankroll
    if (useAdvancedMode && currentStepIndex === 0 && carryAmount === 0) {
      if (bankroll < bulletSize) {
        insufficientFunds = true;
        break;
      }
      // Take bullet from bankroll into carry
      bankroll -= bulletSize;
      carryAmount = bulletSize;
    }

    // Build bet context
    const betContext: BetContext = {
      bankroll,
      carryAmount,
      bulletSize,
      numBetsInStep: currentStep.bets.length,
      previousWinnings,
    };

    // Calculate total bet amount for this step
    let totalBetAmount = 0;
    for (const bet of currentStep.bets) {
      if (useAdvancedMode) {
        totalBetAmount += calculateBetAmountAdvanced(bet.betAmount, betContext);
      } else {
        totalBetAmount += calculateBetAmount(bet.betAmount, bankroll, previousWinnings);
      }
    }

    // Can't afford the bets
    if (useAdvancedMode) {
      // In advanced mode, bets come from carry, not bankroll
      if (totalBetAmount > carryAmount) {
        // Can't continue - treat as loss and restart
        currentStepIndex = 0;
        carryAmount = 0;
        continue;
      }
    } else {
      if (totalBetAmount > bankroll) {
        insufficientFunds = true;
        break;
      }
    }

    // Spin the wheel
    const number = spinWheel();
    let result;
    if (useAdvancedMode) {
      result = handleMultipleBetsAdvanced(number, currentStep.bets, betContext);
    } else {
      result = { ...handleMultipleBets(number, currentStep.bets, bankroll, previousWinnings), winsCount: 0 };
    }

    // Update bankroll/carry based on mode
    if (useAdvancedMode) {
      // In advanced mode, bets come from carry, payout goes to carry
      carryAmount = carryAmount - result.totalBetAmount + result.totalPayout;
    } else {
      bankroll = bankroll - result.totalBetAmount + result.totalPayout;
    }

    // Record bankroll for history (in advanced mode, add carry to show total value)
    const totalValue = useAdvancedMode ? bankroll + carryAmount : bankroll;
    bankrollHistory.push(totalValue);

    // Track max bankroll and drawdown
    if (totalValue > maxBankroll) {
      maxBankroll = totalValue;
    }
    const currentDrawdown = maxBankroll - totalValue;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    // Determine action to take
    let tierTriggered: string | undefined;
    let actionTaken: StepActionType;
    const originalStepIndex = currentStepIndex; // Save before action modifies it

    if (useAdvancedMode && isAdvancedStep(currentStep)) {
      // Advanced mode with win tiers
      if (result.anyWin && currentStep.winTiers) {
        const matchingTier = findMatchingWinTier(currentStep.winTiers, result.totalPayout);
        if (matchingTier) {
          tierTriggered = matchingTier.name;
          actionTaken = matchingTier.action.type;

          const actionResult = executeStepAction(
            matchingTier.action,
            currentStepIndex,
            carryAmount,
            strategy
          );

          // Pocket goes to bankroll
          bankroll += actionResult.pocketAmount;
          carryAmount = actionResult.newCarry;

          // Track cycle completion
          if (actionResult.newStepIndex === 0 && currentStepIndex !== 0) {
            completedCycles++;
          }
          currentStepIndex = actionResult.newStepIndex;
        } else {
          // Win but no matching tier - default to next step
          actionTaken = 'next_step';
          currentStepIndex++;
          if (currentStepIndex >= strategy.steps.length) {
            currentStepIndex = 0;
            completedCycles++;
          }
        }
      } else {
        // Loss - use onLoss action or default restart
        actionTaken = currentStep.onLoss?.type || 'restart';
        if (currentStep.onLoss) {
          const actionResult = executeStepAction(
            currentStep.onLoss,
            currentStepIndex,
            carryAmount,
            strategy
          );
          bankroll += actionResult.pocketAmount;
          carryAmount = actionResult.newCarry;
          currentStepIndex = actionResult.newStepIndex;
        } else {
          // Default: restart on loss
          currentStepIndex = 0;
          carryAmount = 0;
        }
      }
    } else {
      // Legacy mode
      if (result.anyWin) {
        previousWinnings = result.totalPayout;
        actionTaken = currentStep.continueOnWin ? 'next_step' : 'restart';

        if (currentStep.continueOnWin) {
          if (currentStep.nextStepOnWin) {
            const nextIndex = strategy.steps.findIndex(s => s.id === currentStep.nextStepOnWin);
            currentStepIndex = nextIndex >= 0 ? nextIndex : currentStepIndex + 1;
          } else {
            currentStepIndex++;
          }
          if (currentStepIndex >= strategy.steps.length) {
            currentStepIndex = 0;
            previousWinnings = 0;
            completedCycles++;
          }
        } else {
          currentStepIndex = 0;
          previousWinnings = 0;
        }
      } else {
        previousWinnings = 0;
        actionTaken = currentStep.resetOnLoss ? 'restart' : 'next_step';

        if (currentStep.resetOnLoss) {
          currentStepIndex = 0;
        } else {
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
    }

    // Check max drawdown limit
    if (strategy.maxDrawdown && currentDrawdown >= strategy.maxDrawdown) {
      spinResults.push({
        number,
        isWin: result.anyWin,
        payout: result.totalPayout,
        profit: result.profit,
        stepId: currentStep.id,
        stepIndex: originalStepIndex,
        tierTriggered,
        actionTaken,
      });

      return {
        finalBankroll: useAdvancedMode ? bankroll + carryAmount : bankroll,
        iterations: iterations + 1,
        goalReached: false,
        maxDrawdown,
        bankrollHistory,
        spinResults,
        endReason: 'max_drawdown',
        completedCycles,
      };
    }

    // Record spin result
    spinResults.push({
      number,
      isWin: result.anyWin,
      payout: result.totalPayout,
      profit: result.profit,
      stepId: currentStep.id,
      stepIndex: originalStepIndex,
      tierTriggered,
      actionTaken,
    });

    iterations++;

    // Update bankroll check for advanced mode
    if (useAdvancedMode) {
      const total = bankroll + carryAmount;
      if (total >= strategy.targetBankroll) {
        break; // Goal reached
      }
      if (bankroll <= 0 && carryAmount <= 0) {
        break; // Bankruptcy
      }
    }
  }

  // Determine end reason
  const finalBankroll = useAdvancedMode ? bankroll + carryAmount : bankroll;
  let endReason: SingleSimulationResult['endReason'];
  if (finalBankroll <= 0) {
    endReason = 'bankruptcy';
  } else if (finalBankroll >= strategy.targetBankroll) {
    endReason = 'goal_reached';
  } else if (insufficientFunds) {
    endReason = 'insufficient_funds';
  } else {
    endReason = 'max_iterations';
  }

  return {
    finalBankroll,
    iterations,
    goalReached: finalBankroll >= strategy.targetBankroll,
    maxDrawdown,
    bankrollHistory,
    spinResults,
    endReason,
    completedCycles,
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
  } else if (betAmount === 'let-it-ride') {
    amountStr = 'Let It Ride';
  } else if (betAmount === 'bullet') {
    amountStr = 'Bullet';
  } else if (betAmount === 'carry') {
    amountStr = 'Carry';
  } else if (betAmount === 'carry_split') {
    amountStr = 'Split Carry';
  } else {
    amountStr = 'Unknown';
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
