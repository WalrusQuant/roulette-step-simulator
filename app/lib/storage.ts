import {
  SavedData,
  BettingStrategy,
  SimulationResults,
  UserPreferences
} from './types';
import { PRELOADED_STRATEGIES } from './preloadedStrategies';

const STORAGE_KEY = 'roulette-simulator-data';
const STORAGE_VERSION = '1.0.0';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSimulationCount: 1000,
  chartType: 'line',
  theme: 'dark',
  showProbabilities: true,
  animateSimulations: true,
};

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get default saved data structure
 */
function getDefaultData(): SavedData {
  return {
    strategies: [],
    simulationHistory: [],
    userPreferences: DEFAULT_PREFERENCES,
    version: STORAGE_VERSION,
  };
}

/**
 * Load all data from localStorage
 */
export function loadData(): SavedData {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return getDefaultData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultData();
    }

    const data = JSON.parse(raw) as SavedData;

    // Migration logic for version changes
    if (data.version !== STORAGE_VERSION) {
      // Handle migrations here
      data.version = STORAGE_VERSION;
      saveData(data);
    }

    return data;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return getDefaultData();
  }
}

/**
 * Save all data to localStorage
 */
export function saveData(data: SavedData): boolean {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return false;
  }

  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Consider clearing old data.');
    } else {
      console.error('Error saving data to localStorage:', error);
    }
    return false;
  }
}

/**
 * Save a strategy (create or update)
 */
export function saveStrategy(strategy: BettingStrategy): boolean {
  const data = loadData();
  const existingIndex = data.strategies.findIndex(s => s.id === strategy.id);

  if (existingIndex >= 0) {
    data.strategies[existingIndex] = {
      ...strategy,
      modifiedAt: Date.now(),
    };
  } else {
    data.strategies.push({
      ...strategy,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });
  }

  return saveData(data);
}

/**
 * Delete a strategy by ID
 */
export function deleteStrategy(strategyId: string): boolean {
  const data = loadData();
  data.strategies = data.strategies.filter(s => s.id !== strategyId);
  return saveData(data);
}

/**
 * Get a strategy by ID (checks both user strategies and preloaded)
 */
export function getStrategy(strategyId: string): BettingStrategy | null {
  const data = loadData();
  const userStrategy = data.strategies.find(s => s.id === strategyId);
  if (userStrategy) return userStrategy;

  const preloaded = PRELOADED_STRATEGIES.find(s => s.id === strategyId);
  return preloaded || null;
}

/**
 * Get all strategies (user + preloaded)
 */
export function getAllStrategies(): BettingStrategy[] {
  const data = loadData();
  return [...PRELOADED_STRATEGIES, ...data.strategies];
}

/**
 * Get only user-created strategies
 */
export function getUserStrategies(): BettingStrategy[] {
  const data = loadData();
  return data.strategies;
}

/**
 * Save simulation results
 */
export function saveSimulationResult(result: SimulationResults): boolean {
  const data = loadData();

  // Keep only the last 50 simulation results to prevent quota issues
  if (data.simulationHistory.length >= 50) {
    data.simulationHistory = data.simulationHistory.slice(-49);
  }

  data.simulationHistory.push(result);
  return saveData(data);
}

/**
 * Get simulation history
 */
export function getSimulationHistory(): SimulationResults[] {
  const data = loadData();
  return data.simulationHistory;
}

/**
 * Clear simulation history
 */
export function clearSimulationHistory(): boolean {
  const data = loadData();
  data.simulationHistory = [];
  return saveData(data);
}

/**
 * Get user preferences
 */
export function getUserPreferences(): UserPreferences {
  const data = loadData();
  return data.userPreferences || DEFAULT_PREFERENCES;
}

/**
 * Save user preferences
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): boolean {
  const data = loadData();
  data.userPreferences = {
    ...data.userPreferences,
    ...preferences,
  };
  return saveData(data);
}

/**
 * Clear all data
 */
export function clearAllData(): boolean {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Export data as JSON string for backup
 */
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as SavedData;

    // Validate basic structure
    if (!data.strategies || !Array.isArray(data.strategies)) {
      throw new Error('Invalid data structure: missing strategies array');
    }

    return saveData({
      ...data,
      version: STORAGE_VERSION,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

/**
 * Duplicate a strategy with a new ID
 */
export function duplicateStrategy(strategyId: string): BettingStrategy | null {
  const original = getStrategy(strategyId);
  if (!original) return null;

  const newStrategy: BettingStrategy = {
    ...original,
    id: `${original.id}-copy-${Date.now()}`,
    name: `${original.name} (Copy)`,
    isPreloaded: false,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };

  const success = saveStrategy(newStrategy);
  return success ? newStrategy : null;
}
