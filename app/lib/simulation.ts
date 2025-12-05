import {
  BettingStrategy,
  SimulationResults,
  SingleSimulationResult,
  StepStatistics,
  TierOutcome,
} from './types';
import { runSingleSimulation, calculateExpectedValue } from './roulette';

export interface SimulationProgress {
  current: number;
  total: number;
  percent: number;
  currentResult?: SingleSimulationResult;
}

export type ProgressCallback = (progress: SimulationProgress) => void;

/**
 * Run multiple simulations and aggregate results
 */
export async function runSimulations(
  strategy: BettingStrategy,
  numSimulations: number,
  onProgress?: ProgressCallback,
  batchSize: number = 100
): Promise<SimulationResults> {
  const allSimulations: SingleSimulationResult[] = [];
  const finalBankrolls: number[] = [];

  let successCount = 0;
  let bankruptcyCount = 0;
  let totalIterationsToSuccess = 0;
  let totalMaxDrawdown = 0;
  let totalCompletedCycles = 0;

  // Initialize step statistics tracking
  const stepStatsMap: Map<number, {
    stepId: string;
    timesReached: number;
    timesWon: number;
    timesLost: number;
    tierOutcomes: Map<string, { count: number; totalPayout: number }>;
  }> = new Map();

  // Initialize map with all steps from strategy
  strategy.steps.forEach((step, index) => {
    stepStatsMap.set(index, {
      stepId: step.id,
      timesReached: 0,
      timesWon: 0,
      timesLost: 0,
      tierOutcomes: new Map(),
    });
  });

  for (let i = 0; i < numSimulations; i++) {
    const result = runSingleSimulation(strategy);
    allSimulations.push(result);
    finalBankrolls.push(result.finalBankroll);

    if (result.goalReached) {
      successCount++;
      totalIterationsToSuccess += result.iterations;
    }

    // Count both true bankruptcy (bankroll <= 0) and insufficient funds as bankruptcies
    // since insufficient_funds means unable to continue betting (functional bankruptcy)
    if (result.endReason === 'bankruptcy' || result.endReason === 'insufficient_funds') {
      bankruptcyCount++;
    }

    totalMaxDrawdown += result.maxDrawdown;
    totalCompletedCycles += result.completedCycles;

    // Aggregate step statistics from spin results
    for (const spin of result.spinResults) {
      const stepStats = stepStatsMap.get(spin.stepIndex);
      if (stepStats) {
        stepStats.timesReached++;

        if (spin.isWin) {
          stepStats.timesWon++;

          // Track tier outcomes if tier was triggered
          if (spin.tierTriggered) {
            const tierStats = stepStats.tierOutcomes.get(spin.tierTriggered);
            if (tierStats) {
              tierStats.count++;
              tierStats.totalPayout += spin.payout;
            } else {
              stepStats.tierOutcomes.set(spin.tierTriggered, {
                count: 1,
                totalPayout: spin.payout,
              });
            }
          }
        } else {
          stepStats.timesLost++;
        }
      }
    }

    // Report progress at each batch
    if (onProgress && (i + 1) % batchSize === 0) {
      onProgress({
        current: i + 1,
        total: numSimulations,
        percent: ((i + 1) / numSimulations) * 100,
        currentResult: result,
      });

      // Yield to main thread to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      current: numSimulations,
      total: numSimulations,
      percent: 100,
    });
  }

  // Calculate statistics
  const avgFinalBankroll = finalBankrolls.reduce((a, b) => a + b, 0) / numSimulations;
  const successRate = (successCount / numSimulations) * 100;
  const avgIterationsToSuccess = successCount > 0
    ? totalIterationsToSuccess / successCount
    : 0;
  const profitCount = finalBankrolls.filter(b => b > strategy.initialBankroll).length;
  const maxDrawdownAvg = totalMaxDrawdown / numSimulations;
  const avgCompletedCycles = totalCompletedCycles / numSimulations;

  // Calculate expected value per spin
  let totalEV = 0;
  for (const step of strategy.steps) {
    totalEV += calculateExpectedValue(step.bets);
  }
  const expectedValue = totalEV / strategy.steps.length;

  // Create distribution buckets for histogram
  const distribution = createDistribution(finalBankrolls, 20);

  // Convert step statistics map to array
  const stepStatistics: StepStatistics[] = Array.from(stepStatsMap.entries())
    .map(([stepIndex, stats]) => ({
      stepIndex,
      stepId: stats.stepId,
      timesReached: stats.timesReached,
      timesWon: stats.timesWon,
      timesLost: stats.timesLost,
      tierOutcomes: Array.from(stats.tierOutcomes.entries()).map(([tierName, data]) => ({
        tierName,
        count: data.count,
        totalPayout: data.totalPayout,
      })),
    }))
    .sort((a, b) => a.stepIndex - b.stepIndex);

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    numSimulations,
    successRate,
    avgFinalBankroll,
    avgIterationsToSuccess,
    bankruptcyCount,
    profitCount,
    maxDrawdownAvg,
    expectedValue,
    finalBankrollDistribution: distribution,
    allSimulations,
    timestamp: Date.now(),
    stepStatistics,
    avgCompletedCycles,
  };
}

/**
 * Create distribution buckets for histogram
 */
function createDistribution(values: number[], numBuckets: number): number[] {
  if (values.length === 0) return Array(numBuckets).fill(0);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const bucketSize = range / numBuckets;

  const distribution = Array(numBuckets).fill(0);

  for (const value of values) {
    let bucketIndex = Math.floor((value - min) / bucketSize);
    if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
    distribution[bucketIndex]++;
  }

  return distribution;
}

/**
 * Calculate risk of ruin (probability of losing entire bankroll)
 */
export function calculateRiskOfRuin(results: SimulationResults): number {
  return (results.bankruptcyCount / results.numSimulations) * 100;
}

/**
 * Calculate variance of final bankroll
 */
export function calculateVariance(results: SimulationResults): number {
  const mean = results.avgFinalBankroll;
  const squaredDiffs = results.allSimulations.map(
    sim => Math.pow(sim.finalBankroll - mean, 2)
  );
  return squaredDiffs.reduce((a, b) => a + b, 0) / results.numSimulations;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(results: SimulationResults): number {
  return Math.sqrt(calculateVariance(results));
}

/**
 * Calculate Sharpe-like ratio (return/risk)
 */
export function calculateRiskAdjustedReturn(
  results: SimulationResults,
  initialBankroll: number
): number {
  const avgReturn = results.avgFinalBankroll - initialBankroll;
  const stdDev = calculateStandardDeviation(results);
  if (stdDev === 0) return 0;
  return avgReturn / stdDev;
}

/**
 * Get percentile value from simulation results
 */
export function getPercentile(results: SimulationResults, percentile: number): number {
  const sorted = [...results.allSimulations]
    .map(s => s.finalBankroll)
    .sort((a, b) => a - b);

  const index = Math.floor((percentile / 100) * sorted.length);
  return sorted[Math.min(index, sorted.length - 1)];
}

/**
 * Get summary statistics
 */
export function getSummaryStats(results: SimulationResults, initialBankroll: number) {
  const sortedBankrolls = results.allSimulations
    .map(s => s.finalBankroll)
    .sort((a, b) => a - b);

  return {
    min: sortedBankrolls[0],
    max: sortedBankrolls[sortedBankrolls.length - 1],
    median: sortedBankrolls[Math.floor(sortedBankrolls.length / 2)],
    mean: results.avgFinalBankroll,
    stdDev: calculateStandardDeviation(results),
    variance: calculateVariance(results),
    riskOfRuin: calculateRiskOfRuin(results),
    riskAdjustedReturn: calculateRiskAdjustedReturn(results, initialBankroll),
    percentile5: getPercentile(results, 5),
    percentile25: getPercentile(results, 25),
    percentile75: getPercentile(results, 75),
    percentile95: getPercentile(results, 95),
  };
}

/**
 * Compare two strategies
 */
export function compareStrategies(
  results1: SimulationResults,
  results2: SimulationResults
) {
  return {
    successRateDiff: results1.successRate - results2.successRate,
    avgBankrollDiff: results1.avgFinalBankroll - results2.avgFinalBankroll,
    riskOfRuinDiff: calculateRiskOfRuin(results1) - calculateRiskOfRuin(results2),
    evDiff: results1.expectedValue - results2.expectedValue,
    strategy1Better: {
      successRate: results1.successRate > results2.successRate,
      avgBankroll: results1.avgFinalBankroll > results2.avgFinalBankroll,
      riskOfRuin: calculateRiskOfRuin(results1) < calculateRiskOfRuin(results2),
      ev: results1.expectedValue > results2.expectedValue,
    },
  };
}
